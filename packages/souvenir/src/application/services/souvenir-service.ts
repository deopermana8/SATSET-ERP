import { SouvenirProduct } from "../../domain/entities/souvenir-product";
import { SouvenirSale } from "../../domain/entities/souvenir-sale";
import { WorkflowDashboardStore } from "@satset/shared";

export type SouvenirServiceResult<T> = {
  item: T;
  events: Array<{ type: string; saleNumber: string }>;
};

export class SouvenirService {
  constructor(private readonly dashboard: WorkflowDashboardStore) {}

  public sell(product: SouvenirProduct, quantity: number): SouvenirServiceResult<SouvenirSale> {
    product.sell(quantity);

    const sale = SouvenirSale.create({ id: `sale-${Date.now()}`, saleNumber: `SOUV-${Date.now()}` });
    sale.addItem(
      {
        id: `line-${Date.now()}`,
        productId: product.code,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      },
      product.cost,
    );
    sale.complete();

    this.dashboard.increment("souvenirSales");

    return { item: sale, events: [{ type: "SouvenirSold", saleNumber: sale.saleNumber }] };
  }
}
