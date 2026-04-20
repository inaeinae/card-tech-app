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
