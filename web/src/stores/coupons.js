import { defineStore } from "pinia";
import { ref } from "vue";
import { couponApi } from "@/services/couponApi";

export const useCouponStore = defineStore("coupons", () => {
  const coupons = ref([]);

  const mapCouponToFront = (c) => ({
    id: c.id,
    code: c.code,
    description: "",
    type: c.type === "Percentual" ? "percent" : "fixed",
    value: Number(c.value),
    expiresAt: c.expirationDate ? c.expirationDate.split("T")[0] : "",
    active: true,
  });

  const mapCouponToBack = (payload) => {
    return {
      code: payload.code,
      type: payload.type === "percent" ? "Percentual" : "Valor",
      value: Number(payload.value),
      expirationDate: payload.expiresAt || null, // Envia a string YYYY-MM-DD direta do input
    };
  };

  const loadData = async () => {
    try {
      const data = await couponApi.list();
      coupons.value = data.map(mapCouponToFront);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
    }
  };

  const addCoupon = async (payload) => {
    const backendPayload = mapCouponToBack(payload);
    await couponApi.create(backendPayload);
    await loadData();
  };

  const updateCoupon = async (payload) => {
    const backendPayload = mapCouponToBack(payload);
    await couponApi.update(payload.id, backendPayload);
    await loadData();
  };

  const removeCoupon = async (id) => {
    await couponApi.delete(id);
    await loadData();
  };

  return {
    coupons,
    loadData,
    addCoupon,
    updateCoupon,
    removeCoupon,
  };
});
