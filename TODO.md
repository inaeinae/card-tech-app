# 카테크 앱 — 개발 TODO

> 단계별/기능별 진척 체크리스트. 상세 설계는 `design/DESIGN.md`, `design/SCHEMA.md`, `design/UI_STRUCTURE.md` 참고.
> 원칙: TDD, 개발비용 0원 유지, iOS 우선.

---

## Phase 0. 개발 환경 셋업

- [x] Git 레포지토리 초기화 및 GitHub 연동
- [x] 설계 문서 작성 (`DESIGN.md`, `SCHEMA.md`, `UI_STRUCTURE.md`)
- [x] `CLAUDE.md` 프로젝트 규칙 정의
- [x] Supabase CLI 설치
- [x] Docker Desktop 설치 및 Supabase 로컬 스택 기동 확인
- [x] `.gitignore` 정리 (설계 메모·로컬 산출물 제외)

## Phase 1. Supabase 백엔드 기반

### 1.1 스키마 및 보안

- [x] Supabase CLI 프로젝트 초기화 (`supabase init`)
- [x] 스키마 실패 테스트 작성 (`tests/schema.test.sql`)
- [x] `20260420000001_init_schema.sql` — 테이블·관계·제약 구현
- [x] RLS 실패 테스트 작성 (`tests/rls.test.sql`)
- [x] `20260420000002_rls_policies.sql` — 사용자별 데이터 격리
- [x] Storage 정책 테스트 + `20260420000003_storage_policies.sql` (card_images/*)
- [x] `20260420000004_indexes.sql` — 리포트·캘린더 쿼리 인덱스

### 1.2 Edge Functions

- [x] `kakao-oauth` 실패 테스트 스캐폴딩
- [x] `kakao-oauth` Edge Function 구현 (access_token 검증 → Supabase JWT 반환)
- [ ] `report-aggregate` 실패 테스트 작성
- [ ] `report-aggregate` Edge Function 구현 (연/월/이벤트별 집계, 확정·예상 분리 — 카드사별 집계 제거)

### 1.3 인프라 문서화

- [x] `supabase/README.md` — 로컬 개발 워크플로우
- [x] `docs/supabase/` — 배포/마이그레이션 가이드
- [ ] Supabase 원격 프로젝트 생성 (무료 티어) — 실기기 테스트 시점에 진행
- [ ] 환경 변수 템플릿 (`.env.example`) 작성

## Phase 2. React Native 프로젝트 초기화

- [x] Expo 프로젝트 생성 (`mobile/` 하위, TS default 템플릿)
- [x] 필수 의존성 설치
  - [x] `@supabase/supabase-js`
  - [x] `zustand`
  - [x] `nativewind` + `tailwindcss`
  - [x] `expo-router` (기본 포함)
  - [x] `expo-secure-store`
  - [x] `expo-notifications`
  - [x] `react-native-calendars`
  - [x] `lucide-react-native` + `react-native-svg`
  - [x] `@react-native-seoul/kakao-login`
  - [x] `@expo-google-fonts/noto-sans-kr`
- [x] NativeWind 설정 (babel, metro, tailwind.config, global.css, nativewind-env.d.ts)
- [x] Expo Router 디렉토리 구조 스캐폴딩 — `(tabs)` 기본, `(auth)` 추가. `cards`/`events`/`wizard`/`modals` 는 해당 Phase 진입 시 생성
- [x] TypeScript 엄격 모드 확인 (`strict: true`)
- [x] ESLint + Prettier 설정 (flat config + prettier 연동)
- [x] 디자인 토큰 구현 — `design-system/카테크/MASTER.md`, `constants/theme.ts`, `tailwind.config.js` 동기화
- [x] Noto Sans KR 폰트 로드 (`app/_layout.tsx` 에서 `useFonts`)
- [x] Jest + RNTL 셋업 — `jest-expo/node` 프로젝트로 유닛 테스트 통과 확인 (`__tests__/node/theme.test.ts` 3/3)
- [x] Expo Doctor 17/17 체크 통과

## Phase 3. 공용 레이어

### 3.1 데이터 · 상태

- [x] Supabase 클라이언트 싱글톤 (`lib/supabase.ts`)
- [x] 타입 생성 (`supabase gen types typescript --local` → `lib/database.types.ts`)
- [x] 도메인 모델 별칭 (`types/models.ts` — 상태 순서·라벨 포함)
- [x] `authStore` (Zustand) — bootstrap, signInWithKakao, signOut
- [x] `cardStore` — loadCards, upsertCard, cancelCard
- [x] `eventStore` — loadEvents, upsertEvent, changeStatus (이력 로그 포함)
- [x] `wizardStore` — 위저드 임시 상태 (Step·Draft·Benefits)
- [x] `notificationStore` — prefs/scheduled 조회·갱신 골격
- [x] SecureStore 기반 세션 저장/복원 어댑터 (`lib/secureStorage.ts`)
- [x] `.env.example` · `.env.local` + `lib/env.ts` 검증 로더

### 3.2 UI 키트

- [x] `Button` (variant · size · loading · leftIcon/rightIcon)
- [x] `Input` (label · helper · error · required)
- [x] `Badge` (범용 톤) + `StatusBadge` (8상태 색상·한글 라벨)
- [x] `Card`, `PressableCard`
- [x] `EmptyState`, `LoadingState`, `ErrorState`
- [x] `ThemeToggle` (OS 연동 표시)
- [ ] `Select` — 사용 시점(Phase 5~6)에 구현 (BottomSheet 기반 예정)
- [ ] `DatePicker` — `@react-native-community/datetimepicker` 도입 시점에 구현
- [ ] 바텀시트 모달 래퍼 — `@gorhom/bottom-sheet` 도입 시점에 구현

## Phase 4. 인증 플로우

- [x] `(auth)/login.tsx` — Kakao 로그인 버튼 UI
- [x] Kakao SDK 초기화 (네이티브 설정 — Info.plist, AndroidManifest — `docs/auth/kakao-native-setup.md`)
- [x] 로그인 → Edge Function `/kakao-oauth` 호출 → JWT 주입 (`signInWithKakaoNative`)
- [x] `AuthGate` 루트 레이아웃 (로그인 여부 분기)
- [x] `(auth)/onboarding.tsx` — 첫 진입 3단계 스와이프
- [x] 로그아웃 / 토큰 만료 처리 (`SIGNED_OUT` 이벤트)
- [x] 회원 탈퇴 (`auth.users` 삭제 → cascade, `delete-account` Edge Function)
- [x] 개발용 이메일/비밀번호 백도어 (로컬 전용, `__DEV__` 가드)

## Phase 5. 카드 관리

- [x] `cards/new.tsx` — 카드 등록 폼 (카드사/이름/이미지 업로드)
- [x] Storage 업로드 훅 (`card_images/{user_id}/{card_id}`)
- [x] `cards/[id].tsx` — 상세 (기본 혜택 리스트, active/scheduled/canceled 액션)
- [x] `cards/[id]/edit.tsx` — 수정 (이미지 dirty 처리)
- [x] 카드 해지 처리 (soft delete) — active/scheduled/canceled 머신 + 복구 지원
- [x] 카드 리스트 캐러셀 컴포넌트 — ~~Phase 8 재사용~~ Phase 8 설계 변경으로 미사용, Phase 8에서 제거 예정

### 5.2 카드 상시 혜택 CRUD

- [x] `cardStore` — `upsertCardBenefit` / `deleteCardBenefit` / `draftBenefits` 액션 (`card_benefits` 테이블 CRUD)
- [x] `cards/new.tsx` — 상시 혜택 섹션 + 위저드 `template-picker?context=card` 진입, `draftBenefits` 일괄 저장
- [x] `cards/[id]/edit.tsx` — 상시 혜택 섹션 + 위저드 `template-picker?context=card&cardId={id}` 즉시 반영
- [x] `wizard/template-picker.tsx` — `context=card` 분기(`isEventOnly` 필터) + `cardId` 전파
- [x] `wizard/sub-item-picker.tsx` — `context=card` 분기 (cardStore 경유)
- [x] `wizard/benefit-form.tsx` — `context=card` 분기 (cardStore 경유)
- [x] `CardBenefitItem` — `onDelete` prop, 카드 신규/수정 양쪽 재사용

## Phase 6. 이벤트 위저드 + CRUD

### 6.1 위저드

- [x] `wizard/_layout.tsx` — 진행도 스텝퍼
- [x] `wizard/step-card.tsx` — 카드 선택
- [x] `wizard/step-info.tsx` — 기본 정보 (이벤트명, 주체, 응모·이용 기간, 중복 참여 경고)
- [x] `wizard/step-benefits.tsx` — 혜택 반복 추가
- [x] `modals/template-picker.tsx` — 템플릿 선택
- [x] `modals/sub-item-picker.tsx` — 하위 항목 (자동납부 등)
- [x] `lib/templates.ts` — `BenefitTemplate` 상수 정의
- [x] `wizard/step-review.tsx` — 최종 확인, 예상 금액 합계
- [x] 위저드 상태 유지 (부분 진행 복원)

### 6.2 이벤트 CRUD

- [x] `events/[id].tsx` — 상세 (혜택 리스트 + 상태 배지 + 이력 링크)
- [x] 이벤트 수정 (위저드 각 스텝 직접 진입)
- [x] 이벤트 삭제 (확인 모달)

## Phase 7. 상태 머신

- [x] `lib/eventStatus.ts` — 날짜 기반 상태 계산기 (`calcAutoStatus` + `suggestNextStatus`)
- [x] 자동 제안 배지 + 1탭 확정 UX (`AutoSuggestionBanner`)
- [x] `modals/status-change.tsx` — 수동 변경 확인
- [x] `events/[id]/history.tsx` — 상태 이력 뷰 (auto/manual 구분)
- [x] 재수정(이전 상태 복귀) 처리 — `ALLOWED_TRANSITIONS` 되감기 매핑
- [x] `event_status_history` insert 훅 — `upsertEvent` INSERT + `changeStatus`

## Phase 8. 홈 탭

- [x] `(tabs)/index.tsx` — 레이아웃
- [x] 상단 요약 카드 — 이번 달 예상 수령 합계 + 확정/예상 분리 표시 (이용금액 표시 금지 — 금융연동 없음)
- [x] 진행중 이벤트 목록 (카드+이벤트 세트 단위, `active` 상태만 표시)
  - 각 행: 카드사 로고 + 이벤트명 + 상태 칩 + 예상 금액
  - `eventStore.events` 에서 `payout_done` / `canceled` 제외 필터링
  - 동일 이벤트 기간에 카드 1개+이벤트 1개 세트 구조 (다중 이벤트사 동시 응모 불가)
- [x] "전체 이벤트 보기" 버튼 → EventList 화면 진입
- [x] EventList 화면 신규 (`app/events/index.tsx`)
  - 상단 필터 칩: 전체 / 진행중 / 완료 / 해지
  - 카드+이벤트 세트 전체 스크롤 목록 (해지·지급완료 포함)
  - 항목 탭 → `events/[id]` 상세 진입
- [x] `CardCarousel` 컴포넌트 제거 (`components/cards/CardCarousel.tsx` 삭제) — 이 Phase 설계에서 미사용
- [x] FAB(+) → 위저드 진입
- [x] Pull-to-refresh

## Phase 9. 캘린더 탭

- [x] `(tabs)/calendar.tsx` — 월 뷰 + "월/일정" 세그먼트 토글
- [x] 이벤트 색상 규칙 — 날짜 셀 하단 dot 마커: 응모(파랑) / 이용(주황) / 지급(초록) / 해지(회색) / 경고(빨강)
- [x] 선택 날짜 하단 해당일 이벤트 인라인 리스트 (바텀시트 → 인라인 섹션으로 변경)
- [x] 이벤트 항목 탭 → `events/[id]` 상세 진입

## Phase 10. 리포트 탭

- [ ] `(tabs)/report.tsx` — 연/월/이벤트 계층 구조
  - 상단: 기간 필터 칩 (전체 / 연도별)
  - 누적 수령 요약 카드 (확정·예상 분리)
  - 연도 헤더 → 월 카드 (해당 월 이벤트 목록 + 합계) 계층
- [ ] 확정·예상 분리 표시 (이용금액 표시 금지 — 금융연동 없음)
- [ ] Edge Function `/report-aggregate` 연동
- [ ] 빈 상태(데이터 없음) 처리

## Phase 11. 알림

- [ ] `expo-notifications` 권한 요청 플로우
- [ ] 스마트 기본값 스케줄러 (응모 마감 -1d, 실적 15/말일, 지급 -7d, 해지 -1d, 자동납부 -1d)
- [ ] 이벤트 생성/수정 시 스케줄 동기화
- [ ] 전역 on/off · 종류별 · 이벤트별 override UI
- [ ] 알림 시간대 전역 설정 (기본 09:00)
- [ ] `scheduled_notifications` 동기화 로직

## Phase 12. 마이페이지

- [ ] `(tabs)/mypage.tsx` — 프로필·설정 진입점
- [ ] 닉네임 수정
- [ ] 다크모드 수동 토글
- [ ] 알림 설정 화면
- [ ] 로그아웃
- [ ] 회원 탈퇴
- [ ] 앱 정보·버전·약관·개인정보 링크

## Phase 13. QA · 출시 준비

- [ ] 접근성 (VoiceOver 레이블, 최소 터치영역)
- [ ] i18n 기반 (ko 고정, 구조만)
- [ ] 에러 바운더리 + Sentry(무료 플랜) 연동 검토
- [ ] E2E 시나리오 (Detox 또는 Maestro — 무료 범위 확인)
- [ ] 앱 아이콘 · 스플래시 제작
- [ ] iOS TestFlight 내부 테스트
- [ ] App Store 메타데이터 (스크린샷, 설명, 개인정보처리방침)
- [ ] Android 확장 (Play Console 준비) — v1.1

## v2 이후 (범위 외 — 메모용)

- [ ] Apple / Naver 로그인
- [ ] AdMob 배너 · 전면/보상형 광고
- [ ] IAP 프리미엄 (광고 제거)
- [ ] 오프라인 동기화 / 충돌 해결
- [ ] 리치 리포트 (차트)
- [ ] 다기기 자동 동기화 고도화
