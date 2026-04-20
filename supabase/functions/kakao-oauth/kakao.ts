// 카카오 /v2/user/me 응답 (필요 필드만)
export interface KakaoUser {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: { nickname?: string };
  };
}

// access_token 검증 + 사용자 정보 조회
export async function fetchKakaoUser(accessToken: string): Promise<KakaoUser> {
  const res = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`kakao_api_error:${res.status}`);
  }
  return await res.json() as KakaoUser;
}
