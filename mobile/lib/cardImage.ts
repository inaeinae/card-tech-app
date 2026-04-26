// 카드 이미지 Storage 경로·업로드 헬퍼 — card-images 버킷 (private)
// 경로 규칙: {user_id}/{card_id}/card.{ext}  (RLS foldername(name)[1] = auth.uid())
import { supabase } from '@/lib/supabase';

export type CardImageExtension = 'jpg' | 'png';

const BUCKET = 'card-images';

export function buildCardImagePath(params: {
  userId: string;
  cardId: string;
  extension: CardImageExtension;
}): string {
  if (params.extension !== 'jpg' && params.extension !== 'png') {
    throw new Error(`unsupported extension: ${params.extension as string}`);
  }
  return `${params.userId}/${params.cardId}/card.${params.extension}`;
}

export function getCardImageContentType(extension: CardImageExtension): string {
  return extension === 'jpg' ? 'image/jpeg' : 'image/png';
}

// 로컬 파일 URI → ArrayBuffer 업로드 → signed URL 10분
export async function uploadCardImage(input: {
  userId: string;
  cardId: string;
  fileUri: string;
  extension: CardImageExtension;
}): Promise<{ path: string }> {
  const path = buildCardImagePath(input);
  const response = await fetch(input.fileUri);
  const blob = await response.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: getCardImageContentType(input.extension),
    upsert: true,
  });
  if (error) throw error;
  return { path };
}

export async function createCardImageSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 600);
  if (error || !data) throw error ?? new Error('signed url 생성 실패');
  return data.signedUrl;
}
