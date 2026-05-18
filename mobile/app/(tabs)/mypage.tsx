import { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import {
  Bell, ChevronRight, FileText, Info,
  LogOut, Moon, Shield, Trash2, User,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';
import { ThemeModeSheet } from '@/components/mypage/ThemeModeSheet';

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
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: '#8B95A1', marginBottom: 8, paddingHorizontal: 4 }}>
        {section.title}
      </Text>
      <View style={{ borderRadius: 16, borderWidth: 1, borderColor: '#E5E8EB', overflow: 'hidden' }}>
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
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 16,
        backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
        borderTopWidth: hasDivider ? 1 : 0,
        borderTopColor: '#F2F4F6',
      })}
    >
      {item.icon}
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: isDestructive ? '#FF4D4F' : '#191F28' }}>
        {item.label}
      </Text>
      {item.right ?? (!isDestructive && <ChevronRight size={16} color="#B0B8C1" />)}
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

  const themeMode = useThemeStore((s) => s.mode);

  const [themeSheetVisible, setThemeSheetVisible] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const displayName = profile?.nickname?.trim() || user?.email || '사용자';

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
          icon: <Bell size={20} color="#4E5968" />,
          label: '알림 설정',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress: () => router.push('/settings/notifications' as any),
        },
        {
          icon: <Moon size={20} color="#4E5968" />,
          label: '다크모드',
          right: (
            <Text style={{ fontSize: 13, color: '#8B95A1', fontWeight: '500' }}>
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
          icon: <Shield size={20} color="#4E5968" />,
          label: '개인정보처리방침',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress: () => router.push('/settings/about' as any),
        },
        {
          icon: <FileText size={20} color="#4E5968" />,
          label: '이용약관',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress: () => router.push('/settings/about' as any),
        },
        {
          icon: <Info size={20} color="#4E5968" />,
          label: '앱 정보',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onPress: () => router.push('/settings/about' as any),
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          icon: <LogOut size={20} color="#4E5968" />,
          label: '로그아웃',
          onPress: onSignOut,
        },
        {
          icon: <Trash2 size={20} color="#FF4D4F" />,
          label: '회원 탈퇴',
          onPress: onDeleteAccount,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#191F28' }}>마이</Text>
        </View>

        {/* 프로필 카드 */}
        <View
          style={{
            marginHorizontal: 16, marginBottom: 24, padding: 20,
            borderRadius: 20, backgroundColor: '#FFFFFF',
            flexDirection: 'row', alignItems: 'center', gap: 16,
            borderWidth: 1, borderColor: '#E5E8EB',
          }}
        >
          <View
            style={{
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#E8F2FE', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <User size={28} color="#3182F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#191F28' }} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={{ fontSize: 13, color: '#8B95A1', marginTop: 2 }}>카카오 로그인</Text>
          </View>
          <Pressable
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onPress={() => router.push('/settings/profile' as any)}
            accessibilityRole="button"
            accessibilityLabel="프로필 수정"
            style={{
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 8, borderWidth: 1, borderColor: '#E5E8EB',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#4E5968' }}>수정</Text>
          </Pressable>
        </View>

        {sections.map((section) => (
          <SectionGroup key={section.title} section={section} />
        ))}

        <Text style={{ textAlign: 'center', color: '#B0B8C1', fontSize: 12, marginTop: 8 }}>
          v1.0.0 · 카테크
        </Text>
      </ScrollView>

      <ThemeModeSheet
        visible={themeSheetVisible}
        onClose={() => setThemeSheetVisible(false)}
      />
    </SafeAreaView>
  );
}
