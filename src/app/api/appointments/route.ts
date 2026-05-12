import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { buildMessage, sendWhatsApp } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const body = await req.json()
  const { business_id, client_name, client_phone, date, time, duration, service, notes } = body

  if (!business_id || !client_name || !client_phone || !date || !time || !service) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  // 1. Upsert cliente
  const { data: client, error: clientError } = await db
    .from('clients')
    .upsert({ business_id, name: client_name, phone: client_phone }, { onConflict: 'business_id,phone' })
    .select()
    .single()

  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 })

  // 2. Crear cita
  const { data: appointment, error: aptError } = await db
    .from('appointments')
    .insert({ business_id, client_id: client.id, date, time, duration: duration || 60, service, notes: notes || '', status: 'pending' })
    .select('*, client:clients(*)')
    .single()

  if (aptError) return NextResponse.json({ error: aptError.message }, { status: 500 })

  // 3. Obtener configuración del negocio
  const { data: business } = await db
    .from('businesses')
    .select('*')
    .eq('id', business_id)
    .single()

  if (!business) return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })

  // 4. Enviar WhatsApp
  const message = buildMessage(business, appointment)
  const waResult = await sendWhatsApp(client_phone, message)

  // 5. Marcar whatsapp_sent
  if (waResult.success) {
    await db.from('appointments').update({ whatsapp_sent: true }).eq('id', appointment.id)
  }

  return NextResponse.json({
    appointment: { ...appointment, whatsapp_sent: waResult.success },
    whatsapp: waResult,
  })
}

export async function GET(req: NextRequest) {
  const db = supabaseAdmin()
  const { searchParams } = new URL(req.url)
  const business_id = searchParams.get('business_id')
  const date = searchParams.get('date')

  if (!business_id) return NextResponse.json({ error: 'business_id requerido' }, { status: 400 })

  let query = db
    .from('appointments')
    .select('*, client:clients(id, name, phone)')
    .eq('business_id', business_id)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (date) query = query.eq('date', date)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ appointments: data })
}
