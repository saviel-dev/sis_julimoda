-- ============================================================
-- Esquema de base de datos de JuliModa para Supabase
-- Ejecuta este SQL en: Supabase → SQL Editor → New Query
-- ============================================================

-- Tabla de productos del inventario
create table public.productos (
  id            text primary key,
  nombre        text not null,
  descripcion   text,
  categoria     text not null,
  precio_compra numeric(10,2) not null default 0,
  precio        numeric(10,2) not null,
  moneda        text not null check (moneda in ('USD', 'VES')),
  stock         integer not null default 0,
  foto          text,
  tallas        jsonb not null default '[]',
  creado_en     timestamptz not null default now()
);

-- Tabla de ventas registradas
create table public.ventas (
  id          text primary key default gen_random_uuid()::text,
  fecha       timestamptz not null default now(),
  productos   text not null,
  total       numeric(10,2) not null,
  moneda      text not null check (moneda in ('USD', 'VES')),
  estado      text not null check (estado in ('Completada', 'Pendiente')) default 'Pendiente',
  usuario_id  uuid references auth.users(id)
);

-- Habilitar Row Level Security
alter table public.productos enable row level security;
alter table public.ventas    enable row level security;

-- Políticas: solo usuarios autenticados pueden leer y escribir
create policy "Leer productos autenticado"
  on public.productos for select
  using (auth.role() = 'authenticated');

create policy "Gestionar productos autenticado"
  on public.productos for all
  using (auth.role() = 'authenticated');

create policy "Leer ventas autenticado"
  on public.ventas for select
  using (auth.role() = 'authenticated');

create policy "Gestionar ventas autenticado"
  on public.ventas for all
  using (auth.role() = 'authenticated');
