import twilio from 'twilio'
import { Appointment, Business } from '@/types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM = process.env.TWILIO_WHATSAPP_FROM!
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

/**
 * Construye el mensaje usando la plantilla del negocio.
 * Variables disponibles: {nombre}, {negocio}, {fecha}, {hora}, {servicio}
 */
export function buildMessage(
  business: Business,
  appointment: Appointment & { client: { name: string } }
): string {
  const date = parseISO(appointment.date)
  const fecha = format(date, "EEEE d 'de' MMMM", { locale: es })
  const hora = appointment.time

  const confirmUrl = `${APP_URL}/api/confirm/${appointment.confirm_token}/yes`
  const cancelUrl = `${APP_URL}/api/confirm/${appointment.confirm_token}/no`

  const base = business.whatsapp_message_template
    .replace('{nombre}', appointment.client.name.split(' ')[0])
    .replace('{negocio}', business.name)
    .replace('{fecha}', fecha)
    .replace('{hora}', hora)
    .replace('{servicio}', appointment.service)

  return `${base}

✅ Confirmar: ${confirmUrl}
❌ Cancelar: ${cancelUrl}`
}

/**
 * Envía el mensaje de WhatsApp vía Twilio.
 * Para cambiar a otro proveedor: reemplaza solo esta función.
 */
export async function sendWhatsApp(
  toPhone: string,
  message: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    const to = `whatsapp:${toPhone.startsWith('+') ? toPhone : '+' + toPhone}`
    const msg = await client.messages.create({
      from: FROM,
      to,
      body: message,
    })
    return { success: true, sid: msg.sid }
  } catch (err: any) {
    console.error('Twilio error:', err.message)
    return { success: false, error: err.message }
  }
}
