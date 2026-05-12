import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string; action: string } }
) {
  const db = supabaseAdmin()
  const { token, action } = params

  if (!['yes', 'no'].includes(action)) {
    return new NextResponse('Enlace inválido', { status: 400 })
  }

  // Buscar cita por token
  const { data: appointment, error } = await db
    .from('appointments')
    .select('*, client:clients(name), business:businesses(name)')
    .eq('confirm_token', token)
    .single()

  if (error || !appointment) {
    return new NextResponse('Cita no encontrada', { status: 404 })
  }

  if (appointment.status !== 'pending') {
    return new NextResponse(renderPage(
      appointment.business.name,
      appointment.client.name,
      appointment.status,
      appointment.date,
      appointment.time
    ), { headers: { 'Content-Type': 'text/html' } })
  }

  const newStatus = action === 'yes' ? 'confirmed' : 'cancelled'
  await db.from('appointments').update({ status: newStatus }).eq('id', appointment.id)

  return new NextResponse(renderPage(
    appointment.business.name,
    appointment.client.name,
    newStatus,
    appointment.date,
    appointment.time
  ), { headers: { 'Content-Type': 'text/html' } })
}

function renderPage(business: string, client: string, status: string, date: string, time: string) {
  const isConfirmed = status === 'confirmed'
  const emoji = isConfirmed ? '✅' : '❌'
  const msg = isConfirmed
    ? `Tu cita ha sido <strong>confirmada</strong>.`
    : `Tu cita ha sido <strong>cancelada</strong>.`
  const color = isConfirmed ? '#F0A500' : '#ff4444'
  const [y, m, d] = date.split('-')
  const dateFormatted = `${d}/${m}/${y}`

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CitaFast — ${business}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:system-ui,sans-serif;background:#0a0a0a;color:#f0f0f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .card{background:#141414;border:1px solid #2a2a2a;border-radius:16px;padding:40px 32px;max-width:400px;width:100%;text-align:center}
  .emoji{font-size:56px;margin-bottom:16px}
  .business{font-size:13px;color:#666;margin-bottom:8px;text-transform:uppercase;letter-spacing:.08em}
  h1{font-size:22px;font-weight:600;margin-bottom:12px}
  p{color:#999;font-size:15px;line-height:1.6}
  .detail{background:#1e1e1e;border-radius:10px;padding:14px 18px;margin:20px 0;font-size:14px;color:#ccc}
  .detail strong{color:${color}}
  .accent{color:${color}}
</style>
</head>
<body>
<div class="card">
  <div class="emoji">${emoji}</div>
  <div class="business">${business}</div>
  <h1 class="accent">${isConfirmed ? '¡Cita confirmada!' : 'Cita cancelada'}</h1>
  <p>${msg}</p>
  <div class="detail">
    📅 ${dateFormatted} a las <strong>${time}h</strong><br>
    👤 ${client}
  </div>
  <p style="font-size:13px;color:#555">Puedes cerrar esta ventana.</p>
</div>
</body>
</html>`
}
