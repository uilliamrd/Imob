create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  type         text not null,
  title        text not null,
  body         text,
  link         text,
  metadata     jsonb,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notif_select" on public.notifications
  for select using (recipient_id = auth.uid());

create policy "notif_update" on public.notifications
  for update using (recipient_id = auth.uid());

create index on public.notifications(recipient_id, created_at desc);
create index on public.notifications(recipient_id) where read_at is null;

-- Notification preference: corretores can opt-out of new-property alerts
alter table public.profiles
  add column if not exists notif_new_property boolean not null default true;
