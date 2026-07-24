import {
  Coupon,
  Customer,
  CustomerNote,
  CustomerSegment,
  Membership,
  MembershipTier,
  PointTransaction,
  Promotion,
  VisitHistory,
  Voucher,
} from "../../domain/crm-domain";

export class CRMStore {
  public readonly customers = new Map<string, Customer>();
  public readonly memberships = new Map<string, Membership>();
  public readonly membershipTiers = new Map<string, MembershipTier>();
  public readonly pointTransactions: Array<PointTransaction> = [];
  public readonly vouchers = new Map<string, Voucher>();
  public readonly promotions = new Map<string, Promotion>();
  public readonly coupons = new Map<string, Coupon>();
  public readonly segments = new Map<string, CustomerSegment>();
  public readonly visitHistories: Array<VisitHistory> = [];
  public readonly customerNotes: Array<CustomerNote> = [];
}
