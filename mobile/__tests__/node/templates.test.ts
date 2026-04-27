import { BENEFIT_TEMPLATES, getTemplateById } from '@/lib/templates';

describe('BENEFIT_TEMPLATES', () => {
  it('id 가 모두 유일하다', () => {
    const ids = BENEFIT_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('autopay 템플릿은 supportsSubItems=true 이고 presetSubItems 가 7개 이상', () => {
    const t = BENEFIT_TEMPLATES.find((x) => x.id === 'autopay');
    expect(t).toBeDefined();
    expect(t?.supportsSubItems).toBe(true);
    expect((t?.presetSubItems ?? []).length).toBeGreaterThanOrEqual(7);
  });

  it('cashback / discount / payback / custom 템플릿이 모두 존재한다', () => {
    for (const id of ['cashback', 'discount', 'payback', 'custom']) {
      expect(BENEFIT_TEMPLATES.some((t) => t.id === id)).toBe(true);
    }
  });

  it('getTemplateById 는 존재 시 반환, 없으면 null', () => {
    expect(getTemplateById('cashback')?.id).toBe('cashback');
    expect(getTemplateById('does-not-exist')).toBeNull();
  });
});
