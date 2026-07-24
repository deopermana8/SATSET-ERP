import { Membership, MembershipTier, type MembershipTierCode } from "../../domain/crm-domain";
import { CRMStore } from "../store/crm-store";

const TIER_PRIORITY: Record<MembershipTierCode, number> = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
};

export class MembershipService {
  private sequence = 1;

  constructor(private readonly store: CRMStore) {}

  public registerTier(params: {
    code: MembershipTierCode;
    name: string;
    minimumSpend: number;
    pointMultiplier: number;
    birthdayBonusPoints: number;
  }): MembershipTier {
    const tier = new MembershipTier(`tier-${params.code}`, params);
    this.store.membershipTiers.set(tier.code, tier);
    return tier;
  }

  public enrollCustomer(customerId: string, tierCode: MembershipTierCode = "bronze"): Membership {
    const membership = new Membership(`membership-${this.sequence++}`, {
      customerId,
      tierCode,
      points: 0,
      status: "active",
      upgradedAt: new Date(),
    });

    this.store.memberships.set(customerId, membership);
    return membership;
  }

  public upgradeMembership(customerId: string, totalSpending: number): Membership {
    const existing = this.store.memberships.get(customerId);
    if (!existing) {
      throw new Error(`Membership for customer ${customerId} not found`);
    }

    const eligibleTier = Array.from(this.store.membershipTiers.values())
      .filter((tier) => tier.minimumSpend <= totalSpending)
      .sort((left, right) => TIER_PRIORITY[right.code] - TIER_PRIORITY[left.code])[0];

    if (!eligibleTier) {
      return existing;
    }

    const upgraded = new Membership(existing.id, {
      customerId,
      tierCode: eligibleTier.code,
      points: existing.points,
      status: existing.status,
      upgradedAt: new Date(),
    });

    this.store.memberships.set(customerId, upgraded);
    return upgraded;
  }

  public adjustPoints(customerId: string, points: number): Membership {
    const membership = this.store.memberships.get(customerId);
    if (!membership) {
      throw new Error(`Membership for customer ${customerId} not found`);
    }

    const nextPoints = membership.points + points;
    if (nextPoints < 0) {
      throw new Error("Membership points cannot be negative");
    }

    const updated = new Membership(membership.id, {
      customerId,
      tierCode: membership.tierCode,
      points: nextPoints,
      status: membership.status,
      upgradedAt: membership.upgradedAt,
    });

    this.store.memberships.set(customerId, updated);
    return updated;
  }
}
