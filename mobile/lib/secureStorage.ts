// Supabase 세션 저장용 어댑터 — iOS Keychain / Android EncryptedSharedPrefs 기반
// SecureStore 는 2KB 제한 → JWT 만 저장, 큰 값은 분할 저장해야 하지만 v1 JWT 는 1KB 내외라 무분할

import * as SecureStore from 'expo-secure-store';

export const secureStorageAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
