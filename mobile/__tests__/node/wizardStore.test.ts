import { useWizardStore } from '@/stores/wizardStore';

describe('useWizardStore', () => {
  beforeEach(() => {
    useWizardStore.getState().reset();
  });

  it('초기 상태: Step1 · 빈 draft', () => {
    const s = useWizardStore.getState();
    expect(s.step).toBe(1);
    expect(s.draft.benefits).toEqual([]);
  });

  it('patchDraft 는 부분 병합한다', () => {
    useWizardStore.getState().patchDraft({ title: 'BC ZONE', organizer: 'BC카드' });
    const s = useWizardStore.getState();
    expect(s.draft.title).toBe('BC ZONE');
    expect(s.draft.organizer).toBe('BC카드');
  });

  it('addBenefit 후 tempId 가 자동 부여되고 배열 말미에 추가된다', () => {
    useWizardStore.getState().addBenefit({
      templateId: 'cashback',
      type: 'cashback',
      label: '기본 캐시백',
    });
    const s = useWizardStore.getState();
    expect(s.draft.benefits).toHaveLength(1);
    expect(s.draft.benefits[0].tempId).toBeTruthy();
    expect(s.draft.benefits[0].label).toBe('기본 캐시백');
  });

  it('updateBenefit · removeBenefit 는 tempId 로 타겟팅한다', () => {
    const { addBenefit, updateBenefit, removeBenefit } = useWizardStore.getState();

    addBenefit({ templateId: 'a', type: 'cashback', label: 'A' });
    addBenefit({ templateId: 'b', type: 'discount', label: 'B' });

    const targetId = useWizardStore.getState().draft.benefits[0].tempId;
    updateBenefit(targetId, { label: 'A-수정' });
    expect(useWizardStore.getState().draft.benefits[0].label).toBe('A-수정');

    removeBenefit(targetId);
    expect(useWizardStore.getState().draft.benefits).toHaveLength(1);
    expect(useWizardStore.getState().draft.benefits[0].label).toBe('B');
  });

  it('reset 은 모든 상태를 초기화한다', () => {
    useWizardStore.getState().setStep(3);
    useWizardStore.getState().patchDraft({ title: 'X' });
    useWizardStore.getState().reset();

    const s = useWizardStore.getState();
    expect(s.step).toBe(1);
    expect(s.draft.title).toBeUndefined();
  });
});
