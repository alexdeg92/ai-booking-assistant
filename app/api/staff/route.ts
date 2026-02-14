import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Staff, Service, StaffWithServices } from '@/lib/types'

export async function GET() {
  try {
    // Get all active staff with their services
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select(`
        *,
        staff_services (
          service_id,
          services (
            id,
            code,
            name,
            duration_minutes,
            price_cents,
            icon
          )
        )
      `)
      .eq('is_active', true)
      .order('name')

    if (staffError) {
      console.error('Database error:', staffError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    // Transform the data to flatten the services relationship
    const staffWithServices: StaffWithServices[] = staffData?.map((staff: any) => ({
      id: staff.id,
      code: staff.code,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      specialty: staff.specialty,
      avatar_emoji: staff.avatar_emoji || '👨‍💼',
      is_active: staff.is_active,
      created_at: staff.created_at,
      updated_at: staff.updated_at,
      services: staff.staff_services?.map((ss: any) => ss.services) || []
    })) || []

    return NextResponse.json({
      success: true,
      staff: staffWithServices
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}