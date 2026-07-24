import { Coupon, Voucher } from "../../domain/crm-domain";
import { CRMStore } from "../store/crm-store";

export class VoucherService {
  private sequence = 1;

  constructor(private readonly store: CRMStore) {}

  public generateVoucher(params: {
    customerId: string;
    value: number;
    minimumSpend: number;
    validDays: number;
  }): Voucher {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + params.validDays * 24 * 60 * 60 * 1000);
    const code = `VCR-${issuedAt.getTime()}-${this.sequence}`;

    const voucher = new Voucher(`voucher-${this.sequence++}`, {
      code,
      customerId: params.customerId,
      value: params.value,
      minimumSpend: params.minimumSpend,
      issuedAt,
      expiresAt,
      isActive: true,
    });

    this.store.vouchers.set(voucher.code, voucher);
    return voucher;
  }

  public issueCoupon(params: {
    promotionCode: string;
    expiresAt: Date;
    usageLimit: number;
  }): Coupon {
    const code = `CPN-${Date.now()}-${this.sequence}`;
    const coupon = new Coupon(`coupon-${this.sequence++}`, {
      code,
      promotionCode: params.promotionCode,
      expiresAt: params.expiresAt,
      usageLimit: params.usageLimit,
      usedCount: 0,
      isActive: true,
    });

    this.store.coupons.set(coupon.code, coupon);
    return coupon;
  }

  public validateCoupon(code: string): { valid: boolean; reason?: string; coupon?: Coupon } {
    const coupon = this.store.coupons.get(code);
    if (!coupon) {
      return { valid: false, reason: "Coupon not found" };
    }

    if (!coupon.isActive) {
      return { valid: false, reason: "Coupon is inactive" };
    }

    if (coupon.expiresAt < new Date()) {
      return { valid: false, reason: "Coupon is expired" };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, reason: "Coupon usage limit reached" };
    }

    return { valid: true, coupon };
  }
}
