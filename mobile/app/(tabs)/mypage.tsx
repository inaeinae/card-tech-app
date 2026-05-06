import { Alert, Pressable, SafeAreaView, ScrollView, Switch, Text, View } from 'react-native';
import {
  Bell, ChevronRight, FileText, Info,
  LogOut, Moon, Shield, Trash2, User,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BaseItem = {
  icon: React.ReactNode;
  label: string;
};

type ActionItem = BaseItem & {
  kind: 'action';
  onPress: () => void;
  destructive?: boolean;
};

type ToggleItem = BaseItem & {
  kind: 'toggle';
  value: boolean;
  onToggle: (v: boolean) => void;
};

type SettingItem = ActionItem | ToggleItem;

type Section = {
  title: string;
  items: SettingItem[];
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
  const isDestructive = item.kind === 'action' && item.destructive;

  if (item.kind === 'toggle') {
    return (
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          padding: 16,
          backgroundColor: '#FFFFFF',
          borderTopWidth: hasDivider ? 1 : 0,
          borderTopColor: '#F2F4F6',
        }}
      >
        {item.icon}
        <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: '#191F28' }}>
          {item.label}
        </Text>
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E8EB', true: '#3182F6' }}
          thumbColor="#FFFFFF"
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={item.onPress}
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
      {!isDestructive && <ChevronRight size={16} color="#B0B8C1" />}
    </Pressable>
  );
}

export default function MyPageScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const sections: Section[] = [
    {
      title: '서비스 설정',
      items: [
        {
          kind: 'action',
          icon: <Bell size={20} color="#4E5968" />,
          label: '알림 설정',
          onPress: () => {},
        },
        {
          kind: 'toggle',
          icon: <Moon size={20} color="#4E5968" />,
          label: '다크모드',
          value: isDark,
          onToggle: () => {},
        },
      ],
    },
    {
      title: '앱 정보',
      items: [
        {
          kind: 'action',
          icon: <Shield size={20} color="#4E5968" />,
          label: '개인정보처리방침',
          onPress: () => {},
        },
        {
          kind: 'action',
          icon: <FileText size={20} color="#4E5968" />,
          label: '이용약관',
          onPress: () => {},
        },
        {
          kind: 'action',
          icon: <Info size={20} color="#4E5968" />,
          label: '앱 정보',
          onPress: () => {},
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          kind: 'action',
          icon: <LogOut size={20} color="#4E5968" />,
          label: '로그아웃',
          onPress: () => {
            Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
              { text: '취소', style: 'cancel' },
              { text: '로그아웃', onPress: signOut },
            ]);
          },
        },
        {
          kind: 'action',
          icon: <Trash2 size={20} color="#FF4D4F" />,
          label: '회원 탈퇴',
          onPress: () => {
            Alert.alert('회원 탈퇴', '계정과 모든 데이터가 영구 삭제됩니다.', [
              { text: '취소', style: 'cancel' },
              { text: '탈퇴', style: 'destructive', onPress: deleteAccount },
            ]);
          },
          destructive: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 헤더 */}
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
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#191F28' }}>
              {user?.email ?? '사용자'}
            </Text>
            <Text style={{ fontSize: 13, color: '#8B95A1', marginTop: 2 }}>카카오 로그인</Text>
          </View>
          <Pressable
            onPress={() => {}}
            style={{
              paddingHorizontal: 12, paddingVertical: 6,
              borderRadius: 8, borderWidth: 1, borderColor: '#E5E8EB',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#4E5968' }}>수정</Text>
          </Pressable>
        </View>

        {/* 섹션별 설정 목록 */}
        {sections.map((section) => (
          <SectionGroup key={section.title} section={section} />
        ))}

        {/* 앱 버전 */}
        <Text style={{ textAlign: 'center', color: '#B0B8C1', fontSize: 12, marginTop: 8 }}>
          v1.0.0 · 카테크
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
