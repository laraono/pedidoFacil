import { defineStore } from 'pinia';
import { ref } from 'vue';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const useFeaturesStore = defineStore('features', () => {
  const emailEnabled = ref(false);

  async function fetchFeatures() {
    try {
      const res = await fetch(`${BASE_URL}/features`);
      if (!res.ok) return;
      const data = await res.json();
      emailEnabled.value = data?.emailEnabled ?? false;
    } catch {
    }
  }

  return { emailEnabled, fetchFeatures };
});