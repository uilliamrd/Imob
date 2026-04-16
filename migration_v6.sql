-- migration_v6.sql
-- Observações privadas dos usuários sobre imóveis

create table if not exists property_notes (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  property_id uuid        not null references properties(id) on delete cascade,
  note        text        not null default '',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique(user_id, property_id)
);

alter table property_notes enable row level security;

-- Users can only read/write their own notes
create policy "users_own_notes" on property_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_property_notes_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_property_notes_updated_at
  before update on property_notes
  for each row execute function update_property_notes_updated_at();
