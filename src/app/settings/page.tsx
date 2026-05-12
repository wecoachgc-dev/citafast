'use client'
import { useState, useEffect } from 'react'

const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID || ''

const DEFAULT_TEMPLATE = `Hola {nombre} 👋 Te recordamos tu cita en *{negocio}* el {fecha} a las {hora}h.

Servicio: {servicio}

Por favor confirma tu asistencia:`

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: '',
    whatsapp_number: '',
    whatsapp_message_template: DEFAULT_TEMPLATE,
    reminder_hours_before: 24,
    timezone: 'Europe/Madrid',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/settings?id=${BUSINESS_ID}`)
      .then(r => r.json())
      .then(d => { if (d.business) setForm(d.business) })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: BUSINESS_ID, ...form }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const preview = form.whatsapp_message_template
    .replace('{nombre}', 'Carlos')
    .replace('{negocio}', form.name || 'Mi Centro')
    .replace('{fecha}', 'lunes 16 de junio')
    .replace('{hora}', '10:30')
    .replace('{servicio}', 'Consulta general')

  if (loading) return <Screen><div style={{ color: '#555', textAlign: 'center', paddingTop: 100 }}>Cargando...</div></Screen>

  return (
    <Screen>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <a href="/" style={{ color: '#555', fontSize: 20, textDecoration: 'none' }}>←</a>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Configuración</h1>
        </div>

        <Section title="Datos del negocio">
          <Field label="Nombre del centro">
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Clínica Dental García" />
          </Field>
          <Field label="Número WhatsApp (con prefijo)">
            <input style={inputStyle} value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="+34600000000" />
          </Field>
        </Section>

        <Section title="Mensaje de confirmación WhatsApp">
          <div style={{ fontSize: 12, color: '#555', marginBottom: 10, lineHeight: 1.6 }}>
            Variables disponibles: <code style={{ color: '#c8f03d' }}>{'{nombre}'}</code> <code style={{ color: '#c8f03d' }}>{'{negocio}'}</code> <code style={{ color: '#c8f03d' }}>{'{fecha}'}</code> <code style={{ color: '#c8f03d' }}>{'{hora}'}</code> <code style={{ color: '#c8f03d' }}>{'{servicio}'}</code>
          </div>
          <textarea
            style={{ ...inputStyle, height: 140, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
            value={form.whatsapp_message_template}
            onChange={e => set('whatsapp_message_template', e.target.value)}
          />
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Vista previa (el sistema añade los enlaces automáticamente)</div>
            <div style={{ background: '#0f1f00', border: '1px solid #1a3500', borderRadius: 10, padding: 14, fontSize: 13, color: '#c8f03d', fontFamily: 'monospace', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {preview}{'\n\n✅ Confirmar: [enlace]\n❌ Cancelar: [enlace]'}
            </div>
          </div>
        </Section>

        <Section title="Recordatorio automático">
          <Field label="Horas antes de la cita para enviar recordatorio">
            <select style={inputStyle} value={form.reminder_hours_before} onChange={e => set('reminder_hours_before', Number(e.target.value))}>
              <option value={2}>2 horas antes</option>
              <option value={12}>12 horas antes</option>
              <option value={24}>24 horas antes</option>
              <option value={48}>48 horas antes</option>
            </select>
          </Field>
          <div style={{ fontSize: 12, color: '#444', marginTop: -8 }}>
            Requiere configurar un cron job en Vercel. Ver documentación de despliegue.
          </div>
        </Section>

        <button onClick={save} disabled={saving}
          style={{ background: '#c8f03d', color: '#000', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? .6 : 1 }}>
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif" }}>{children}</div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #1e1e1e' }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '.06em', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8,
  padding: '9px 12px', color: '#f0f0f0', fontSize: 14, fontFamily: 'inherit', outline: 'none',
}
