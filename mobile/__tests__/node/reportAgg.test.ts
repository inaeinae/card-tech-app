type EventRow = { status: string; payout_actual: number | null; created_at: string };

function sumConfirmed(events: EventRow[]): number {
  return events.filter((e) => e.status === 'paid').reduce((s, e) => s + Number(e.payout_actual ?? 0), 0);
}

it('paid 이벤트 합산', () => {
  const rows: EventRow[] = [
    { status: 'paid', payout_actual: 30000, created_at: '2026-03-01' },
    { status: 'applied', payout_actual: null, created_at: '2026-04-01' },
  ];
  expect(sumConfirmed(rows)).toBe(30000);
});

it('paid 없으면 0', () => {
  expect(sumConfirmed([{ status: 'applied', payout_actual: null, created_at: '2026-04-01' }])).toBe(0);
});

it('여러 paid 누적', () => {
  const rows: EventRow[] = [
    { status: 'paid', payout_actual: 10000, created_at: '2026-01-01' },
    { status: 'paid', payout_actual: 25000, created_at: '2026-02-01' },
    { status: 'in_progress', payout_actual: null, created_at: '2026-03-01' },
  ];
  expect(sumConfirmed(rows)).toBe(35000);
});
