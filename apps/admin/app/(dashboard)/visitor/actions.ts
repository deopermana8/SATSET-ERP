"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import type { VisitorMutationResult } from "./types";
import type { CreateVisitorInput, UpdateVisitorInput } from "./validation";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function createVisitorAction(input: CreateVisitorInput): Promise<VisitorMutationResult> {
  await requireAuth();

  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("Nama wajib diisi");

  try {
    await prisma.visitor.create({ data: { name, email: input.email ?? null, phone: input.phone ?? null, idCard: input.idCard ?? null } });
    revalidatePath("/visitor");
    return { success: true, message: "Visitor berhasil ditambahkan" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Email atau ID Card sudah terdaftar");
    throw error;
  }
}

export async function updateVisitorAction(id: number, input: UpdateVisitorInput): Promise<VisitorMutationResult> {
  await requireAuth();

  try {
    await prisma.visitor.update({ where: { id }, data: { name: input.name ?? undefined, email: input.email ?? undefined, phone: input.phone ?? undefined, idCard: input.idCard ?? undefined } });
    revalidatePath("/visitor");
    return { success: true, message: "Visitor berhasil diperbarui" };
  } catch (error) {
    if (isUniqueConstraintError(error)) throw new Error("Email atau ID Card sudah terdaftar");
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new Error("Visitor tidak ditemukan");
    throw error;
  }
}

export async function deleteVisitorAction(id: number): Promise<VisitorMutationResult> {
  await requireAuth();

  try {
    await prisma.visitor.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/visitor");
    return { success: true, message: "Visitor berhasil dihapus" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new Error("Visitor tidak ditemukan");
    throw error;
  }
}

