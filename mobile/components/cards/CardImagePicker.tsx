// 카드 이미지 선택 + 1024px 리사이즈 + JPEG 70% 압축
// 결과로 로컬 파일 URI 를 onChange 로 전달 — 업로드는 상위에서 수행
import { useState } from 'react';
import { Alert, Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, ImagePlus } from 'lucide-react-native';

type Props = {
  value: string | null;
  onChange: (uri: string | null) => void;
  accessibilityLabel?: string;
};

const MAX_WIDTH = 1024;

export function CardImagePicker({ value, onChange, accessibilityLabel }: Props) {
  const [busy, setBusy] = useState(false);

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('권한이 필요합니다', '설정에서 사진 접근을 허용해주세요.');
      return;
    }
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        aspect: [16, 10],
      });
      if (result.canceled || !result.assets[0]) return;
      const resized = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: MAX_WIDTH } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
      );
      onChange(resized.uri);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="gap-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? '카드 이미지 선택'}
        onPress={pickFromLibrary}
        disabled={busy}
        className="h-48 rounded-lg bg-muted dark:bg-muted-dark items-center justify-center overflow-hidden"
      >
        {value ? (
          <Image source={{ uri: value }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View className="items-center gap-2">
            <ImagePlus size={32} color="#94A3B8" />
            <Text className="text-muted-foreground">이미지 선택</Text>
          </View>
        )}
      </Pressable>
      {value && (
        <Pressable
          onPress={() => onChange(null)}
          accessibilityRole="button"
          accessibilityLabel="이미지 제거"
          className="self-end"
        >
          <Text className="text-destructive">이미지 제거</Text>
        </Pressable>
      )}
      <Pressable
        onPress={pickFromLibrary}
        accessibilityRole="button"
        accessibilityLabel="다른 이미지 선택"
        className="flex-row items-center gap-2 self-start"
      >
        <Camera size={16} color="#94A3B8" />
        <Text className="text-muted-foreground">갤러리에서 선택</Text>
      </Pressable>
    </View>
  );
}
