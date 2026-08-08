import type { CafeOrderItemDto, CreateCafeOrderDto, PayCafeOrderDto } from "../dto/CafeOrderDto.js";
import { CafeOrderRepository } from "../repositories/CafeOrderRepository.js";
import type { CafeOrderEntity } from "../repositories/CafeOrderRepository.js";
import { CashierShiftRepository } from "../repositories/CashierShiftRepository.js";
import { InventoryRepository } from "../repositories/InventoryRepository.js";
import { MenuCategoryRepository } from "../repositories/MenuCategoryRepository.js";
import { MenuItemRepository } from "../repositories/MenuItemRepository.js";
import { RecipeRepository } from "../repositories/RecipeRepository.js";
import { InventoryService } from "./InventoryService.js";

const PAYMENT_METHODS = new Set(["CASH", "QRIS", "TRANSFER"]);
const ORDER_TYPES = new Set(["DINE_IN", "TAKE_AWAY"]);

export class CafeOrderServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "CafeOrderServiceError";
  }
}

export class CafeOrderService {
  constructor(
    private readonly repository: CafeOrderRepository,
    private readonly menuItemRepository: MenuItemRepository,
    private readonly menuCategoryRepository: MenuCategoryRepository,
    private readonly cashierShiftRepository: CashierShiftRepository,
    private readonly recipeRepository?: RecipeRepository,
    private readonly inventoryRepository?: InventoryRepository,
    private readonly inventoryService?: InventoryService
  ) {}

  async findAll(): Promise<CafeOrderEntity[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<CafeOrderEntity> {
    const found = await this.repository.findById(id);
    if (!found) {
      throw new CafeOrderServiceError("Cafe order not found", 404);
    }
    return found;
  }

  async create(data: unknown): Promise<CafeOrderEntity> {
    const payload = this.validateCreate(data);
    const shift = await this.cashierShiftRepository.findCurrentOpen();
    if (!shift) {
      throw new CafeOrderServiceError("No open shift", 409);
    }

    const normalizedItems = await this.validateAndNormalizeItems(payload.items);
    await this.decreaseStock(normalizedItems);

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
    const discount = Math.max(0, payload.discount || 0);
    const tax = Math.max(0, payload.tax || 0);
    const total = Math.max(0, subtotal - discount + tax);

    return this.repository.create({
      orderNumber: await this.generateOrderNumber(),
      cashierShiftId: shift.id,
      customerName: payload.customerName,
      tableNumber: payload.tableNumber,
      orderType: payload.orderType,
      paymentMethod: payload.paymentMethod,
      subtotal,
      tax,
      discount,
      total,
      items: normalizedItems
    });
  }

  async pay(id: string, data: unknown): Promise<CafeOrderEntity> {
    const order = await this.findById(id);
    if (order.status === "VOID") {
      throw new CafeOrderServiceError("Order already void", 409);
    }
    if (order.paymentStatus === "PAID") {
      throw new CafeOrderServiceError("Order already paid", 409);
    }

    const payload = this.validatePay(data);

    await this.consumeRecipeInventory(order);

    const updated = await this.repository.update(id, {
      paymentMethod: payload.paymentMethod,
      paymentStatus: "PAID",
      status: "PAID",
      paidAt: new Date().toISOString()
    });
    if (!updated) {
      throw new CafeOrderServiceError("Cafe order not found", 404);
    }
    return updated;
  }

  async print(id: string): Promise<{ order: CafeOrderEntity; receipt: string }> {
    const order = await this.findById(id);
    if (order.status === "VOID") {
      throw new CafeOrderServiceError("Order already void", 409);
    }
    if (order.paymentStatus !== "PAID") {
      throw new CafeOrderServiceError("Order is not paid", 409);
    }

    const printed = await this.repository.update(id, {
      status: "PRINTED",
      printedAt: new Date().toISOString()
    });
    if (!printed) {
      throw new CafeOrderServiceError("Cafe order not found", 404);
    }

    const completed = await this.repository.update(id, {
      status: "COMPLETED",
      completedAt: new Date().toISOString()
    });
    if (!completed) {
      throw new CafeOrderServiceError("Cafe order not found", 404);
    }

    return {
      order: completed,
      receipt: this.buildReceipt(completed)
    };
  }

  async void(id: string): Promise<CafeOrderEntity> {
    const order = await this.findById(id);
    if (order.status === "VOID") {
      throw new CafeOrderServiceError("Order already void", 409);
    }

    await this.restoreStock(order.items);
    await this.restoreRecipeInventory(order);

    const updated = await this.repository.update(id, {
      status: "VOID",
      paymentStatus: "VOID",
      voidedAt: new Date().toISOString()
    });
    if (!updated) {
      throw new CafeOrderServiceError("Cafe order not found", 404);
    }
    return updated;
  }

  async summary(): Promise<{
    cafeSalesToday: number;
    ordersToday: number;
    averageOrder: number;
    topMenu: string;
    remainingStock: number;
  }> {
    const orders = await this.repository.findAll();
    const items = await this.menuItemRepository.findAll();
    const today = this.today();
    const todayOrders = orders.filter((order) => order.createdAt.startsWith(today) && order.status !== "VOID");
    const totalSales = todayOrders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + order.total, 0);

    const menuSold = new Map<string, number>();
    for (const order of todayOrders) {
      for (const row of order.items) {
        menuSold.set(row.menuName, (menuSold.get(row.menuName) || 0) + row.qty);
      }
    }

    const topMenu = [...menuSold.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

    return {
      cafeSalesToday: totalSales,
      ordersToday: todayOrders.length,
      averageOrder: todayOrders.length > 0 ? Math.round(totalSales / todayOrders.length) : 0,
      topMenu,
      remainingStock: items.reduce((sum, item) => sum + item.stock, 0)
    };
  }

  async report(): Promise<{
    totalOrder: number;
    paidOrder: number;
    completedOrder: number;
    voidOrder: number;
    totalSales: number;
    topSellingMenu: Array<{ menuItemId: string; menuName: string; qty: number; total: number }>;
    salesByCategory: Array<{ categoryId: string; categoryName: string; total: number }>;
  }> {
    const orders = await this.repository.findAll();
    const menuItems = await this.menuItemRepository.findAll();
    const categories = await this.menuCategoryRepository.findAll();
    const menuMap = new Map(menuItems.map((item) => [item.id, item]));
    const categoryMap = new Map(categories.map((item) => [item.id, item]));

    const paidOrders = orders.filter((order) => order.paymentStatus === "PAID" && order.status !== "VOID");

    const menuAgg = new Map<string, { menuName: string; qty: number; total: number }>();
    const categoryAgg = new Map<string, number>();

    for (const order of paidOrders) {
      for (const row of order.items) {
        const current = menuAgg.get(row.menuItemId) || { menuName: row.menuName, qty: 0, total: 0 };
        current.qty += row.qty;
        current.total += row.total;
        menuAgg.set(row.menuItemId, current);

        const menu = menuMap.get(row.menuItemId);
        if (menu) {
          categoryAgg.set(menu.categoryId, (categoryAgg.get(menu.categoryId) || 0) + row.total);
        }
      }
    }

    const topSellingMenu = [...menuAgg.entries()]
      .map(([menuItemId, value]) => ({ menuItemId, menuName: value.menuName, qty: value.qty, total: value.total }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    const salesByCategory = [...categoryAgg.entries()]
      .map(([categoryId, total]) => ({ categoryId, categoryName: categoryMap.get(categoryId)?.name || "Unknown", total }))
      .sort((a, b) => b.total - a.total);

    return {
      totalOrder: orders.length,
      paidOrder: orders.filter((order) => order.paymentStatus === "PAID").length,
      completedOrder: orders.filter((order) => order.status === "COMPLETED").length,
      voidOrder: orders.filter((order) => order.status === "VOID").length,
      totalSales: paidOrders.reduce((sum, order) => sum + order.total, 0),
      topSellingMenu,
      salesByCategory
    };
  }

  private async validateAndNormalizeItems(items: CafeOrderItemDto[]): Promise<CafeOrderItemDto[]> {
    const normalized: CafeOrderItemDto[] = [];

    for (const item of items) {
      const menu = await this.menuItemRepository.findById(item.menuItemId);
      if (!menu) {
        throw new CafeOrderServiceError(`Menu item not found: ${item.menuItemId}`, 404);
      }
      if (!menu.active) {
        throw new CafeOrderServiceError(`Menu item inactive: ${menu.name}`, 409);
      }
      if (menu.stock < item.qty) {
        throw new CafeOrderServiceError(`Insufficient stock for menu ${menu.name}`, 409);
      }

      normalized.push({
        menuItemId: menu.id,
        menuName: menu.name,
        qty: item.qty,
        price: menu.price,
        total: menu.price * item.qty
      });
    }

    return normalized;
  }

  private async decreaseStock(items: CafeOrderItemDto[]): Promise<void> {
    for (const item of items) {
      const updated = await this.menuItemRepository.decreaseStock(item.menuItemId, item.qty);
      if (!updated) {
        throw new CafeOrderServiceError(`Insufficient stock for menu ${item.menuName}`, 409);
      }
    }
  }

  private async restoreStock(items: CafeOrderItemDto[]): Promise<void> {
    for (const item of items) {
      await this.menuItemRepository.increaseStock(item.menuItemId, item.qty);
    }
  }

  private async consumeRecipeInventory(order: CafeOrderEntity): Promise<void> {
    if (!this.recipeRepository || !this.inventoryRepository || !this.inventoryService) {
      return;
    }

    const requirements = await this.calculateRecipeRequirements(order);
    if (requirements.size === 0) {
      return;
    }

    for (const [inventoryId, requiredQty] of requirements.entries()) {
      const inventory = await this.inventoryRepository.findById(inventoryId);
      if (!inventory) {
        throw new CafeOrderServiceError(`Inventory not found for recipe ingredient ${inventoryId}`, 404);
      }
      if (inventory.currentStock < requiredQty) {
        throw new CafeOrderServiceError(`Insufficient inventory stock for ${inventory.name}`, 409);
      }
    }

    for (const [inventoryId, requiredQty] of requirements.entries()) {
      await this.inventoryService.changeStock(
        inventoryId,
        -requiredQty,
        `CAFE_PAY:${order.orderNumber}`,
        "OUT"
      );
    }
  }

  private async restoreRecipeInventory(order: CafeOrderEntity): Promise<void> {
    if (!this.recipeRepository || !this.inventoryService) {
      return;
    }
    if (order.paymentStatus !== "PAID") {
      return;
    }

    const requirements = await this.calculateRecipeRequirements(order);
    for (const [inventoryId, requiredQty] of requirements.entries()) {
      await this.inventoryService.changeStock(
        inventoryId,
        requiredQty,
        `CAFE_VOID:${order.orderNumber}`,
        "IN"
      );
    }
  }

  private async calculateRecipeRequirements(order: CafeOrderEntity): Promise<Map<string, number>> {
    const requirements = new Map<string, number>();
    if (!this.recipeRepository) {
      return requirements;
    }

    for (const orderItem of order.items) {
      const recipe = await this.recipeRepository.findByMenuId(orderItem.menuItemId);
      if (!recipe) {
        continue;
      }

      for (const ingredient of recipe.ingredients) {
        const qty = ingredient.qty * orderItem.qty;
        requirements.set(ingredient.inventoryId, (requirements.get(ingredient.inventoryId) || 0) + qty);
      }
    }

    return requirements;
  }

  private validateCreate(data: unknown): CreateCafeOrderDto {
    if (!this.isRecord(data)) {
      throw new CafeOrderServiceError("Invalid payload: body must be an object", 400);
    }

    const orderType = this.requiredText(data.orderType, "orderType").toUpperCase();
    if (!ORDER_TYPES.has(orderType)) {
      throw new CafeOrderServiceError("Invalid payload: orderType must be DINE_IN or TAKE_AWAY", 400);
    }

    const paymentMethod = this.requiredText(data.paymentMethod, "paymentMethod").toUpperCase();
    if (!PAYMENT_METHODS.has(paymentMethod)) {
      throw new CafeOrderServiceError("Invalid payload: paymentMethod must be CASH, QRIS, or TRANSFER", 400);
    }

    return {
      customerName: this.requiredText(data.customerName, "customerName"),
      tableNumber: this.requiredText(data.tableNumber, "tableNumber"),
      orderType: orderType as "DINE_IN" | "TAKE_AWAY",
      paymentMethod: paymentMethod as "CASH" | "QRIS" | "TRANSFER",
      discount: this.optionalNonNegativeNumber(data.discount, "discount"),
      tax: this.optionalNonNegativeNumber(data.tax, "tax"),
      items: this.requiredItems(data.items)
    };
  }

  private validatePay(data: unknown): PayCafeOrderDto {
    if (!this.isRecord(data)) {
      throw new CafeOrderServiceError("Invalid payload: body must be an object", 400);
    }

    const paymentMethod = this.requiredText(data.paymentMethod, "paymentMethod").toUpperCase();
    if (!PAYMENT_METHODS.has(paymentMethod)) {
      throw new CafeOrderServiceError("Invalid payload: paymentMethod must be CASH, QRIS, or TRANSFER", 400);
    }

    return {
      paymentMethod: paymentMethod as "CASH" | "QRIS" | "TRANSFER"
    };
  }

  private requiredItems(value: unknown): CafeOrderItemDto[] {
    if (!Array.isArray(value) || value.length === 0) {
      throw new CafeOrderServiceError("Invalid payload: items must be a non-empty array", 400);
    }

    return value.map((item, index) => {
      if (!this.isRecord(item)) {
        throw new CafeOrderServiceError(`Invalid payload: items[${index}] must be an object`, 400);
      }

      const qty = this.requiredInteger(item.qty, `items[${index}].qty`);
      return {
        menuItemId: this.requiredText(item.menuItemId, `items[${index}].menuItemId`),
        menuName: typeof item.menuName === "string" && item.menuName.trim() ? item.menuName.trim() : "-",
        qty,
        price: 0,
        total: 0
      };
    });
  }

  private requiredText(value: unknown, field: string): string {
    if (typeof value !== "string" || !value.trim()) {
      throw new CafeOrderServiceError(`Invalid payload: ${field} is required`, 400);
    }
    return value.trim();
  }

  private requiredInteger(value: unknown, field: string): number {
    if (typeof value !== "number" || Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
      throw new CafeOrderServiceError(`Invalid payload: ${field} must be a positive integer`, 400);
    }
    return value;
  }

  private optionalNonNegativeNumber(value: unknown, field: string): number {
    if (value === undefined || value === null || value === "") {
      return 0;
    }
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new CafeOrderServiceError(`Invalid payload: ${field} must be a non-negative number`, 400);
    }
    return value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");

    let counter = 1;
    let candidate = "";
    do {
      candidate = `CAF-${y}${m}${d}-${String(counter).padStart(4, "0")}`;
      counter += 1;
    } while (await this.repository.findByOrderNumber(candidate));

    return candidate;
  }

  private buildReceipt(order: CafeOrderEntity): string {
    const lines = [
      "=== SATSET CAFE ===",
      `Order: ${order.orderNumber}`,
      `Customer: ${order.customerName}`,
      `Table: ${order.tableNumber}`,
      `Type: ${order.orderType}`,
      "--------------------"
    ];

    for (const item of order.items) {
      lines.push(`${item.menuName} x${item.qty} = ${item.total}`);
    }

    lines.push("--------------------");
    lines.push(`Subtotal: ${order.subtotal}`);
    lines.push(`Discount: ${order.discount}`);
    lines.push(`Tax: ${order.tax}`);
    lines.push(`Total: ${order.total}`);
    lines.push(`Payment: ${order.paymentMethod}`);
    lines.push("=== TERIMA KASIH ===");

    return lines.join("\n");
  }

  private today(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}
