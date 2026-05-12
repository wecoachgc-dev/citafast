'use client'
import { Appointment } from '@/types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  appointment: Appointment
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
}

const STATUS = {
  confirmed: { label: '✓ Confirmada', color: '#c8f03d', bg: '#0a1f00' },
  pending:   { label: '⏳ Pendiente', color: '#ff8c42', bg: '#1a1200' },
  cancelled: { label: '✗ Cancelada', color: '#ff4444', bg: '#1f0000' },
}

export default function AppointmentDetail({ appointment: apt, onClose, onStatusChange, onDelete }: Props) {
  const s = STATUS[apt.status]
  const clientName = apt.client?.name || '—'
  const clientPhone = apt.client?.phone || '—'
  const dateFormatted = format(parseISO(apt.date), "EEEE d 'de' MMMM yyyy", { locale: es })

  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/confirm/${apt.confirm_token}/yes`
  const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/confirm/${apt.confirm_token}/no`

  const waMessage = encodeURIComponent(
    `Hola ${clientName.split(' ')[0]} 👋 Te recordamos tu cita el ${dateFormatted} a las ${apt.time}h.\n\nServicio: ${apt.service}\n\n✅ Confirmar: ${confirmLink}\n❌ Cancelar: ${cancelLink}`
  )
  const waUrl = `https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${waMessage}`

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: 16, width: 440, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{apt.service}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Cliente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 14, background: '#1a1a1a', borderRadius: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#c8f03d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#000', flexShrink: 0 }}>
              {clientName.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{clientName}</div>
              <div style={{ fontSize: 13, color: '#666' }}>{clientPhone}</div>
            </div>
          </div>

          {/* Detalles */}
          <Row icon="📅" label={dateFormatted} />
          <Row icon="⏰" label={`${apt.time}h · ${apt.duration} min`} />
          <Row icon="💼" label={apt.service} />
          {apt.notes && <Row icon="📝" label={apt.notes} />}

          {/* WhatsApp */}
          <div style={{ marginTop: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Enviar recordatorio</div>
            <a href={waUrl} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', background: '#128c7e', color: '#fff', borderRadius: 10, padding: '12px 18px', fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'background .15s' }}>
              📱 Enviar por WhatsApp
            </a>
          </div>

          {/* Acciones de estado */}
          {apt.status === 'pending' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <button onClick={() => onStatusChange(apt.id, 'confirmed')}
                style={{ background: '#0a1f00', color: '#c8f03d', border: '1px solid #1a4000', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✓ Marcar confirmada
              </button>
              <button onClick={() => onStatusChange(apt.id, 'cancelled')}
                style={{ background: '#1f0000', color: '#ff4444', border: '1px solid #3a0000', borderRadius: 8, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                ✗ Marcar cancelada
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', borderTop: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => { if (confirm('¿Eliminar esta cita?')) onDelete(apt.id) }}
            style={{ background: '#1f0000', color: '#ff4444', border: '1px solid #3a0000', borderRadius: 8, padding: '9px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            🗑 Eliminar
          </button>
          <button onClick={onClose}
            style={{ background: '#1e1e1e', color: '#888', border: '1px solid #2a2a2a', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', fontSize: 13 }}>
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ color: '#ccc', lineHeight: 1.5 }}>{label}</span>
    </div>
  )
}
