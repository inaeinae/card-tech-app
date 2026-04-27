import { computeExpectedTotal, computeBenefitAmount } from '@/lib/benefitSum';
import type { DraftBenefit } from '@/stores/wizardStore';

describe('computeBenefitAmount', () => {
  it('expectedAmount 가 명시되면 그 값을 사용', () => {
    const b: DraftBenefit = {
      tempId: 't1',
      templateId: 'cashback',
      type: 'cashback',
      label: '페이백',
      expectedAmount: 30000,
    };
    expect(computeBenefitAmount(b)).toBe(30000);
  });

  it('subItems 가 있으면 체크된 항목 금액 합으로 대체', () => {
    const b: DraftBenefit = {
      tempId: 't1',
      templateId: 'autopay',
      type: 'discount',
      label: '자동납부',
      expectedAmount: 0,
      conditions: {
        items: [
          { label: '관리비', eligible: true, amount: 5000 },
          { label: '도시가스', eligible: true, amount: 5000 },
          { label: '전기요금', eligible: false, amount: 0 },
        ],
      },
    };
    expect(computeBenefitAmount(b)).toBe(10000);
  });

  it('expected 와 subItems 가 둘 다 있으면 subItems 합 우선', () => {
    const b: DraftBenefit = {
      tempId: 't1',
      templateId: 'autopay',
      type: 'discount',
      label: '자동납부',
      expectedAmount: 99999,
      conditions: {
        items: [{ label: '관리비', eligible: true, amount: 1000 }],
      },
    };
    expect(computeBenefitAmount(b)).toBe(1000);
  });
});

describe('computeExpectedTotal', () => {
  it('빈 배열은 0', () => {
    expect(computeExpectedTotal([])).toBe(0);
  });

  it('여러 혜택의 합계', () => {
    const bs: DraftBenefit[] = [
      { tempId: '1', templateId: 'cashback', type: 'cashback', label: 'a', expectedAmount: 30000 },
      { tempId: '2', templateId: 'cashback', type: 'cashback', label: 'b', expectedAmount: 5000 },
    ];
    expect(computeExpectedTotal(bs)).toBe(35000);
  });
});
