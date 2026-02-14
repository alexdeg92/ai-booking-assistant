// API utility functions for the booking system

export interface ApiService {
  id: string
  code: string
  name: string
  duration: string
  price: string
  icon: string
}

export interface ApiStaff {
  id: string
  code: string
  name: string
  specialty: string
  avatar_emoji: string
}

export interface ApiTimeSlot {
  time: string
  available: boolean
  staff_id?: string
}

export interface ApiBookingRequest {
  serviceCode: string
  staffCode?: string | null
  date: string
  time: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
}

// Fetch available services
export async function fetchServices(): Promise<ApiService[]> {
  try {
    const response = await fetch('/api/services')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch services')
    }
    
    return data.services || []
  } catch (error) {
    console.error('Error fetching services:', error)
    throw error
  }
}

// Fetch available staff
export async function fetchStaff(): Promise<ApiStaff[]> {
  try {
    const response = await fetch('/api/staff')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch staff')
    }
    
    return data.staff || []
  } catch (error) {
    console.error('Error fetching staff:', error)
    throw error
  }
}

// Fetch available time slots for a given service, staff, and date
export async function fetchAvailability(
  serviceCode: string,
  staffCode: string | null,
  date: string
): Promise<ApiTimeSlot[]> {
  try {
    const params = new URLSearchParams({
      serviceCode,
      date
    })
    
    if (staffCode && staffCode !== 'any') {
      params.append('staffCode', staffCode)
    }
    
    const response = await fetch(`/api/availability?${params.toString()}`)
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch availability')
    }
    
    return data.timeSlots || []
  } catch (error) {
    console.error('Error fetching availability:', error)
    throw error
  }
}

// Create a new booking
export async function createBooking(bookingData: ApiBookingRequest) {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create booking')
    }
    
    return data
  } catch (error) {
    console.error('Error creating booking:', error)
    throw error
  }
}

// Send confirmation email
export async function sendConfirmationEmail(bookingId: string, type: 'confirmation' | 'reminder_24h' | 'reminder_1h') {
  try {
    const response = await fetch('/api/email-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingId,
        type
      })
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to send email')
    }
    
    return data
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    throw error
  }
}