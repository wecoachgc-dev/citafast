export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Business {
  id: string
  name: string
  whatsapp_number: string
  whatsapp_message_template: string
  reminder_hours_before: number
  timezone: string
  created_at: string
}

export interface Client {
  id: string
  business_id: string
  name: string
  phone: string
  created_at: string
}

export interface Appointment {
  id: string
  business_id: string
  client_id: string
  client?: Client
  date: string        // YYYY-MM-DD
  time: string        // HH:mm
  duration: number    // minutos
  service: string
  status: AppointmentStatus
  notes: string
  whatsapp_sent: boolean
  confirm_token: string
  created_at: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  duration: number
  color: string
}
