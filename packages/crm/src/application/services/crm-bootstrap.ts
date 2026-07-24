import { CRMService } from "./crm-service";
import { LoyaltyService } from "./loyalty-service";
import { MembershipService } from "./membership-service";
import { PromotionService } from "./promotion-service";
import { VoucherService } from "./voucher-service";
import { CRMStore } from "../store/crm-store";

export type CRMKernel = {
  store: CRMStore;
  crmService: CRMService;
  membershipService: MembershipService;
  loyaltyService: LoyaltyService;
  voucherService: VoucherService;
  promotionService: PromotionService;
};

export function createCRMKernel(): CRMKernel {
  const store = new CRMStore();
  const membershipService = new MembershipService(store);
  const crmService = new CRMService(store, membershipService);
  const loyaltyService = new LoyaltyService(store, membershipService);
  const voucherService = new VoucherService(store);
  const promotionService = new PromotionService(store);

  return {
    store,
    crmService,
    membershipService,
    loyaltyService,
    voucherService,
    promotionService,
  };
}
