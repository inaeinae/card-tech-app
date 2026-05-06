import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import {
  Bell, ChevronRight, FileText, Info,
  LogOut, Moon, Shield, Trash2, User,
} from 'lucide-react-native';
import { useAuthStore } from '@/stores/authStore';

type SettingItem = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

export default function MyPageScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const settings: SettingItem[] = [
    {
      icon: <Bell size={20} color="#4E5968" />,
      label: '알림 설정',
      onPress: () => {},
    },
    {
      icon: <Moon size={20} color="#4E5968" />,
      label: '다크모드',
      onPress: () => {},
    },
    {
      icon: <Shield size={20} color="#4E5968" />,
      label: '개인정보처리방침',
      onPress: () => {},
    },
    {
      icon: <FileText size={20} color="#4E5968" />,
      label: '이용약관',
      onPress: () => {},
    },
    {
      icon: <Info size={20} color="#4E5968" />,
      label: '앱 정보',
      onPress: () => {},
    },
    {
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
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 헤더 */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#191F28' }}>마이</Text>
        </View>

        {/* 프로필 카드 */}
        <View style={{ marginHorizontal: 16, marginBottom: 24, padding: 20, borderRadius: 20, backgroundColor: '#F9FAFB', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8F2FE', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} color="#3182F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#191F28' }}>
              {user?.email ?? '사용자'}
            </Text>
            <Text style={{ fontSize: 13, color: '#8B95A1', marginTop: 2 }}>카카오 로그인</Text>
          </View>
          <Pressable
            onPress={() => {}}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#E5E8EB' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#4E5968' }}>수정</Text>
          </Pressable>
        </View>

        {/* 설정 목록 */}
        <View style={{ marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E8EB', overflow: 'hidden' }}>
          {settings.map((item, idx) => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 14,
                padding: 16,
                backgroundColor: pressed ? '#F9FAFB' : '#FFFFFF',
                borderTopWidth: idx === 0 ? 0 : 1,
                borderTopColor: '#F2F4F6',
              })}
            >
              {item.icon}
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: item.destructive ? '#FF4D4F' : '#191F28' }}>
                {item.label}
              </Text>
              <ChevronRight size={16} color="#B0B8C1" />
            </Pressable>
          ))}
        </View>

        {/* 앱 버전 */}
        <Text style={{ textAlign: 'center', color: '#B0B8C1', fontSize: 12, marginTop: 24 }}>
          v1.0.0 · 카테크
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
