-- Archivo: sql/create-notifications-table.sql
-- Crea la tabla `notifications` que usa el panel de administración y el dashboard.
-- Ejecutar en el editor SQL de Supabase.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  admin_email text not null,
  admin_name text not null,
  created_at timestamptz not null default now()
);

-- Concede permisos básicos a los roles de Supabase si es necesario:
-- grant select, insert on public.notifications to authenticated;
-- grant select on public.notifications to anon;
