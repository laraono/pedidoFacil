import { defineStore } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'pedidofacil_coupons';

const SEED = [
  { id: 1, code: 'BEMVINDO10', description: 'Cupom de boas-vindas', type: 'percent', value: 10, expiresAt: null, active: true },
  { id: 2, code: 'FIDELIDADE15', description: 'Clientes fiéis', type: 'percent', value: 15, expiresAt: null, active: true },
  { id: 3, code: 'DESC5REAIS', description: 'Desconto fixo', type: 'fixed', value: 5, expiresAt: '2026-12-31', active: true },
];

const load = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
  return SEED;
};

const save = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

export const useCouponStore = defineStore('coupons', () => {
  const coupons = ref(load());

  const addCoupon = (coupon) => {
    coupons.value.push({ ...coupon, id: Date.now() });
    save(coupons.value);
  };

  const updateCoupon = (updated) => {
    const idx = coupons.value.findIndex(c => c.id === updated.id);
    if (idx !== -1) { coupons.value[idx] = { ...updated }; save(coupons.value); }
  };

  const removeCoupon = (id) => {
    coupons.value = coupons.value.filter(c => c.id !== id);
    save(coupons.value);
  };

  const findByCode = (code) => {
    return coupons.value.find(
      c => c.code.trim().toUpperCase() === code.trim().toUpperCase() && c.active !== false
    );
  };

  return { coupons, addCoupon, updateCoupon, removeCoupon, findByCode };
});
