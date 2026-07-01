-- Archivo: sql/alter-notifications-add-admin-name.sql
-- Agrega la columna admin_name a la tabla notifications existente.
-- Ejecutar en el editor SQL de Supabase.

alter table if exists public.notifications
  add column if not exists admin_name text;

-- Opcional: copia el valor del email a admin_name si todavía no se cargó.
update public.notifications
set admin_name = admin_email
where admin_name is null;
