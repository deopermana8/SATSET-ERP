"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import type { PaymentMutationResult } from "./types";
import type { CreatePaymentInput, UpdatePaymentInput } from "./validation";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createPaymentAction(input: CreatePaymentInput): Promise<PaymentMutationResult> {
  await requireAuth();

  if (!input.reservationId || !Number.isFinite(Number(input.reservationId))) throw new Error("ReservationId tidak valid");
  if (!Number.isFinite(Number(input.amount))) throw new Error("Amount tidak valid");

  try {
    await prisma.payment.create({ data: { reservationId: input.reservationId, amount: Math.floor(input.amount), method: input.method ?? "cash", status: input.status ?? "pending", paidAt: input.paidAt ? new Date(input.paidAt) : null } });
    revalidatePath("/payment");
    return { success: true, message: "Payment berhasil dibuat" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Payment untuk reservation ini sudah ada");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") throw new Error("Reservation tidak ditemukan");
    throw error;
  }
}

export async function updatePaymentAction(id: number, input: UpdatePaymentInput): Promise<PaymentMutationResult> {
  await requireAuth();

  try {
    await prisma.payment.update({ where: { id }, data: { reservationId: input.reservationId ?? undefined, amount: input.amount !== undefined ? Math.floor(input.amount) : undefined, method: input.method ?? undefined, status: input.status ?? undefined, paidAt: input.paidAt ? new Date(input.paidAt) : undefined } });
    revalidatePath("/payment");
    return { success: true, message: "Payment berhasil diperbarui" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Payment untuk reservation ini sudah ada");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new Error("Payment tidak ditemukan");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") throw new Error("Reservation tidak ditemukan");
    throw error;
  }
}

export async function deletePaymentAction(id: number): Promise<PaymentMutationResult> {
  await requireAuth();

  try {
    await prisma.payment.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/payment");
    return { success: true, message: "Payment berhasil dihapus" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new Error("Payment tidak ditemukan");
    throw error;
  }

}


