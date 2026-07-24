export type DashboardMetricName =
  | "reservations"
  | "quotations"
  | "invoices"
  | "payments"
  | "tickets"
  | "checkins"
  | "cafeOrders"
  | "souvenirSales"
  | "inventoryAdjustments"
  | "financeTransactions"
  | "journalEntries";

export type DashboardStatistics = Record<DashboardMetricName, number>;

export class WorkflowDashboardStore {
  private readonly metrics: DashboardStatistics = {
    reservations: 0,
    quotations: 0,
    invoices: 0,
    payments: 0,
    tickets: 0,
    checkins: 0,
    cafeOrders: 0,
    souvenirSales: 0,
    inventoryAdjustments: 0,
    financeTransactions: 0,
    journalEntries: 0,
  };

  public increment(metric: DashboardMetricName, value = 1): void {
    this.metrics[metric] += value;
  }

  public snapshot(): DashboardStatistics {
    return { ...this.metrics };
  }
}
