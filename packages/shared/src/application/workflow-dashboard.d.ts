export type DashboardMetricName = "reservations" | "quotations" | "invoices" | "payments" | "tickets" | "checkins" | "cafeOrders" | "souvenirSales" | "inventoryAdjustments" | "financeTransactions" | "journalEntries";
export type DashboardStatistics = Record<DashboardMetricName, number>;
export declare class WorkflowDashboardStore {
    private readonly metrics;
    increment(metric: DashboardMetricName, value?: number): void;
    snapshot(): DashboardStatistics;
}
//# sourceMappingURL=workflow-dashboard.d.ts.map