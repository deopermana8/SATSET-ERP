"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import type { GateMutationResult } from "./types";
import type { CreateGateInput, UpdateGateInput } from "./validation";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createGateAction(input: CreateGateInput): Promise<GateMutationResult> {
  await requireAuth();

  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("Nama wajib diisi");
  if (!input.destinationId || input.destinationId <= 0) throw new Error("DestinationId tidak valid");

  try {
    await prisma.gate.create({
      data: {
        name,
        code: input.code,
        destinationId: input.destinationId,
        active: input.active ?? true,
      },
    });

    revalidatePath("/gate");
    return { success: true, message: "Gate berhasil ditambahkan" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Kode gate sudah digunakan");
    throw error;
  }
}

export async function updateGateAction(id: number, input: UpdateGateInput): Promise<GateMutationResult> {
  await requireAuth();

  try {
    await prisma.gate.update({
      where: { id },
      data: {
        name: input.name ?? undefined,
        code: input.code ?? undefined,
        destinationId: input.destinationId ?? undefined,
        active: input.active ?? undefined,
      },
    });

    revalidatePath("/gate");
    return { success: true, message: "Gate berhasil diperbarui" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Kode gate sudah digunakan");
    throw error;
  }
}

export async function deleteGateAction(id: number): Promise<GateMutationResult> {
  await requireAuth();

  await prisma.gate.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/gate");

  return { success: true, message: "Gate berhasil dihapus" };
}

