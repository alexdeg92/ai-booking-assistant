import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CreateBookingRequest, CreateBookingResponse, Booking } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json()
    
    const {
      serviceCode,
      staffCode,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      notes
    } = body

    // Validate required fields
    if (!serviceCode || !date || !time || !customerName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date and time
    const bookingDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (isNaN(bookingDate.getTime()) || bookingDate < today) {
      return NextResponse.json(
        { success: false, error: 'Invalid date or date in the past' },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return NextResponse.json(
        { success: false, error: 'Invalid time format (use HH:MM)' },
        { status: 400 }
      )
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .eq('code', serviceCode)
      .eq('is_active', true)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Find available staff
    let assignedStaffId: string | null = null
    
    if (staffCode && staffCode !== 'any') {
      // Specific staff requested
      const { data: requestedStaff, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('code', staffCode)
        .eq('is_active', true)
        .single()

      if (staffError || !requestedStaff) {
        return NextResponse.json(
          { success: false, error: 'Requested staff member not found' },
          { status: 404 }
        )
      }

      assignedStaffId = requestedStaff.id
    } else {
      // Find any available staff for this service
      const dayOfWeek = bookingDate.getDay()
      
      const { data: availableStaff, error: staffError } = await supabase
        .from('staff')
        .select(`
          id,
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

      if (staffError || !availableStaff || availableStaff.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No staff available for this service on this day' },
          { status: 400 }
        )
      }

      // Pick the first available staff member for now
      // In a more sophisticated system, you might use load balancing
      assignedStaffId = availableStaff[0].id
    }

    // Double-check availability using our database function
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('is_staff_available', {
        p_staff_id: assignedStaffId,
        p_date: date,
        p_start_time: time,
        p_duration_minutes: service.duration_minutes
      })

    if (availabilityError) {
      console.error('Availability check error:', availabilityError)
      return NextResponse.json(
        { success: false, error: 'Failed to check availability' },
        { status: 500 }
      )
    }

    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Selected time slot is no longer available' },
        { status: 409 }
      )
    }

    // Create customer record (or get existing)
    let customerId: string
    
    if (customerEmail) {
      // Try to find existing customer by email
      const { data: existingCustomer, error: customerFindError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerEmail)
        .single()

      if (existingCustomer && !customerFindError) {
        customerId = existingCustomer.id
        
        // Update customer info if provided
        await supabase
          .from('customers')
          .update({
            name: customerName,
            phone: customerPhone,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId)
      } else {
        // Create new customer
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from('customers')
          .insert({
            name: customerName,
            email: customerEmail,
            phone: customerPhone
          })
          .select('id')
          .single()

        if (customerCreateError || !newCustomer) {
          console.error('Customer creation error:', customerCreateError)
          return NextResponse.json(
            { success: false, error: 'Failed to create customer record' },
            { status: 500 }
          )
        }

        customerId = newCustomer.id
      }
    } else {
      // No email provided, create customer record anyway
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from('customers')
        .insert({
          name: customerName,
          phone: customerPhone
        })
        .select('id')
        .single()

      if (customerCreateError || !newCustomer) {
        console.error('Customer creation error:', customerCreateError)
        return NextResponse.json(
          { success: false, error: 'Failed to create customer record' },
          { status: 500 }
        )
      }

      customerId = newCustomer.id
    }

    // Generate booking reference
    const { data: bookingReference, error: refError } = await supabase
      .rpc('generate_booking_reference')

    if (refError || !bookingReference) {
      console.error('Booking reference generation error:', refError)
      return NextResponse.json(
        { success: false, error: 'Failed to generate booking reference' },
        { status: 500 }
      )
    }

    // Create the booking
    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_reference: bookingReference,
        customer_id: customerId,
        service_id: service.id,
        staff_id: staffCode && staffCode !== 'any' ? assignedStaffId : null,
        assigned_staff_id: assignedStaffId,
        booking_date: date,
        booking_time: time,
        duration_minutes: service.duration_minutes,
        price_cents: service.price_cents,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        notes: notes,
        status: 'confirmed'
      })
      .select(`
        *,
        service:services (
          id,
          code,
          name,
          duration_minutes,
          price_cents,
          icon
        ),
        assigned_staff:staff!assigned_staff_id (
          id,
          code,
          name,
          specialty,
          avatar_emoji
        )
      `)
      .single()

    if (bookingError || !newBooking) {
      console.error('Booking creation error:', bookingError)
      return NextResponse.json(
        { success: false, error: 'Failed to create booking' },
        { status: 500 }
      )
    }

    // TODO: Send confirmation email here
    // You would implement email sending using nodemailer or your preferred email service

    const response: CreateBookingResponse = {
      success: true,
      booking: newBooking
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get recent bookings for admin view
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services (
          name,
          icon
        ),
        assigned_staff:staff!assigned_staff_id (
          name,
          avatar_emoji
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      bookings: bookings || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}