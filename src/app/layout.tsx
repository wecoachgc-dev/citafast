import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CitaFast — Confirmaciones automáticas por WhatsApp',
  description: 'Agenda de citas con confirmación automática por WhatsApp. Rápido, simple y sin complicaciones.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
