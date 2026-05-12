-- =============================================
-- AGENDA WHATSAPP — Schema Supabase
-- Ejecutar en: Supabase > SQL Editor
-- =============================================

-- Negocio (una fila por instalación)
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_number text not null,
  whatsapp_message_template text not null default
    'Hola {nombre} 👋 Te recordamos tu cita en *{negocio}* el {fecha} a las {hora}h.
    
Servicio: {servicio}

Por favor confirma tu asistencia:',
  reminder_hours_before integer default 24,
  timezone text default 'Europe/Madrid',
  created_at timestamptz default now()
);

-- Clientes
create table clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  created_at timestamptz default now(),
  unique(business_id, phone)
);

-- Servicios
create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  duration integer not null default 60,
  color text default '#c8f03d'
);

-- Citas
create table appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  date date not null,
  time time not null,
  duration integer not null default 60,
  service text not null,
  status text default 'pending' check (status in ('pending','confirmed','cancelled')),
  notes text default '',
  whatsapp_sent boolean default false,
  confirm_token uuid default gen_random_uuid() unique,
  created_at timestamptz default now()
);

-- Índices
create index on appointments(business_id, date);
create index on appointments(confirm_token);
create index on clients(business_id);

-- =============================================
-- Datos iniciales de ejemplo
-- Sustituye el business_id con el real tras crearlo
-- =============================================

insert into businesses (name, whatsapp_number, whatsapp_message_template)
values (
  'Mi Centro',
  '+34600000000',
  'Hola {nombre} 👋 Te recordamos tu cita en *{negocio}* el {fecha} a las {hora}h.

Servicio: {servicio}

Por favor confirma tu asistencia:'
);
