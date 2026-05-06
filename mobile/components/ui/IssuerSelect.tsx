import { ActionSheetIOS, Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { ISSUERS } from '@/lib/issuers';

type Props = {
  value: string;
  onChange: (v: string) => void;
  errorText?: string;
};

export function IssuerSelect({ value, onChange, errorText }: Props) {
  function open() {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['취소', ...ISSUERS], cancelButtonIndex: 0, title: '카드사 선택' },
      (idx) => {
        if (idx > 0) onChange(ISSUERS[idx - 1]);
      },
    );
  }

  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 14, fontWeight: '500', color: '#4E5968' }}>
        카드사{' '}
        <Text style={{ color: '#FF4D4F' }}>*</Text>
      </Text>
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="카드사 선택"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: errorText ? '#FF4D4F' : pressed ? '#3182F6' : '#E5E8EB',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: '#FFFFFF',
        })}
      >
        <Text style={{ fontSize: 16, color: value ? '#191F28' : '#B0B8C1' }}>
          {value || '카드사를 선택하세요'}
        </Text>
        <ChevronDown size={16} color="#8B95A1" />
      </Pressable>
      {errorText ? (
        <Text style={{ fontSize: 12, color: '#FF4D4F' }}>{errorText}</Text>
      ) : null}
    </View>
  );
}
