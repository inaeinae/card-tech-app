begin;
select plan(3);

-- 버킷 존재
select is(
  (select name from storage.buckets where id = 'card-images'),
  'card-images',
  'card-images bucket exists'
);

-- 정책 존재
select is(
  (select count(*)::int from pg_policies
   where schemaname = 'storage' and tablename = 'objects'
     and policyname like 'card_images_%'),
  4,
  'card-images has 4 policies (select/insert/update/delete)'
);

-- 경로 파싱: insert 정책이 첫 세그먼트 == auth.uid() 강제
select ok(
  exists(
    select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='card_images_insert'
      and with_check like '%auth.uid()%foldername%'
  ),
  'insert policy enforces first segment == auth.uid()'
);

select * from finish();
rollback;
