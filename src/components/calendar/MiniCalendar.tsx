'use client'
import { useState } from 'react'
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  selected: Date
  onChange: (d: Date) => void
  appointments: { date: string }[]
}

export default function MiniCalendar({ selected, onChange, appointments }: Props) {
  const [viewDate, setViewDate] = useState(new Date())

  const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })
  const aptDates = new Set(appointments.map(a => a.date))

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => setViewDate(d => addMonths(d, -1))} style={navStyle}>‹</button>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc' }}>
          {format(viewDate, 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={() => setViewDate(d => addMonths(d, 1))} style={navStyle}>›</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
        {['L','M','X','J','V','S','D'].map(d => (
          <div key={d} style={{ fontSize: 9, color: '#444', textAlign: 'center', fontWeight: 700, padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {days.map(day => {
          const isSelected = isSameDay(day, selected)
          const inMonth = isSameMonth(day, viewDate)
          const hasApt = aptDates.has(format(day, 'yyyy-MM-dd'))
          const todayDay = isToday(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => onChange(day)}
              style={{
                aspectRatio: '1',
                border: 'none',
                borderRadius: 6,
                background: isSelected ? '#c8f03d' : 'transparent',
                color: isSelected ? '#000' : !inMonth ? '#333' : todayDay ? '#c8f03d' : '#aaa',
                fontSize: 11,
                fontWeight: isSelected || todayDay ? 700 : 400,
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              {format(day, 'd')}
              {hasApt && !isSelected && (
                <span style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: '#c8f03d' }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const navStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18, padding: '2px 6px', borderRadius: 6,
}
