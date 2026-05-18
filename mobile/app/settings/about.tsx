// 앱 정보 — 버전 + 약관/개인정보 외부 링크
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { openBrowserAsync } from 'expo-web-browser';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

// v1 정책 URL 미수립 — Phase 13 (출시 준비) 에 URL 확정 후 채워넣기
const TERMS_URL = '';
const PRIVACY_URL = '';

async function openOrAlert(url: string, label: string) {
  if (!url) {
    Alert.alert(label, '아직 준비 중입니다. 곧 공개됩니다.');
    return;
  }
  await openBrowserAsync(url);
}

export default function AboutScreen() {
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const rows: { label: string; right: React.ReactNode; onPress?: () => void }[] = [
    { label: '앱 버전', right: <Text style={{ color: C.ink3, fontFamily: Fonts.medium }}>v{version}</Text> },
    {
      label: '이용약관',
      right: <ChevronRight size={16} color={C.ink4} />,
      onPress: () => openOrAlert(TERMS_URL, '이용약관'),
    },
    {
      label: '개인정보 처리방침',
      right: <ChevronRight size={16} color={C.ink4} />,
      onPress: () => openOrAlert(PRIVACY_URL, '개인정보 처리방침'),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.borderStrong,
          overflow: 'hidden',
        }}
      >
        {rows.map((row, idx) => (
          <Pressable
            key={row.label}
            onPress={row.onPress}
            disabled={!row.onPress}
            accessibilityRole={row.onPress ? 'button' : 'text'}
            accessibilityLabel={row.label}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              backgroundColor: pressed ? C.surface2 : 'transparent',
              borderTopWidth: idx > 0 ? 1 : 0,
              borderTopColor: C.border,
            })}
          >
            <Text style={{ fontSize: 15, fontFamily: Fonts.semibold, color: C.ink }}>
              {row.label}
            </Text>
            {row.right}
          </Pressable>
        ))}
      </View>
      <Text
        style={{
          textAlign: 'center',
          color: C.ink4,
          fontFamily: Fonts.medium,
          fontSize: 12,
          marginTop: 24,
        }}
      >
        카테크 · v{version}
      </Text>
    </ScrollView>
  );
}
