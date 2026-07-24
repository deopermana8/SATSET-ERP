export class WorkflowDashboardStore {
    constructor() {
        this.metrics = {
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
    }
    increment(metric, value = 1) {
        this.metrics[metric] += value;
    }
    snapshot() {
        return { ...this.metrics };
    }
}
