"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import type { ReservationMutationResult } from "./types";
import type { CreateReservationInput, UpdateReservationInput } from "./validation";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createReservationAction(input: CreateReservationInput): Promise<ReservationMutationResult> {
  await requireAuth();

  if (!input.code || !input.visitorId || !input.destinationId || !input.ticketId) throw new Error("Field wajib belum lengkap");

  try {
    await prisma.reservation.create({ data: { code: input.code, visitorId: input.visitorId, destinationId: input.destinationId, ticketId: input.ticketId, quantity: input.quantity, totalPrice: input.totalPrice, status: input.status ?? "pending", visitDate: input.visitDate ? new Date(input.visitDate) : null } });
    revalidatePath("/reservation");
    return { success: true, message: "Reservation berhasil dibuat" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Kode reservation sudah ada");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") throw new Error("Foreign key constraint gagal: cek visitor/destination/ticket");
    throw error;
  }
}


export async function updateReservationAction(id: number, input: UpdateReservationInput): Promise<ReservationMutationResult> {
  await requireAuth();

  try {
    await prisma.reservation.update({ where: { id }, data: { code: input.code ?? undefined, visitorId: input.visitorId ?? undefined, destinationId: input.destinationId ?? undefined, ticketId: input.ticketId ?? undefined, quantity: input.quantity ?? undefined, totalPrice: input.totalPrice ?? undefined, status: input.status ?? undefined, visitDate: input.visitDate ? new Date(input.visitDate) : undefined } });
    revalidatePath("/reservation");
    return { success: true, message: "Reservation berhasil diperbarui" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Kode reservation sudah ada");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new Error("Reservation tidak ditemukan");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") throw new Error("Foreign key constraint gagal: cek visitor/destination/ticket");
    throw error;
  }
}

export async function deleteReservationAction(id: number): Promise<ReservationMutationResult> {
  await requireAuth();

  try {
    await prisma.reservation.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/reservation");
    return { success: true, message: "Reservation berhasil dihapus" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new Error("Reservation tidak ditemukan");
    throw error;
  }
}


