// 닉네임 수정 화면
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Colors, Fonts } from '@/constants/theme';
import { useProfileStore } from '@/stores/profileStore';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export default function ProfileEditScreen() {
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];

  const profile = useProfileStore((s) => s.profile);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const upsertNickname = useProfileStore((s) => s.upsertNickname);

  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // profile 로드 후 초기값 세팅
  useEffect(() => {
    if (profile?.nickname != null) setValue(profile.nickname);
  }, [profile?.nickname]);

  async function onSave() {
    setSaving(true);
    try {
      await upsertNickname(value);
      router.back();
    } catch (e) {
      Alert.alert('저장 실패', e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 13, fontFamily: Fonts.semibold, color: C.ink3, marginBottom: 8 }}>
        닉네임
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="닉네임을 입력하세요 (최대 20자)"
        placeholderTextColor={C.ink4}
        maxLength={20}
        accessibilityLabel="닉네임 입력"
        style={{
          fontSize: 16,
          fontFamily: Fonts.medium,
          color: C.ink,
          backgroundColor: C.surface,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: C.borderStrong,
        }}
      />
      <Pressable
        onPress={onSave}
        disabled={saving || value.trim().length === 0}
        accessibilityRole="button"
        accessibilityLabel="닉네임 저장"
        style={({ pressed }) => ({
          marginTop: 24,
          backgroundColor: pressed ? C.primaryPressed : C.primary,
          opacity: saving || value.trim().length === 0 ? 0.5 : 1,
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
        })}
      >
        <Text style={{ fontSize: 15, fontFamily: Fonts.bold, color: '#FFFFFF' }}>
          {saving ? '저장 중…' : '저장'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
