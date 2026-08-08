import type { CancelPurchaseOrderDto, CreatePurchaseOrderDto } from "../dto/PurchaseOrderDto.js";
import { PurchaseOrderService } from "../services/PurchaseOrderService.js";

export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  async list() {
    return this.purchaseOrderService.list();
  }

  async get(id: string) {
    return this.purchaseOrderService.get(id);
  }

  async create(payload: CreatePurchaseOrderDto) {
    return this.purchaseOrderService.create(payload);
  }

  async approve(id: string) {
    return this.purchaseOrderService.approve(id);
  }

  async receive(id: string) {
    return this.purchaseOrderService.receive(id);
  }

  async cancel(id: string, payload: CancelPurchaseOrderDto) {
    return this.purchaseOrderService.cancel(id, payload);
  }
}
