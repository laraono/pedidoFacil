export type Frequency = 'mensal' | 'anual';

export function formatFrequency(frequency: Frequency | string | undefined): string {
  return frequency === 'anual' ? 'ano' : 'mês';
}

export function monthlyEquivalent(price: number, frequency: Frequency | string | undefined): number {
  return frequency === 'anual' ? price / 12 : price;
}
