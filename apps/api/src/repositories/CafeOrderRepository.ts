import type { CafeOrderItemDto, CafePaymentMethod, CafeOrderType } from "../dto/CafeOrderDto.js";
import { prisma } from "../prismaClient.js";

export type CafeOrderPaymentStatus = "UNPAID" | "PAID" | "VOID";
export type CafeOrderStatus = "NEW" | "PAID" | "PRINTED" | "COMPLETED" | "VOID";

export interface CafeOrderEntity {
  id: string;
  orderNumber: string;
  cashierShiftId: string;
  customerName: string;
  tableNumber: string;
  orderType: CafeOrderType;
  paymentMethod: CafePaymentMethod;
  paymentStatus: CafeOrderPaymentStatus;
  status: CafeOrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: CafeOrderItemDto[];
  createdAt: string;
  paidAt?: string | null;
  printedAt?: string | null;
  completedAt?: string | null;
  voidedAt?: string | null;
  updatedAt: string;
}

export interface CreateCafeOrderInput {
  orderNumber: string;
  cashierShiftId: string;
  customerName: string;
  tableNumber: string;
  orderType: CafeOrderType;
  paymentMethod: CafePaymentMethod;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: CafeOrderItemDto[];
}

export type UpdateCafeOrderInput = Partial<
  Pick<CafeOrderEntity,
    | "paymentMethod"
    | "paymentStatus"
    | "status"
    | "paidAt"
    | "printedAt"
    | "completedAt"
    | "voidedAt"
  >
>;

type PrismaCafeOrderRecord = {
  id: number;
  orderNo: string;
  tableNumber: string | null;
  customerName: string | null;
  orderType: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  cashierShiftId: string | null;
  paidAt: Date | null;
  printedAt: Date | null;
  completedAt: Date | null;
  voidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  cafeOrderItems: Array<{
    id: number;
    menuItemId: number;
    itemName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
};

const ORDER_INCLUDE = {
  cafeOrderItems: {
    select: { id: true, menuItemId: true, itemName: true, price: true, quantity: true, subtotal: true }
  }
} as const;

function toEntity(row: PrismaCafeOrderRecord): CafeOrderEntity {
  return {
    id: String(row.id),
    orderNumber: row.orderNo,
    cashierShiftId: row.cashierShiftId ?? "",
    customerName: row.customerName ?? "",
    tableNumber: row.tableNumber ?? "",
    orderType: (row.orderType ?? "DINE_IN") as CafeOrderType,
    paymentMethod: (row.paymentMethod ?? "CASH") as CafePaymentMethod,
    paymentStatus: (row.paymentStatus ?? "UNPAID") as CafeOrderPaymentStatus,
    status: row.status.toUpperCase() as CafeOrderStatus,
    subtotal: row.subtotal,
    tax: row.tax,
    discount: row.discount,
    total: row.total,
    items: row.cafeOrderItems.map((item) => ({
      menuItemId: String(item.menuItemId),
      menuName: item.itemName,
      qty: item.quantity,
      price: item.price,
      total: item.subtotal
    })),
    createdAt: row.createdAt.toISOString(),
    paidAt: row.paidAt?.toISOString() ?? null,
    printedAt: row.printedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    voidedAt: row.voidedAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString()
  };
}

export class CafeOrderRepository {
  async findAll(): Promise<CafeOrderEntity[]> {
    const rows = await prisma.cafeOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: ORDER_INCLUDE
    });
    return rows.map((row) => toEntity(row as PrismaCafeOrderRecord));
  }

  async findById(id: string): Promise<CafeOrderEntity | null> {
    const orderId = Number(id);
    if (!Number.isInteger(orderId)) return null;
    const row = await prisma.cafeOrder.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
    return row ? toEntity(row as PrismaCafeOrderRecord) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<CafeOrderEntity | null> {
    const row = await prisma.cafeOrder.findUnique({ where: { orderNo: orderNumber }, include: ORDER_INCLUDE });
    return row ? toEntity(row as PrismaCafeOrderRecord) : null;
  }

  async create(data: CreateCafeOrderInput): Promise<CafeOrderEntity> {
    const row = await prisma.cafeOrder.create({
      data: {
        orderNo: data.orderNumber,
        tableNumber: data.tableNumber,
        customerName: data.customerName,
        orderType: data.orderType,
        paymentMethod: data.paymentMethod,
        paymentStatus: "UNPAID",
        status: "NEW",
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        total: data.total,
        cashierShiftId: data.cashierShiftId,
        updatedAt: new Date(),
        cafeOrderItems: {
          create: data.items.map((item) => ({
            menuItemId: Number(item.menuItemId),
            itemName: item.menuName,
            price: item.price,
            quantity: item.qty,
            subtotal: item.total
          }))
        }
      },
      include: ORDER_INCLUDE
    });
    return toEntity(row as PrismaCafeOrderRecord);
  }

  async update(id: string, data: UpdateCafeOrderInput): Promise<CafeOrderEntity | null> {
    const orderId = Number(id);
    if (!Number.isInteger(orderId)) return null;
    const existing = await prisma.cafeOrder.findUnique({ where: { id: orderId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.cafeOrder.update({
      where: { id: orderId },
      data: {
        paymentMethod: data.paymentMethod ?? undefined,
        paymentStatus: data.paymentStatus ?? undefined,
        status: data.status ?? undefined,
        paidAt: data.paidAt ? new Date(data.paidAt) : undefined,
        printedAt: data.printedAt ? new Date(data.printedAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        voidedAt: data.voidedAt ? new Date(data.voidedAt) : undefined,
        updatedAt: new Date()
      },
      include: ORDER_INCLUDE
    });
    return toEntity(row as PrismaCafeOrderRecord);
  }
}


