import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Service } from '@/lib/types'

export async function GET() {
  try {
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch services' },
        { status: 500 }
      )
    }

    // Transform price from cents to display format
    const servicesWithDisplayPrice = services?.map((service: Service) => ({
      ...service,
      price: `${(service.price_cents / 100).toFixed(0)}$`,
      duration: `${service.duration_minutes} min`
    })) || []

    return NextResponse.json({
      success: true,
      services: servicesWithDisplayPrice
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}