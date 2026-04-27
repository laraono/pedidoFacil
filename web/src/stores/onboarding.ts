import { defineStore } from 'pinia';

export interface EstabelecimentoData {
  nome_estabelecimento: string;
  [key: string]: unknown;
}

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    selectedPlan: null as string | null,
    estabelecimentoData: {
      nome_estabelecimento: ''
    } as EstabelecimentoData
  }),

  actions: {
    selectPlan(plan: string): void {
      this.selectedPlan = plan;
    },

    setEstabelecimentoData(key: string, value: unknown): void {
      this.estabelecimentoData[key] = value;
    },

    clearOnboarding(): void {
      this.selectedPlan = null;
      this.estabelecimentoData = {
        nome_estabelecimento: ''
      };
    }
  }
});
