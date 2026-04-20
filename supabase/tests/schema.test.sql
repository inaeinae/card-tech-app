begin;
select plan(25);

-- Enum 타입
select has_type('public', 'event_status', 'event_status enum exists');
select has_type('public', 'benefit_type', 'benefit_type enum exists');
select has_type('public', 'notification_kind', 'notification_kind enum exists');

-- 테이블 존재
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'cards', 'cards table exists');
select has_table('public', 'card_benefits', 'card_benefits table exists');
select has_table('public', 'events', 'events table exists');
select has_table('public', 'event_status_history', 'history table exists');
select has_table('public', 'benefits', 'benefits table exists');
select has_table('public', 'notification_preferences', 'notif prefs table exists');
select has_table('public', 'scheduled_notifications', 'scheduled notif table exists');

-- 핵심 컬럼 (회귀 방지)
select has_column('public', 'profiles', 'notify_time_of_day', 'profiles.notify_time_of_day exists');
select has_column('public', 'cards',    'last_event_at',      'cards.last_event_at exists');
select has_column('public', 'events',   'payout_expected_period', 'events.payout_expected_period exists');
select has_column('public', 'events',   'warning_dismissed',  'events.warning_dismissed exists');
select has_column('public', 'benefits', 'conditions',         'benefits.conditions exists');
select has_column('public', 'benefits', 'disqualified',       'benefits.disqualified exists');
select has_column('public', 'event_status_history', 'is_auto', 'history.is_auto exists');

-- 기본값
select col_default_is('public', 'events', 'status', 'registered', 'events.status default is registered');
select col_default_is('public', 'benefits', 'type', 'cashback', 'benefits.type default is cashback');

-- FK
select col_is_fk('public', 'cards',    'user_id', 'cards.user_id is FK');
select col_is_fk('public', 'events',   'card_id', 'events.card_id is FK');
select col_is_fk('public', 'benefits', 'event_id','benefits.event_id is FK');

-- 인덱스
select has_index('public', 'events', 'idx_events_status', 'events status composite index');
select has_index('public', 'benefits', 'idx_benefits_user_paid', 'benefits partial index exists');

select * from finish();
rollback;
