abstract class Entity<T = string> {
  protected readonly _id: T;

  constructor(id: T) {
    this._id = id;
  }

  public get id(): T {
    return this._id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }

    if (entity.constructor !== this.constructor) {
      return false;
    }

    return this._id === entity._id;
  }
}

abstract class AggregateRoot<T = string> extends Entity<T> {
  protected constructor(id: T) {
    super(id);
  }
}

export type MembershipTierCode = "bronze" | "silver" | "gold" | "platinum";
export type MembershipStatus = "active" | "inactive";
export type PointTransactionType = "earn" | "redeem" | "adjustment" | "birthday";
export type PromotionDiscountType = "percent" | "fixed";
export type PromotionTarget = "all" | "package" | "cafe" | "souvenir";

export type CustomerProps = {
  customerCode: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  registeredAt: Date;
};

export class Customer extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CustomerProps) {
    super(id);
    if (!props.customerCode.trim()) throw new Error("Customer code is required");
    if (!props.fullName.trim()) throw new Error("Customer name is required");
    if (!props.email.trim()) throw new Error("Customer email is required");
    if (!props.phone.trim()) throw new Error("Customer phone is required");
  }

  public get customerCode(): string { return this.props.customerCode; }
  public get fullName(): string { return this.props.fullName; }
  public get email(): string { return this.props.email; }
  public get phone(): string { return this.props.phone; }
  public get birthDate(): Date { return this.props.birthDate; }
  public get registeredAt(): Date { return this.props.registeredAt; }
}

export type MembershipTierProps = {
  code: MembershipTierCode;
  name: string;
  minimumSpend: number;
  pointMultiplier: number;
  birthdayBonusPoints: number;
};

export class MembershipTier extends AggregateRoot<string> {
  constructor(id: string, private readonly props: MembershipTierProps) {
    super(id);
    if (!props.name.trim()) throw new Error("Membership tier name is required");
    if (props.minimumSpend < 0) throw new Error("Minimum spend cannot be negative");
    if (props.pointMultiplier <= 0) throw new Error("Point multiplier must be positive");
    if (props.birthdayBonusPoints < 0) throw new Error("Birthday bonus cannot be negative");
  }

  public get code(): MembershipTierCode { return this.props.code; }
  public get name(): string { return this.props.name; }
  public get minimumSpend(): number { return this.props.minimumSpend; }
  public get pointMultiplier(): number { return this.props.pointMultiplier; }
  public get birthdayBonusPoints(): number { return this.props.birthdayBonusPoints; }
}

export type MembershipProps = {
  customerId: string;
  tierCode: MembershipTierCode;
  points: number;
  status: MembershipStatus;
  upgradedAt: Date;
};

export class Membership extends AggregateRoot<string> {
  constructor(id: string, private readonly props: MembershipProps) {
    super(id);
    if (!props.customerId.trim()) throw new Error("Membership customer id is required");
    if (props.points < 0) throw new Error("Membership points cannot be negative");
  }

  public get customerId(): string { return this.props.customerId; }
  public get tierCode(): MembershipTierCode { return this.props.tierCode; }
  public get points(): number { return this.props.points; }
  public get status(): MembershipStatus { return this.props.status; }
  public get upgradedAt(): Date { return this.props.upgradedAt; }
}

export type PointTransactionProps = {
  customerId: string;
  membershipId: string;
  type: PointTransactionType;
  points: number;
  reference: string;
  note: string;
  occurredAt: Date;
};

export class PointTransaction extends AggregateRoot<string> {
  constructor(id: string, private readonly props: PointTransactionProps) {
    super(id);
    if (!props.customerId.trim()) throw new Error("Point transaction customer id is required");
    if (!props.membershipId.trim()) throw new Error("Point transaction membership id is required");
    if (props.points <= 0) throw new Error("Point transaction points must be positive");
    if (!props.reference.trim()) throw new Error("Point transaction reference is required");
  }

  public get customerId(): string { return this.props.customerId; }
  public get membershipId(): string { return this.props.membershipId; }
  public get type(): PointTransactionType { return this.props.type; }
  public get points(): number { return this.props.points; }
  public get reference(): string { return this.props.reference; }
  public get note(): string { return this.props.note; }
  public get occurredAt(): Date { return this.props.occurredAt; }
}

export type VoucherProps = {
  code: string;
  customerId: string;
  value: number;
  minimumSpend: number;
  issuedAt: Date;
  expiresAt: Date;
  redeemedAt?: Date;
  isActive: boolean;
};

export class Voucher extends AggregateRoot<string> {
  constructor(id: string, private readonly props: VoucherProps) {
    super(id);
    if (!props.code.trim()) throw new Error("Voucher code is required");
    if (!props.customerId.trim()) throw new Error("Voucher customer id is required");
    if (props.value <= 0) throw new Error("Voucher value must be positive");
    if (props.minimumSpend < 0) throw new Error("Voucher minimum spend cannot be negative");
    if (props.expiresAt < props.issuedAt) throw new Error("Voucher expiry must be after issued date");
  }

  public get code(): string { return this.props.code; }
  public get customerId(): string { return this.props.customerId; }
  public get value(): number { return this.props.value; }
  public get minimumSpend(): number { return this.props.minimumSpend; }
  public get issuedAt(): Date { return this.props.issuedAt; }
  public get expiresAt(): Date { return this.props.expiresAt; }
  public get redeemedAt(): Date | undefined { return this.props.redeemedAt; }
  public get isActive(): boolean { return this.props.isActive; }
}

export type PromotionProps = {
  code: string;
  title: string;
  description: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  target: PromotionTarget;
  segmentCode: string;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
};

export class Promotion extends AggregateRoot<string> {
  constructor(id: string, private readonly props: PromotionProps) {
    super(id);
    if (!props.code.trim()) throw new Error("Promotion code is required");
    if (!props.title.trim()) throw new Error("Promotion title is required");
    if (props.discountValue <= 0) throw new Error("Promotion discount value must be positive");
    if (props.endsAt < props.startsAt) throw new Error("Promotion end date must be after start date");
  }

  public get code(): string { return this.props.code; }
  public get title(): string { return this.props.title; }
  public get description(): string { return this.props.description; }
  public get discountType(): PromotionDiscountType { return this.props.discountType; }
  public get discountValue(): number { return this.props.discountValue; }
  public get target(): PromotionTarget { return this.props.target; }
  public get segmentCode(): string { return this.props.segmentCode; }
  public get startsAt(): Date { return this.props.startsAt; }
  public get endsAt(): Date { return this.props.endsAt; }
  public get isActive(): boolean { return this.props.isActive; }
}

export type CouponProps = {
  code: string;
  promotionCode: string;
  expiresAt: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
};

export class Coupon extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CouponProps) {
    super(id);
    if (!props.code.trim()) throw new Error("Coupon code is required");
    if (!props.promotionCode.trim()) throw new Error("Coupon promotion code is required");
    if (props.usageLimit <= 0) throw new Error("Coupon usage limit must be positive");
    if (props.usedCount < 0) throw new Error("Coupon used count cannot be negative");
  }

  public get code(): string { return this.props.code; }
  public get promotionCode(): string { return this.props.promotionCode; }
  public get expiresAt(): Date { return this.props.expiresAt; }
  public get usageLimit(): number { return this.props.usageLimit; }
  public get usedCount(): number { return this.props.usedCount; }
  public get isActive(): boolean { return this.props.isActive; }
}

export type CustomerSegmentProps = {
  code: string;
  name: string;
  minimumSpend: number;
  minimumVisits: number;
  membershipTierCode?: MembershipTierCode;
};

export class CustomerSegment extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CustomerSegmentProps) {
    super(id);
    if (!props.code.trim()) throw new Error("Segment code is required");
    if (!props.name.trim()) throw new Error("Segment name is required");
    if (props.minimumSpend < 0) throw new Error("Segment minimum spend cannot be negative");
    if (props.minimumVisits < 0) throw new Error("Segment minimum visits cannot be negative");
  }

  public get code(): string { return this.props.code; }
  public get name(): string { return this.props.name; }
  public get minimumSpend(): number { return this.props.minimumSpend; }
  public get minimumVisits(): number { return this.props.minimumVisits; }
  public get membershipTierCode(): MembershipTierCode | undefined { return this.props.membershipTierCode; }
}

export type VisitHistoryProps = {
  customerId: string;
  source: "reservation" | "cafe" | "souvenir";
  amount: number;
  visitedAt: Date;
  packageName?: string;
  cafeMenuName?: string;
  souvenirName?: string;
};

export class VisitHistory extends AggregateRoot<string> {
  constructor(id: string, private readonly props: VisitHistoryProps) {
    super(id);
    if (!props.customerId.trim()) throw new Error("Visit history customer id is required");
    if (props.amount < 0) throw new Error("Visit amount cannot be negative");
  }

  public get customerId(): string { return this.props.customerId; }
  public get source(): "reservation" | "cafe" | "souvenir" { return this.props.source; }
  public get amount(): number { return this.props.amount; }
  public get visitedAt(): Date { return this.props.visitedAt; }
  public get packageName(): string | undefined { return this.props.packageName; }
  public get cafeMenuName(): string | undefined { return this.props.cafeMenuName; }
  public get souvenirName(): string | undefined { return this.props.souvenirName; }
}

export type CustomerNoteProps = {
  customerId: string;
  author: string;
  note: string;
  createdAt: Date;
};

export class CustomerNote extends AggregateRoot<string> {
  constructor(id: string, private readonly props: CustomerNoteProps) {
    super(id);
    if (!props.customerId.trim()) throw new Error("Customer note customer id is required");
    if (!props.author.trim()) throw new Error("Customer note author is required");
    if (!props.note.trim()) throw new Error("Customer note content is required");
  }

  public get customerId(): string { return this.props.customerId; }
  public get author(): string { return this.props.author; }
  public get note(): string { return this.props.note; }
  public get createdAt(): Date { return this.props.createdAt; }
}
