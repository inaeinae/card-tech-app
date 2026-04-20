# Supabase Backend

## 로컬 실행

```bash
supabase start      # Docker 스택 기동 (DB, Auth, Storage, Edge Runtime)
supabase db reset   # migrations 재적용 + seed
supabase stop       # 스택 중지
```

## 테스트

```bash
supabase test db                               # pgTap SQL 테스트
deno test supabase/functions/kakao-oauth/     # Edge Function 테스트
```

## 환경변수

`supabase/.env.example`를 복사해 `supabase/.env`를 만들고 채운다.

## Edge Function 배포

```bash
supabase functions deploy kakao-oauth
supabase secrets set KAKAO_REST_API_KEY=xxxx
# SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY는 플랫폼이 자동 주입
```

## 마이그레이션 순서

1. `20260420000001_init_schema.sql` — Enum/테이블/기본 인덱스
2. `20260420000002_rls_policies.sql` — RLS 전면 적용
3. `20260420000003_storage_policies.sql` — card-images 버킷
4. `20260420000004_indexes.sql` — 리포트 인덱스
