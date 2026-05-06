export const ISSUERS = [
  'BC카드',
  '하나카드',
  '신한카드',
  '국민카드',
  '현대카드',
  '삼성카드',
  '롯데카드',
  '우리카드',
  '씨티카드',
  '농협카드',
  '카카오뱅크',
  '토스뱅크',
  '케이뱅크',
  '기타',
] as const;

export type Issuer = (typeof ISSUERS)[number];
