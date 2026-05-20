import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  ChevronRight,
  FileText,
  Info,
  LogOut,
  Moon,
  Shield,
  Trash2,
  User,
} from 'lucide-react-native';
import { SafeAreaScreen } from '@/components/ui/SafeAreaScreen';
import { useAuthStore } from '@/stores/authStore';
import { useEventStore } from '@/stores/eventStore';
import { useProfileStore } from '@/stores/profileStore';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';
import { ThemeModeSheet } from '@/components/mypage/ThemeModeSheet';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';
import { Colors } from '@/constants/theme';

// 가입일로부터 경과 개월 계산 — 프로필 sub "가입 N개월 · 이벤트 N건" 표기용
function monthsSince(isoString: string | null | undefined): number {
  if (!isoString) return 0;
  const ms = Date.now() - new Date(isoString).getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (30 * 24 * 60 * 60 * 1000));
}

type SettingItem = {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
};

type Section = {
  title: string;
  items: SettingItem[];
};

const THEME_LABEL: Record<ThemeMode, string> = {
  system: '시스템',
  light: '라이트',
  dark: '다크',
};

function SectionGroup({ section }: { section: Section }) {
  return (
    <View className="mx-4 mb-6">
      <Text className="text-caption font-semibold text-ink-3 dark:text-ink-3-dark mb-2 px-1">
        {section.title}
      </Text>
      <View className="rounded-lg border border-border-strong dark:border-border-strong-dark overflow-hidden">
        {section.items.map((item, idx) => (
          <SettingRow key={item.label} item={item} hasDivider={idx > 0} />
        ))}
      </View>
    </View>
  );
}

function SettingRow({ item, hasDivider }: { item: SettingItem; hasDivider: boolean }) {
  const isDestructive = item.destructive;
  return (
    <Pressable
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      className={`flex-row items-center gap-3.5 p-4 bg-bg dark:bg-bg-dark ${
        hasDivider ? 'border-t border-border dark:border-border-dark' : ''
      }`}
    >
      {item.icon}
      <Text
        className={`flex-1 text-body font-medium ${
          isDestructive ? 'text-danger dark:text-danger-dark' : 'text-ink dark:text-ink-dark'
        }`}
      >
        {item.label}
      </Text>
      {item.right ?? null}
    </Pressable>
  );
}

export default function MyPageScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const profile = useProfileStore((s) => s.profile);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const resetProfile = useProfileStore((s) => s.reset);

  const events = useEventStore((s) => s.events);
  const loadEvents = useEventStore((s) => s.loadEvents);

  const themeMode = useThemeStore((s) => s.mode);

  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

  const [themeSheetVisible, setThemeSheetVisible] = useState(false);

  useEffect(() => {
    loadProfile();
    loadEvents();
  }, [loadProfile, loadEvents]);

  const displayName = profile?.nickname?.trim() || user?.email || '사용자';
  const joinedMonths = useMemo(() => monthsSince(user?.created_at), [user?.created_at]);
  const statsLabel =
    joinedMonths > 0
      ? `가입 ${joinedMonths}개월 · 이벤트 ${events.length}건`
      : `이벤트 ${events.length}건`;

  async function onSignOut() {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          await signOut();
          resetProfile();
        },
      },
    ]);
  }

  async function onDeleteAccount() {
    Alert.alert('회원 탈퇴', '계정과 모든 데이터가 영구 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
            resetProfile();
          } catch (e) {
            Alert.alert('탈퇴 실패', e instanceof Error ? e.message : '알 수 없는 오류');
          }
        },
      },
    ]);
  }

  const sections: Section[] = [
    {
      title: '서비스 설정',
      items: [
        {
          icon: <Bell size={20} color={C.ink2} />,
          label: '알림 설정',
          onPress: () => router.push('/settings/notifications'),
          right: <ChevronRight size={16} color={C.ink4} />,
        },
        {
          icon: <Moon size={20} color={C.ink2} />,
          label: '다크모드',
          right: (
            <Text className="text-caption font-medium text-ink-3 dark:text-ink-3-dark">
              {THEME_LABEL[themeMode]}
            </Text>
          ),
          onPress: () => setThemeSheetVisible(true),
        },
      ],
    },
    {
      title: '앱 정보',
      items: [
        {
          icon: <Shield size={20} color={C.ink2} />,
          label: '개인정보처리방침',
          onPress: () => router.push('/settings/about'),
          right: <ChevronRight size={16} color={C.ink4} />,
        },
        {
          icon: <FileText size={20} color={C.ink2} />,
          label: '이용약관',
          onPress: () => router.push('/settings/about'),
          right: <ChevronRight size={16} color={C.ink4} />,
        },
        {
          icon: <Info size={20} color={C.ink2} />,
          label: '앱 정보',
          onPress: () => router.push('/settings/about'),
          right: <ChevronRight size={16} color={C.ink4} />,
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          icon: <LogOut size={20} color={C.ink2} />,
          label: '로그아웃',
          onPress: onSignOut,
          right: <ChevronRight size={16} color={C.ink4} />,
        },
        {
          icon: <Trash2 size={20} color={C.danger} />,
          label: '회원 탈퇴',
          onPress: onDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaScreen bg="surface">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-6 pt-4 pb-2">
          <Text className="text-title font-bold text-ink dark:text-ink-dark">마이</Text>
        </View>

        {/* 프로필 카드 */}
        <View className="mx-4 mb-6 p-5 rounded-xl bg-bg dark:bg-bg-dark border border-border-strong dark:border-border-strong-dark flex-row items-center gap-4">
          <View className="w-14 h-14 rounded-full bg-primary-soft dark:bg-primary-darkSoft items-center justify-center">
            <User size={28} color={C.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-body font-bold text-ink dark:text-ink-dark" numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-caption text-ink-3 dark:text-ink-3-dark mt-0.5">
              {statsLabel}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/settings/profile')}
            accessibilityRole="button"
            accessibilityLabel="프로필 수정"
            className="px-3 py-1.5 rounded-sm border border-border-strong dark:border-border-strong-dark"
          >
            <Text className="text-caption font-semibold text-ink-2 dark:text-ink-2-dark">수정</Text>
          </Pressable>
        </View>

        {sections.map((section) => (
          <SectionGroup key={section.title} section={section} />
        ))}

        <Text className="text-center text-ink-4 dark:text-ink-4-dark text-caption mt-2">
          v1.0.0 · 카테크
        </Text>
      </ScrollView>

      <ThemeModeSheet visible={themeSheetVisible} onClose={() => setThemeSheetVisible(false)} />
    </SafeAreaScreen>
  );
}
