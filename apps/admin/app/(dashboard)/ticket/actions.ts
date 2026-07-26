"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import type { TicketMutationResult } from "./types";
import type { CreateTicketInput, UpdateTicketInput } from "./validation";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createTicketAction(input: CreateTicketInput): Promise<TicketMutationResult> {
  await requireAuth();

  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("Nama wajib diisi");
  if (!input.type) throw new Error("Tipe tiket wajib diisi");
  if (!Number.isFinite(input.price)) throw new Error("Harga tidak valid");

  try {
    await prisma.ticket.create({
      data: {
        name,
        type: input.type,
        price: Math.floor(input.price),
        destinationId: input.destinationId ?? null,
        active: input.active ?? true,
      },
    });

    revalidatePath("/ticket");
    return { success: true, message: "Ticket berhasil ditambahkan" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Ticket sudah ada");
    throw error;
  }
}

export async function updateTicketAction(id: number, input: UpdateTicketInput): Promise<TicketMutationResult> {
  await requireAuth();

  try {
    await prisma.ticket.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        type: input.type ?? undefined,
        price: input.price !== undefined ? Math.floor(input.price) : undefined,
        destinationId: input.destinationId ?? undefined,
        active: input.active ?? undefined,
      },
    });

    revalidatePath("/ticket");
    return { success: true, message: "Ticket berhasil diperbarui" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Unique constraint violation");
    throw error;
  }
}

export async function deleteTicketAction(id: number): Promise<TicketMutationResult> {
  await requireAuth();

  await prisma.ticket.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/ticket");
  return { success: true, message: "Ticket berhasil dihapus" };
}

