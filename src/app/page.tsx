'use client'
import { useState, useEffect, useCallback } from 'react'
import { format, addDays, startOfWeek, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Appointment } from '@/types'
import NewAppointmentModal from '@/components/calendar/NewAppointmentModal'
import AppointmentDetail from '@/components/calendar/AppointmentDetail'
import MiniCalendar from '@/components/calendar/MiniCalendar'
import DayView from '@/components/calendar/DayView'

// En producción esto viene de env o auth. Por ahora hardcoded para instalación simple.
const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID || ''

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [notification, setNotification] = useState('')

  const fetchAppointments = useCallback(async () => {
    if (!BUSINESS_ID) return
    setLoading(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const res = await fetch(`/api/appointments?business_id=${BUSINESS_ID}&date=${dateStr}`)
    const data = await res.json()
    setAppointments(data.appointments || [])
    setLoading(false)
  }, [selectedDate])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const notify = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(''), 3500)
  }

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchAppointments()
    setSelectedApt(null)
    notify(status === 'confirmed' ? '✓ Cita confirmada' : 'Cita cancelada')
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    fetchAppointments()
    setSelectedApt(null)
    notify('Cita eliminada')
  }

  const handleNewSaved = () => {
    setShowNew(false)
    fetchAppointments()
    notify('✓ Cita creada — WhatsApp enviado')
  }

  const totalToday = appointments.length
  const confirmed = appointments.filter(a => a.status === 'confirmed').length
  const pending = appointments.filter(a => a.status === 'pending').length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gridTemplateRows: 'auto 1fr', minHeight: '100vh', background: '#0a0a0a', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <header style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid #1e1e1e', background: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, background: '#F0A500', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#000' }}>CF</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-.02em' }}>
              <span style={{ color: '#4CAF50' }}>✓</span>
              <span style={{ color: '#808080' }}>Cita</span>
              <span style={{ color: '#F0A500' }}>Fast</span>
            </div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>Confirmaciones automáticas por WhatsApp</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Pill label={`${totalToday} hoy`} />
          <Pill label={`${confirmed} confirmadas`} accent />
          <Pill label={`${pending} pendientes`} warn={pending > 0} />
          <a href="/settings" style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#888', textDecoration: 'none' }}>⚙ Config</a>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside style={{ background: '#111', borderRight: '1px solid #1e1e1e', padding: '20px 16px', overflowY: 'auto' }}>
        <button
          onClick={() => setShowNew(true)}
          style={{ width: '100%', background: '#c8f03d', color: '#000', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 20, fontFamily: 'inherit' }}
        >
          + Nueva cita
        </button>
        <MiniCalendar
          selected={selectedDate}
          onChange={setSelectedDate}
          appointments={[]}
        />
      </aside>

      {/* MAIN */}
      <main style={{ padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </div>
            <div style={{ fontSize: 12, color: '#555', fontFamily: 'monospace', marginTop: 2 }}>
              {format(selectedDate, 'yyyy-MM-dd')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <NavBtn onClick={() => setSelectedDate(d => addDays(d, -1))}>←</NavBtn>
            <NavBtn onClick={() => setSelectedDate(new Date())}>Hoy</NavBtn>
            <NavBtn onClick={() => setSelectedDate(d => addDays(d, 1))}>→</NavBtn>
          </div>
        </div>

        {loading ? (
          <div style={{ color: '#555', padding: '60px 0', textAlign: 'center' }}>Cargando...</div>
        ) : (
          <DayView
            appointments={appointments}
            onSelect={setSelectedApt}
            onNew={() => setShowNew(true)}
          />
        )}
      </main>

      {/* MODALS */}
      {showNew && (
        <NewAppointmentModal
          businessId={BUSINESS_ID}
          defaultDate={format(selectedDate, 'yyyy-MM-dd')}
          onClose={() => setShowNew(false)}
          onSaved={handleNewSaved}
        />
      )}
      {selectedApt && (
        <AppointmentDetail
          appointment={selectedApt}
          onClose={() => setSelectedApt(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}

      {/* NOTIFICATION */}
      {notification && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#141414', border: '1px solid #c8f03d', borderRadius: 10, padding: '12px 18px', fontSize: 13, zIndex: 200, color: '#f0f0f0' }}>
          {notification}
        </div>
      )}
    </div>
  )
}

function Pill({ label, accent, warn }: { label: string; accent?: boolean; warn?: boolean }) {
  return (
    <div style={{ background: accent ? '#0f2000' : warn ? '#1a1000' : '#1e1e1e', border: `1px solid ${accent ? '#2a4000' : warn ? '#3a2000' : '#2a2a2a'}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, color: accent ? '#c8f03d' : warn ? '#ff8c42' : '#666' }}>
      {label}
    </div>
  )
}

function NavBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px', color: '#888', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
      {children}
    </button>
  )
}
