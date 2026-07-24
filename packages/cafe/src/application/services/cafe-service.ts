import { CafeOrder } from "../../domain/entities/cafe-order";
import { MenuItem } from "../../domain/entities/menu-item";

type WorkflowDashboardStore = {
  increment(metric: "cafeOrders", value?: number): void;
};

export type CafeServiceResult<T> = {
  item: T;
  events: Array<{ type: string; orderNumber: string }>;
};

export class CafeService {
  constructor(private readonly dashboard: WorkflowDashboardStore) {}

  public createOrder(params: { id: string; orderNumber: string; tableNumber?: string; customerName?: string }): CafeServiceResult<CafeOrder> {
    const order = CafeOrder.create({
      id: params.id,
      orderNumber: params.orderNumber,
      tableNumber: params.tableNumber,
      customerName: params.customerName,
    });

    this.dashboard.increment("cafeOrders");

    return { item: order, events: [{ type: "CafeOrderCreated", orderNumber: order.orderNumber }] };
  }

  public markPaid(order: CafeOrder): CafeServiceResult<CafeOrder> {
    order.confirm();
    this.dashboard.increment("cafeOrders");
    return { item: order, events: [{ type: "CafeOrderPaid", orderNumber: order.orderNumber }] };
  }

  public validateMenuItem(item: MenuItem): void {
    if (!item.available) {
      throw new Error("Menu item is unavailable");
    }
  }
}
