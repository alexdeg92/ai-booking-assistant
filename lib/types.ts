// Database Types
export interface Service {
  id: string
  code: string
  name: string
  description?: string
  duration_minutes: number
  price_cents: number
  icon?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Staff {
  id: string
  code: string
  name: string
  email?: string
  phone?: string
  specialty?: string
  avatar_emoji?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Booking {
  id: string
  booking_reference: string
  customer_id: string
  service_id: string
  staff_id?: string | null
  assigned_staff_id?: string | null
  booking_date: string
  booking_time: string
  duration_minutes: number
  price_cents: number
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  customer_name: string
  customer_email?: string
  customer_phone?: string
  notes?: string
  reminder_sent_24h?: boolean
  reminder_sent_1h?: boolean
  email_confirmation_sent?: boolean
  created_at?: string
  updated_at?: string
}

export interface Availability {
  id: string
  staff_id: string
  day_of_week: number // 0=Sunday, 6=Saturday
  start_time: string
  end_time: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface BlockedTime {
  id: string
  staff_id?: string | null
  title: string
  description?: string
  start_datetime: string
  end_datetime: string
  is_recurring?: boolean
  recurrence_rule?: string
  created_at?: string
  updated_at?: string
}

// API Request/Response Types
export interface CreateBookingRequest {
  serviceCode: string
  staffCode?: string | null // 'any' for no preference
  date: string // YYYY-MM-DD
  time: string // HH:MM
  customerName: string
  customerEmail?: string
  customerPhone?: string
  notes?: string
}

export interface CreateBookingResponse {
  success: boolean
  booking?: Booking & {
    service: Service
    staff?: Staff
    assigned_staff?: Staff
  }
  error?: string
}

export interface AvailabilityRequest {
  serviceCode: string
  staffCode?: string | null
  date: string // YYYY-MM-DD
}

export interface TimeSlot {
  time: string // HH:MM
  available: boolean
  staff_id?: string
}

export interface AvailabilityResponse {
  success: boolean
  timeSlots?: TimeSlot[]
  error?: string
}

export interface StaffWithServices extends Staff {
  services?: Service[]
}

// Frontend state types (matching existing component)
export interface BookingState {
  step: number
  selectedService: string | null
  selectedStylist: string | null
  selectedDate: number | null
  selectedTime: string | null
}