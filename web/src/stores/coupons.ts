import { defineStore } from "pinia";
import { ref } from "vue";
import { couponApi } from "@/services/couponApi";

export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  description: string;
  type: CouponType;
  value: number;
  expiresAt: string | null;
  active: boolean;
}

export const useCouponStore = defineStore("coupons", () => {
  const coupons = ref<Coupon[]>([]);

  const mapCouponToFront = (c: any): Coupon => ({
    id: c.id,
    code: c.code,
    description: "",
    type: c.type === "Percentual" ? "percent" : "fixed",
    value: Number(c.value),
    expiresAt: c.expirationDate ? c.expirationDate.split("T")[0] : null,
    active: true,
  });

  const mapCouponToBack = (payload: Partial<Coupon>) => {
    return {
      code: payload.code,
      type: payload.type === "percent" ? "Percentual" : "Valor",
      value: Number(payload.value),
      expirationDate: payload.expiresAt || null, 
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

  const addCoupon = async (payload: Omit<Coupon, 'id'>) => {
    const backendPayload = mapCouponToBack(payload);
    await couponApi.create(backendPayload);
    await loadData();
  };

  const updateCoupon = async (payload: Coupon) => {
    const backendPayload = mapCouponToBack(payload);
    await couponApi.update(payload.id, backendPayload);
    await loadData();
  };

  const removeCoupon = async (id: number) => {
    await couponApi.delete(id);
    await loadData();
  };

  const findByCode = (code: string): Coupon | undefined => {
    return coupons.value.find(
      c => c.code.trim().toUpperCase() === code.trim().toUpperCase() && c.active !== false
    );
  };

  return {
    coupons,
    loadData,
    addCoupon,
    updateCoupon,
    removeCoupon,
    findByCode
  };
});