// Supabase 클라이언트 싱글톤
// 세션은 SecureStore 에 영속, autoRefreshToken 활성, URL 세션 감지 비활성 (RN 환경)

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { env } from './env';
import { secureStorageAdapter } from './secureStorage';

export const supabase = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
