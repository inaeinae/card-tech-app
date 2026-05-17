import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors, Fonts } from '@/constants/theme';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  DEFAULT_KINDS_ENABLED,
  type KindsEnabled,
  type NotificationKind,
} from '@/types/models';

// 라이트 모드 색상 토큰 단축 참조
const C = Colors.light;

// 알림 종류별 한국어 라벨
const KIND_LABELS: Record<NotificationKind, string> = {
  apply_deadline: '응모 마감 임박',
  performance_check: '실적 체크',
  payout_upcoming: '지급 예정',
  cancel_available: '해지 가능',
  autopay_check: '자동납부 확인 (예정)',
};

// "HH:MM:SS" 문자열 → Date (오늘 날짜 + 해당 시각)
function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

// Date → "HH:MM:SS" 문자열
function dateToTimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export default function NotificationSettingsScreen() {
  const prefs = useNotificationStore((s) => s.prefs);
  const permission = useNotificationStore((s) => s.permission);
  const updatePrefs = useNotificationStore((s) => s.updatePrefs);
  const requestPermission = useNotificationStore((s) => s.requestPermission);
  const rescheduleAll = useNotificationStore((s) => s.rescheduleAll);
  const refreshPermission = useNotificationStore((s) => s.refreshPermission);

  // iOS: 피커를 인라인으로 항상 표시, Android: 토글로 표시
  const [showPicker, setShowPicker] = useState(false);

  // 화면 진입 시 권한 상태 갱신
  useEffect(() => {
    refreshPermission();
  }, [refreshPermission]);

  // kinds_enabled JSONB → 기본값 병합 후 KindsEnabled 타입으로 정규화
  const kinds: KindsEnabled = useMemo(
    () => ({ ...DEFAULT_KINDS_ENABLED, ...(prefs?.kinds_enabled as KindsEnabled | undefined) }),
    [prefs?.kinds_enabled],
  );

  const time = prefs?.time_of_day ?? '09:00:00';

  // 설정 패치 후 알림 재스케줄 공통 처리
  async function commit<T extends Partial<NonNullable<typeof prefs>>>(patch: T) {
    await updatePrefs(patch);
    await rescheduleAll();
  }

  // 전역 on/off 토글
  async function toggleGlobal(value: boolean) {
    await commit({ global_enabled: value });
  }

  // 종류별 on/off 토글
  async function toggleKind(kind: NotificationKind, value: boolean) {
    await commit({ kinds_enabled: { ...kinds, [kind]: value } });
  }

  // 시간대 변경 처리 — Android는 피커 닫기, dismissed 이벤트 무시
  async function onTimeChange(evt: DateTimePickerEvent, date?: Date) {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (evt.type === 'dismissed' || !date) return;
    await commit({ time_of_day: dateToTimeString(date) });
  }

  // prefs 미로드 상태 (초기 로딩 중)
  if (!prefs) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <Text style={{ color: C.ink3, fontFamily: Fonts.medium }}>알림 설정을 불러오는 중…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      {/* 권한 미허용 배너 — 탭하면 OS 권한 요청 */}
      {permission !== 'granted' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="알림 권한 요청"
          onPress={() => requestPermission()}
          style={{
            backgroundColor: C.surface,
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: C.borderStrong,
          }}
        >
          <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: C.ink }}>
            알림 권한이 필요합니다
          </Text>
          <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: C.ink3, marginTop: 4 }}>
            탭하여 권한을 허용하면 일정 알림이 전송됩니다.
          </Text>
        </Pressable>
      )}

      {/* 전역 on/off 토글 */}
      <Row
        label="알림 전체 사용"
        right={
          <Switch
            value={prefs.global_enabled}
            onValueChange={toggleGlobal}
            accessibilityLabel="알림 전체 사용 토글"
          />
        }
      />

      {/* 알림 시간대 선택 */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`알림 시간 ${time.slice(0, 5)}`}
        onPress={() => setShowPicker(true)}
        style={{
          backgroundColor: C.surface,
          padding: 16,
          borderRadius: 12,
          marginTop: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 14, fontFamily: Fonts.semibold, color: C.ink }}>알림 시간</Text>
        <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: C.primary }}>
          {time.slice(0, 5)}
        </Text>
      </Pressable>
      {/* DateTimePicker — iOS: spinner + 완료 버튼, Android: default dialog */}
      {showPicker && (
        <>
          <DateTimePicker
            value={timeStringToDate(time)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onTimeChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="알림 시간 선택 완료"
              onPress={() => setShowPicker(false)}
              style={{
                alignSelf: 'flex-end',
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: Fonts.bold, color: C.primary }}>완료</Text>
            </Pressable>
          )}
        </>
      )}

      {/* 알림 종류별 개별 토글 */}
      <Text
        style={{
          fontSize: 13,
          fontFamily: Fonts.bold,
          color: C.ink3,
          marginTop: 24,
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        알림 종류
      </Text>
      {(Object.keys(KIND_LABELS) as NotificationKind[]).map((kind) => (
        <Row
          key={kind}
          label={KIND_LABELS[kind]}
          // 전역 off 또는 미구현 항목(autopay_check)은 비활성화
          disabled={!prefs.global_enabled || kind === 'autopay_check'}
          right={
            <Switch
              value={prefs.global_enabled && kinds[kind]}
              disabled={!prefs.global_enabled || kind === 'autopay_check'}
              onValueChange={(v) => toggleKind(kind, v)}
              accessibilityLabel={`${KIND_LABELS[kind]} 토글`}
            />
          }
        />
      ))}

      {/* autopay_check 미구현 안내 문구 */}
      <Text
        style={{
          fontSize: 11,
          fontFamily: Fonts.medium,
          color: C.ink4,
          marginTop: 16,
          paddingHorizontal: 4,
        }}
      >
        ※ 자동납부 확인 알림은 후속 업데이트에서 활성화될 예정입니다.
      </Text>
    </ScrollView>
  );
}

// 공통 설정 행 컴포넌트 — 라벨 + 우측 컨트롤
function Row({
  label,
  right,
  disabled,
}: {
  label: string;
  right: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: C.surface,
        borderRadius: 12,
        marginBottom: 8,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ fontSize: 14, fontFamily: Fonts.semibold, color: C.ink }}>{label}</Text>
      {right}
    </View>
  );
}
