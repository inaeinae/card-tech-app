-- card-images 버킷 (private)
insert into storage.buckets (id, name, public)
values ('card-images', 'card-images', false)
on conflict (id) do nothing;

-- 경로 규칙: {user_id}/{card_id}/{filename}
-- storage.foldername(name) → text[]  (예: ['uuid','uuid'])

create policy "card_images_select" on storage.objects
  for select using (
    bucket_id = 'card-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "card_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'card-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "card_images_update" on storage.objects
  for update using (
    bucket_id = 'card-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "card_images_delete" on storage.objects
  for delete using (
    bucket_id = 'card-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
