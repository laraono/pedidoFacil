import { defineStore } from 'pinia';

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    selectedPlan: null,
    estabelecimentoData: {
      nome_estabelecimento: ''
    }
  }),

  actions: {
    selectPlan(plan) {
      this.selectedPlan = plan;
    },

    setEstabelecimentoData(key, value) {
      this.estabelecimentoData[key] = value;
    },

    clearOnboarding() {
      this.selectedPlan = null;
      this.estabelecimentoData = {
        nome_estabelecimento: ''
      };
    }
  }
});
