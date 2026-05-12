import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { buildMessage, sendWhatsApp } from '@/lib/whatsapp'
import { format, addHours } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

// Vercel llama a este endpoint cada hora según vercel.json
export async function GET(req: NextRequest) {
  // Seguridad básica: Vercel añade este header en los cron jobs
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = supabaseAdmin()

  // Obtener todos los negocios
  const { data: businesses } = await db.from('businesses').select('*')
  if (!businesses) return NextResponse.json({ sent: 0 })

  let totalSent = 0

  for (const business of businesses) {
    const tz = business.timezone || 'Europe/Madrid'
    const now = toZonedTime(new Date(), tz)
    const targetTime = addHours(now, business.reminder_hours_before)
    const targetDate = format(targetTime, 'yyyy-MM-dd')
    const targetHour = format(targetTime, 'HH')

    // Citas en la ventana de tiempo sin recordatorio enviado
    const { data: appointments } = await db
      .from('appointments')
      .select('*, client:clients(*)')
      .eq('business_id', business.id)
      .eq('date', targetDate)
      .eq('status', 'pending')
      .eq('whatsapp_sent', false)
      .gte('time', `${targetHour}:00`)
      .lt('time', `${String(Number(targetHour) + 1).padStart(2, '0')}:00`)

    if (!appointments) continue

    for (const apt of appointments) {
      const message = buildMessage(business, apt)
      const result = await sendWhatsApp(apt.client.phone, message)
      if (result.success) {
        await db.from('appointments').update({ whatsapp_sent: true }).eq('id', apt.id)
        totalSent++
      }
    }
  }

  return NextResponse.json({ sent: totalSent, timestamp: new Date().toISOString() })
}
