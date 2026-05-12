'use client'
import { useState } from 'react'

interface Props {
  businessId: string
  defaultDate: string
  onClose: () => void
  onSaved: () => void
}

const SERVICES = ['Consulta general', 'Limpieza dental', 'Entrenamiento personal', 'Masaje', 'Peluquería', 'Estética', 'Fisioterapia', 'Nutrición', 'Psicología', 'Otro']
const DURATIONS = [15, 30, 45, 60, 90, 120]

export default function NewAppointmentModal({ businessId, defaultDate, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    client_name: '', client_phone: '', date: defaultDate,
    time: '09:00', duration: 60, service: 'Consulta general', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.client_name || !form.client_phone || !form.date || !form.time) {
      setError('Rellena nombre, teléfono, fecha y hora')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business_id: businessId, ...form }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al guardar'); return }
    onSaved()
  }

  return (
    <Overlay onClose={onClose}>
      <div style={modalStyle}>
        <ModalHeader title="Nueva cita" onClose={onClose} />
        <div style={{ padding: '20px 24px' }}>
          <Field label="Cliente">
            <input style={inputStyle} placeholder="Nombre completo" value={form.client_name} onChange={e => set('client_name', e.target.value)} />
          </Field>
          <Field label="Teléfono WhatsApp">
            <input style={inputStyle} placeholder="+34 6XX XXX XXX" type="tel" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha">
              <input style={inputStyle} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Hora">
              <input style={inputStyle} type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Servicio">
              <select style={inputStyle} value={form.service} onChange={e => set('service', e.target.value)}>
                {SERVICES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Duración">
              <select style={inputStyle} value={form.duration} onChange={e => set('duration', Number(e.target.value))}>
                {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notas (opcional)">
            <input style={inputStyle} placeholder="Alergias, preferencias, observaciones..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </Field>
          {error && <div style={{ color: '#ff4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        </div>
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #1e1e1e', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={ghostBtn}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{ ...primaryBtn, opacity: loading ? .6 : 1 }}>
            {loading ? 'Guardando...' : '✓ Guardar y enviar WhatsApp'}
          </button>
        </div>
      </div>
    </Overlay>
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

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>×</button>
    </div>
  )
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      {children}
    </div>
  )
}

const modalStyle: React.CSSProperties = { background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16, width: 460, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }
const inputStyle: React.CSSProperties = { width: '100%', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 12px', color: '#f0f0f0', fontSize: 14, fontFamily: 'inherit', outline: 'none' }
const primaryBtn: React.CSSProperties = { background: '#c8f03d', color: '#000', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const ghostBtn: React.CSSProperties = { background: '#1e1e1e', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '10px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }
