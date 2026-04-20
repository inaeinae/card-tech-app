-- RLS 활성화
alter table public.profiles                enable row level security;
alter table public.cards                   enable row level security;
alter table public.card_benefits           enable row level security;
alter table public.events                  enable row level security;
alter table public.event_status_history    enable row level security;
alter table public.benefits                enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.scheduled_notifications enable row level security;

-- profiles: id = auth.uid()
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- notification_preferences: user_id(PK) = auth.uid()
create policy "notifprefs_select_own" on public.notification_preferences
  for select using (auth.uid() = user_id);
create policy "notifprefs_insert_own" on public.notification_preferences
  for insert with check (auth.uid() = user_id);
create policy "notifprefs_update_own" on public.notification_preferences
  for update using (auth.uid() = user_id);
create policy "notifprefs_delete_own" on public.notification_preferences
  for delete using (auth.uid() = user_id);

-- 공통 패턴 (user_id 기반) — 나머지 6개 테이블에 동일하게 적용
do $$
declare
  t text;
begin
  foreach t in array array[
    'cards',
    'card_benefits',
    'events',
    'event_status_history',
    'benefits',
    'scheduled_notifications'
  ]
  loop
    execute format($f$
      create policy "own_rows_select" on public.%I
        for select using (auth.uid() = user_id);
      create policy "own_rows_insert" on public.%I
        for insert with check (auth.uid() = user_id);
      create policy "own_rows_update" on public.%I
        for update using (auth.uid() = user_id);
      create policy "own_rows_delete" on public.%I
        for delete using (auth.uid() = user_id);
    $f$, t, t, t, t);
  end loop;
end$$;
