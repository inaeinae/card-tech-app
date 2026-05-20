// 카드사 선택 — 범용 Select 래퍼. 다크모드 토큰 통일.
import { Select } from '@/components/ui/Select';
import { ISSUERS } from '@/lib/issuers';

type Props = {
  value: string;
  onChange: (v: string) => void;
  errorText?: string;
};

export function IssuerSelect({ value, onChange, errorText }: Props) {
  const options = ISSUERS.map((i) => ({ value: i, label: i }));
  return (
    <Select
      label="카드사"
      required
      placeholder="카드사를 선택하세요"
      value={value}
      options={options}
      onChange={onChange}
      errorText={errorText}
    />
  );
}
