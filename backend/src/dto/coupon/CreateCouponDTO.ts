import { DiscountType } from "../../enum"

export interface CreateCouponDTO {
    establishmentId?: number;
    code: string;
    type: DiscountType;
    value: number;
    quantity?: number | null;
    expirationDate?: string | null;
}