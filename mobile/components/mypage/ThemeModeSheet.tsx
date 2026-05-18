// 다크모드 tri-state 선택 — system/light/dark
import { Modal, Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Fonts } from '@/constants/theme';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

const OPTIONS: { mode: ThemeMode; label: string; desc: string }[] = [
  { mode: 'system', label: '시스템 설정 따름', desc: 'OS 다크모드를 그대로 사용' },
  { mode: 'light', label: '라이트', desc: '항상 밝은 테마' },
  { mode: 'dark', label: '다크', desc: '항상 어두운 테마' },
];

export function ThemeModeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const scheme = useResolvedColorScheme();
  const C = Colors[scheme];
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  async function onPick(next: ThemeMode) {
    await setMode(next);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="배경 탭하여 닫기"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}
      >
        <Pressable
          // 시트 영역 탭은 닫히지 않도록 stop propagation
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: C.bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
            paddingBottom: 32,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: Fonts.bold,
              color: C.ink,
              paddingHorizontal: 8,
              paddingVertical: 12,
            }}
          >
            테마
          </Text>
          {OPTIONS.map((opt) => {
            const selected = mode === opt.mode;
            return (
              <Pressable
                key={opt.mode}
                onPress={() => onPick(opt.mode)}
                accessibilityRole="button"
                accessibilityLabel={`${opt.label}${selected ? ', 선택됨' : ''}`}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  backgroundColor: pressed ? C.surface : 'transparent',
                  borderRadius: 12,
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: Fonts.semibold, color: C.ink }}>
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: Fonts.medium, color: C.ink3, marginTop: 2 }}>
                    {opt.desc}
                  </Text>
                </View>
                {selected && <Check size={20} color={C.primary} />}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
