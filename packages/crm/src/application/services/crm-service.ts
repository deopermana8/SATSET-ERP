import {
  Customer,
  CustomerNote,
  CustomerSegment,
  VisitHistory,
  type MembershipTierCode,
} from "../../domain/crm-domain";
import { MembershipService } from "./membership-service";
import { CRMStore } from "../store/crm-store";

export type CustomerStatistics = {
  customerId: string;
  customerName: string;
  totalVisits: number;
  totalSpending: number;
  visitFrequencyPerMonth: number;
  favoritePackage: string;
  favoriteCafeMenu: string;
  favoriteSouvenir: string;
  segmentCode: string;
};

export type CustomerTimelineItem = {
  type: "visit" | "note" | "point";
  occurredAt: Date;
  description: string;
  amount?: number;
};

export class CRMService {
  private customerSequence = 1;
  private visitSequence = 1;
  private noteSequence = 1;
  private segmentSequence = 1;

  constructor(
    private readonly store: CRMStore,
    private readonly membershipService: MembershipService,
  ) {}

  public registerCustomer(params: {
    fullName: string;
    email: string;
    phone: string;
    birthDate: Date;
  }): Customer {
    const customerCode = `CUST-${this.customerSequence.toString().padStart(4, "0")}`;
    const customer = new Customer(`customer-${this.customerSequence++}`, {
      customerCode,
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      birthDate: params.birthDate,
      registeredAt: new Date(),
    });

    this.store.customers.set(customer.id, customer);
    this.membershipService.enrollCustomer(customer.id, "bronze");
    return customer;
  }

  public registerSegment(params: {
    code: string;
    name: string;
    minimumSpend: number;
    minimumVisits: number;
    membershipTierCode?: MembershipTierCode;
  }): CustomerSegment {
    const segment = new CustomerSegment(`segment-${this.segmentSequence++}`, params);
    this.store.segments.set(segment.code, segment);
    return segment;
  }

  public recordVisit(params: {
    customerId: string;
    source: "reservation" | "cafe" | "souvenir";
    amount: number;
    packageName?: string;
    cafeMenuName?: string;
    souvenirName?: string;
    visitedAt?: Date;
  }): VisitHistory {
    const visit = new VisitHistory(`visit-${this.visitSequence++}`, {
      customerId: params.customerId,
      source: params.source,
      amount: params.amount,
      packageName: params.packageName,
      cafeMenuName: params.cafeMenuName,
      souvenirName: params.souvenirName,
      visitedAt: params.visitedAt ?? new Date(),
    });

    this.store.visitHistories.push(visit);
    const totalSpending = this.calculateTotalSpending(params.customerId);
    this.membershipService.upgradeMembership(params.customerId, totalSpending);
    return visit;
  }

  public addCustomerNote(params: {
    customerId: string;
    author: string;
    note: string;
    createdAt?: Date;
  }): CustomerNote {
    const customerNote = new CustomerNote(`note-${this.noteSequence++}`, {
      customerId: params.customerId,
      author: params.author,
      note: params.note,
      createdAt: params.createdAt ?? new Date(),
    });

    this.store.customerNotes.push(customerNote);
    return customerNote;
  }

  public searchCustomers(query: string): Array<Customer> {
    const normalized = query.trim().toLowerCase();
    return Array.from(this.store.customers.values()).filter((customer) => {
      return (
        customer.customerCode.toLowerCase().includes(normalized)
        || customer.fullName.toLowerCase().includes(normalized)
        || customer.email.toLowerCase().includes(normalized)
        || customer.phone.toLowerCase().includes(normalized)
      );
    });
  }

  public getCustomerTimeline(customerId: string): Array<CustomerTimelineItem> {
    const visits: Array<CustomerTimelineItem> = this.store.visitHistories
      .filter((visit) => visit.customerId === customerId)
      .map((visit) => ({
        type: "visit",
        occurredAt: visit.visitedAt,
        description: `Visit from ${visit.source}`,
        amount: visit.amount,
      }));

    const notes: Array<CustomerTimelineItem> = this.store.customerNotes
      .filter((note) => note.customerId === customerId)
      .map((note) => ({
        type: "note",
        occurredAt: note.createdAt,
        description: `${note.author}: ${note.note}`,
      }));

    const points: Array<CustomerTimelineItem> = this.store.pointTransactions
      .filter((transaction) => transaction.customerId === customerId)
      .map((transaction) => ({
        type: "point",
        occurredAt: transaction.occurredAt,
        description: `${transaction.type} points (${transaction.points})`,
      }));

    return [...visits, ...notes, ...points].sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());
  }

  public getCustomerStatistics(customerId: string): CustomerStatistics {
    const customer = this.store.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const visits = this.store.visitHistories.filter((visit) => visit.customerId === customerId);
    const totalSpending = visits.reduce((sum, visit) => sum + visit.amount, 0);
    const totalVisits = visits.length;

    const firstVisit = visits.sort((left, right) => left.visitedAt.getTime() - right.visitedAt.getTime())[0];
    const monthsRange = firstVisit
      ? Math.max(1, Math.ceil((Date.now() - firstVisit.visitedAt.getTime()) / (30 * 24 * 60 * 60 * 1000)))
      : 1;

    return {
      customerId,
      customerName: customer.fullName,
      totalVisits,
      totalSpending,
      visitFrequencyPerMonth: totalVisits / monthsRange,
      favoritePackage: this.pickMostFrequent(visits.map((visit) => visit.packageName).filter((value): value is string => !!value)),
      favoriteCafeMenu: this.pickMostFrequent(visits.map((visit) => visit.cafeMenuName).filter((value): value is string => !!value)),
      favoriteSouvenir: this.pickMostFrequent(visits.map((visit) => visit.souvenirName).filter((value): value is string => !!value)),
      segmentCode: this.resolveSegmentCode(customerId, totalSpending, totalVisits),
    };
  }

  public getGlobalStatistics(): {
    totalCustomers: number;
    activeMemberships: number;
    totalVisits: number;
    totalSpending: number;
    averageSpending: number;
  } {
    const totalCustomers = this.store.customers.size;
    const activeMemberships = Array.from(this.store.memberships.values()).filter((item) => item.status === "active").length;
    const totalVisits = this.store.visitHistories.length;
    const totalSpending = this.store.visitHistories.reduce((sum, visit) => sum + visit.amount, 0);

    return {
      totalCustomers,
      activeMemberships,
      totalVisits,
      totalSpending,
      averageSpending: totalCustomers > 0 ? totalSpending / totalCustomers : 0,
    };
  }

  private calculateTotalSpending(customerId: string): number {
    return this.store.visitHistories
      .filter((visit) => visit.customerId === customerId)
      .reduce((sum, visit) => sum + visit.amount, 0);
  }

  private resolveSegmentCode(customerId: string, totalSpending: number, totalVisits: number): string {
    const membership = this.store.memberships.get(customerId);
    const match = Array.from(this.store.segments.values())
      .filter((segment) => segment.minimumSpend <= totalSpending && segment.minimumVisits <= totalVisits)
      .filter((segment) => !segment.membershipTierCode || segment.membershipTierCode === membership?.tierCode)
      .sort((left, right) => (right.minimumSpend + right.minimumVisits) - (left.minimumSpend + left.minimumVisits))[0];

    return match?.code ?? "general";
  }

  private pickMostFrequent(values: Array<string>): string {
    if (values.length === 0) {
      return "-";
    }

    const counts = new Map<string, number>();
    for (const value of values) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1])[0][0];
  }
}
