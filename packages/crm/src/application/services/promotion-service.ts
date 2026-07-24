import { Promotion, type PromotionDiscountType, type PromotionTarget } from "../../domain/crm-domain";
import { CRMStore } from "../store/crm-store";

export class PromotionService {
  private sequence = 1;

  constructor(private readonly store: CRMStore) {}

  public createPromotion(params: {
    code: string;
    title: string;
    description: string;
    discountType: PromotionDiscountType;
    discountValue: number;
    target: PromotionTarget;
    segmentCode: string;
    startsAt: Date;
    endsAt: Date;
  }): Promotion {
    const promotion = new Promotion(`promo-${this.sequence++}`, {
      ...params,
      isActive: true,
    });

    this.store.promotions.set(promotion.code, promotion);
    return promotion;
  }

  public calculateDiscount(params: {
    customerSegmentCode: string;
    target: PromotionTarget;
    subtotal: number;
    occurredAt?: Date;
  }): {
    promotionCode?: string;
    discountAmount: number;
    finalAmount: number;
  } {
    const now = params.occurredAt ?? new Date();
    const promotion = Array.from(this.store.promotions.values()).find((item) => {
      if (!item.isActive) return false;
      if (item.segmentCode !== params.customerSegmentCode && item.segmentCode !== "all") return false;
      if (item.target !== "all" && item.target !== params.target) return false;
      return item.startsAt <= now && item.endsAt >= now;
    });

    if (!promotion) {
      return { discountAmount: 0, finalAmount: params.subtotal };
    }

    const discountAmount = promotion.discountType === "percent"
      ? Math.floor((params.subtotal * promotion.discountValue) / 100)
      : Math.min(params.subtotal, promotion.discountValue);

    return {
      promotionCode: promotion.code,
      discountAmount,
      finalAmount: params.subtotal - discountAmount,
    };
  }
}
