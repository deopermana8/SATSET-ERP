import { PointTransaction, type PointTransactionType } from "../../domain/crm-domain";
import { MembershipService } from "./membership-service";
import { CRMStore } from "../store/crm-store";

export class LoyaltyService {
  private sequence = 1;

  constructor(
    private readonly store: CRMStore,
    private readonly membershipService: MembershipService,
  ) {}

  public rewardPoints(params: {
    customerId: string;
    amount: number;
    reference: string;
    note: string;
  }): PointTransaction {
    const membership = this.store.memberships.get(params.customerId);
    if (!membership) {
      throw new Error(`Membership for customer ${params.customerId} not found`);
    }

    const tier = this.store.membershipTiers.get(membership.tierCode);
    if (!tier) {
      throw new Error(`Membership tier ${membership.tierCode} not found`);
    }

    const earnedPoints = Math.max(1, Math.floor((params.amount / 10_000) * tier.pointMultiplier));
    const updatedMembership = this.membershipService.adjustPoints(params.customerId, earnedPoints);

    return this.recordPointTransaction({
      customerId: params.customerId,
      membershipId: updatedMembership.id,
      type: "earn",
      points: earnedPoints,
      reference: params.reference,
      note: params.note,
    });
  }

  public rewardBirthday(customerId: string): PointTransaction {
    const membership = this.store.memberships.get(customerId);
    if (!membership) {
      throw new Error(`Membership for customer ${customerId} not found`);
    }

    const tier = this.store.membershipTiers.get(membership.tierCode);
    if (!tier) {
      throw new Error(`Membership tier ${membership.tierCode} not found`);
    }

    const updatedMembership = this.membershipService.adjustPoints(customerId, tier.birthdayBonusPoints);
    return this.recordPointTransaction({
      customerId,
      membershipId: updatedMembership.id,
      type: "birthday",
      points: tier.birthdayBonusPoints,
      reference: `BDAY-${customerId}-${Date.now()}`,
      note: `Birthday reward for tier ${tier.name}`,
    });
  }

  public redeemPoints(params: {
    customerId: string;
    points: number;
    reference: string;
    note: string;
  }): PointTransaction {
    const membership = this.store.memberships.get(params.customerId);
    if (!membership) {
      throw new Error(`Membership for customer ${params.customerId} not found`);
    }

    if (membership.points < params.points) {
      throw new Error("Insufficient points");
    }

    const updatedMembership = this.membershipService.adjustPoints(params.customerId, -params.points);
    return this.recordPointTransaction({
      customerId: params.customerId,
      membershipId: updatedMembership.id,
      type: "redeem",
      points: params.points,
      reference: params.reference,
      note: params.note,
    });
  }

  private recordPointTransaction(params: {
    customerId: string;
    membershipId: string;
    type: PointTransactionType;
    points: number;
    reference: string;
    note: string;
  }): PointTransaction {
    const transaction = new PointTransaction(`point-tx-${this.sequence++}`, {
      customerId: params.customerId,
      membershipId: params.membershipId,
      type: params.type,
      points: params.points,
      reference: params.reference,
      note: params.note,
      occurredAt: new Date(),
    });

    this.store.pointTransactions.push(transaction);
    return transaction;
  }
}
