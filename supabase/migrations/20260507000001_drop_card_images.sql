-- 카드 이미지 기능 제거 — image_path 컬럼 및 card-images Storage 버킷 정책 삭제
-- 주의: 원격 Supabase 프로젝트가 연결된 경우 `supabase db push` 또는
--       대시보드 SQL Editor 에서 직접 실행 필요.

-- 1. cards 테이블 컬럼 제거
alter table public.cards drop column if exists image_path;

-- 2. Storage 정책 제거
drop policy if exists "card_images_select" on storage.objects;
drop policy if exists "card_images_insert" on storage.objects;
drop policy if exists "card_images_update" on storage.objects;
drop policy if exists "card_images_delete" on storage.objects;

-- 3. 버킷 제거 (데이터가 없을 때만 안전 — 기존 이미지 파일이 있다면 수동 삭제 후 진행)
delete from storage.buckets where id = 'card-images';
