// 원 단위 정수 파싱/포매팅 — 콤마 + 공백 허용, 음수 거부, 소수 절삭
export function parseWon(text: string): number | null {
  if (typeof text !== 'string') return null;
  const cleaned = text.replace(/[\s,]/g, '');
  if (cleaned.length === 0) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

export function formatWon(n: number | null): string {
  if (n === null || n === undefined) return '';
  return new Intl.NumberFormat('ko-KR').format(n);
}
