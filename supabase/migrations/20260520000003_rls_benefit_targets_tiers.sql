-- Phase 5.3 — RLS for card_benefit_targets / card_benefit_cap_tiers

alter table public.card_benefit_targets enable row level security;
alter table public.card_benefit_cap_tiers enable row level security;

create policy "own_rows_select" on public.card_benefit_targets
  for select using (auth.uid() = user_id);
create policy "own_rows_insert" on public.card_benefit_targets
  for insert with check (auth.uid() = user_id);
create policy "own_rows_update" on public.card_benefit_targets
  for update using (auth.uid() = user_id);
create policy "own_rows_delete" on public.card_benefit_targets
  for delete using (auth.uid() = user_id);

create policy "own_rows_select" on public.card_benefit_cap_tiers
  for select using (auth.uid() = user_id);
create policy "own_rows_insert" on public.card_benefit_cap_tiers
  for insert with check (auth.uid() = user_id);
create policy "own_rows_update" on public.card_benefit_cap_tiers
  for update using (auth.uid() = user_id);
create policy "own_rows_delete" on public.card_benefit_cap_tiers
  for delete using (auth.uid() = user_id);
