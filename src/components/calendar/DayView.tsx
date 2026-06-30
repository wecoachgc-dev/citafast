'use client'
import { Appointment } from '@/types'

interface Props {
  appointments: Appointment[]
  onSelect: (apt: Appointment) => void
  onNew: () => void
}

const STATUS_COLORS = {
  confirmed: { bg: '#0a1f00', border: '#c8f03d', text: '#c8f03d', label: '✓ Confirmada' },
  pending:   { bg: '#1a1200', border: '#ff8c42', text: '#ff8c42', label: '⏳ Pendiente' },
  cancelled: { bg: '#1f0000', border: '#ff4444', text: '#ff4444', label: '✗ Cancelada' },
}

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6:00 → 23:00

export default function DayView({ appointments, onSelect, onNew }: Props) {
  if (appointments.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: '#444', gap: 12 }}>
        <div style={{ fontSize: 40 }}>📅</div>
        <p style={{ fontSize: 14 }}>Sin citas para este día</p>
        <button onClick={onNew} style={{ background: '#c8f03d', color: '#000', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          + Añadir cita
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', border: '1px solid #1e1e1e', borderRadius: 16, overflow: 'hidden' }}>
      {/* Columna horas */}
      <div style={{ width: 56, flexShrink: 0, borderRight: '1px solid #1e1e1e', background: '#111' }}>
        {HOURS.map(h => (
          <div key={h} style={{ height: 60, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '8px 10px 0 0', fontSize: 10, color: '#444', fontFamily: 'monospace' }}>
            {String(h).padStart(2, '0')}:00
          </div>
        ))}
      </div>

      {/* Columna eventos */}
      <div style={{ flex: 1, position: 'relative', background: '#0d0d0d' }}>
        {HOURS.map(h => (
          <div key={h} style={{ height: 60, borderBottom: '1px solid #161616' }} />
        ))}

        {appointments.map(apt => {
          const [hh, mm] = apt.time.split(':').map(Number)
          const top = (hh - 7) * 60 + mm
          const height = Math.max(apt.duration, 44)
          const c = STATUS_COLORS[apt.status]
          const clientName = apt.client?.name || '—'

          return (
            <div
              key={apt.id}
              onClick={() => onSelect(apt)}
              style={{
                position: 'absolute',
                top,
                left: 8,
                right: 8,
                height,
                background: c.bg,
                borderLeft: `3px solid ${c.border}`,
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer',
                transition: 'filter .15s',
                zIndex: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              <div style={{ fontSize: 10, color: '#666', fontFamily: 'monospace' }}>{apt.time} · {apt.duration}min</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0', marginTop: 2 }}>{clientName}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{apt.service}</div>
              <span style={{ display: 'inline-block', fontSize: 10, color: c.text, background: c.bg, borderRadius: 4, padding: '2px 6px', marginTop: 4, border: `1px solid ${c.border}33` }}>
                {c.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
