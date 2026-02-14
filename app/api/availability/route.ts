import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { AvailabilityRequest, AvailabilityResponse, TimeSlot } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceCode = searchParams.get('serviceCode')
    const staffCode = searchParams.get('staffCode')
    const date = searchParams.get('date') // YYYY-MM-DD

    if (!serviceCode || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: serviceCode, date' },
        { status: 400 }
      )
    }

    // Validate date format and ensure it's not in the past
    const requestDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (isNaN(requestDate.getTime()) || requestDate < today) {
      return NextResponse.json(
        { success: false, error: 'Invalid date or date in the past' },
        { status: 400 }
      )
    }

    // Get the service to know duration
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration_minutes')
      .eq('code', serviceCode)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    const dayOfWeek = requestDate.getDay() // 0=Sunday, 6=Saturday

    // Find available staff for this service
    let staffQuery = supabase
      .from('staff')
      .select(`
        id,
        code,
        name,
        availability!inner (
          day_of_week,
          start_time,
          end_time
        ),
        staff_services!inner (
          services!inner (
            code
          )
        )
      `)
      .eq('is_active', true)
      .eq('staff_services.services.code', serviceCode)
      .eq('availability.day_of_week', dayOfWeek)
      .eq('availability.is_active', true)

    // If specific staff requested, filter by staff code
    if (staffCode && staffCode !== 'any') {
      staffQuery = staffQuery.eq('code', staffCode)
    }

    const { data: availableStaff, error: staffError } = await staffQuery

    if (staffError) {
      console.error('Staff query error:', staffError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch staff availability' },
        { status: 500 }
      )
    }

    if (!availableStaff || availableStaff.length === 0) {
      return NextResponse.json({
        success: true,
        timeSlots: []
      })
    }

    // Generate time slots (30-minute intervals from 9:00 to 17:30)
    const generateTimeSlots = (): string[] => {
      const slots: string[] = []
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          if (hour === 17 && minute > 30) break // Stop at 17:30
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
          slots.push(timeString)
        }
      }
      return slots
    }

    const allTimeSlots = generateTimeSlots()
    const timeSlots: TimeSlot[] = []

    // Check availability for each time slot
    for (const time of allTimeSlots) {
      let isAvailable = false
      let availableStaffId: string | undefined

      for (const staff of availableStaff) {
        const availability = staff.availability[0] // Should only be one for this day
        if (!availability) continue

        const startTime = availability.start_time
        const endTime = availability.end_time
        
        // Calculate end time for this appointment
        const [hour, minute] = time.split(':').map(Number)
        const appointmentStart = new Date()
        appointmentStart.setHours(hour, minute, 0, 0)
        
        const appointmentEnd = new Date(appointmentStart)
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + service.duration_minutes)
        
        const endTimeStr = `${appointmentEnd.getHours().toString().padStart(2, '0')}:${appointmentEnd.getMinutes().toString().padStart(2, '0')}`

        // Check if appointment fits within working hours
        if (time >= startTime && endTimeStr <= endTime) {
          // Check for conflicts with existing bookings
          const { data: conflicts, error: conflictError } = await supabase
            .from('bookings')
            .select('booking_time, duration_minutes')
            .eq('assigned_staff_id', staff.id)
            .eq('booking_date', date)
            .eq('status', 'confirmed')

          if (!conflictError) {
            let hasConflict = false
            
            if (conflicts) {
              for (const booking of conflicts) {
                const bookingStart = booking.booking_time
                const bookingEndMinutes = parseInt(booking.booking_time.split(':')[0]) * 60 + 
                                        parseInt(booking.booking_time.split(':')[1]) + 
                                        booking.duration_minutes
                const bookingEndHour = Math.floor(bookingEndMinutes / 60)
                const bookingEndMin = bookingEndMinutes % 60
                const bookingEnd = `${bookingEndHour.toString().padStart(2, '0')}:${bookingEndMin.toString().padStart(2, '0')}`

                // Check for overlap
                if ((time < bookingEnd && endTimeStr > bookingStart)) {
                  hasConflict = true
                  break
                }
              }
            }

            if (!hasConflict) {
              isAvailable = true
              availableStaffId = staff.id
              break // Found available staff for this slot
            }
          }
        }
      }

      timeSlots.push({
        time,
        available: isAvailable,
        staff_id: availableStaffId
      })
    }

    const response: AvailabilityResponse = {
      success: true,
      timeSlots
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Availability API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}