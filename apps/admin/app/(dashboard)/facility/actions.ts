"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import type { FacilityMutationResult } from "./types";
import type { CreateFacilityInput, UpdateFacilityInput } from "./validation";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function normalizeFacilityName(name: string) {
  const normalized = name.trim();
  if (!normalized) throw new Error("Nama wajib diisi");
  return normalized;
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function createFacilityAction(
  input: CreateFacilityInput
): Promise<FacilityMutationResult> {
  await requireAuth();

  const name = normalizeFacilityName(input.name);

  try {
    await prisma.facility.create({
      data: {
        name,
        slug: input.slug ?? slugify(name),
        description: input.description ?? null,
        destinationId: input.destinationId,
        active: input.active ?? true,
      },
    });

    revalidatePath("/facility");
    return { success: true, message: "Facility berhasil ditambahkan" };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Facility dengan slug yang sama sudah ada untuk destinasi tersebut");
    }
    throw error;
  }
}

export async function updateFacilityAction(
  id: number,
  input: UpdateFacilityInput
): Promise<FacilityMutationResult> {
  await requireAuth();

  if (input.name !== undefined) {
    normalizeFacilityName(input.name);
  }

  try {
    await prisma.facility.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug ?? (input.name ? slugify(String(input.name)) : undefined),
        description: input.description ?? undefined,
        destinationId: input.destinationId ?? undefined,
        active: input.active ?? undefined,
      },
    });

    revalidatePath("/facility");
    return { success: true, message: "Facility berhasil diperbarui" };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Facility dengan slug yang sama sudah ada untuk destinasi tersebut");
    }
    throw error;
  }
}

export async function deleteFacilityAction(id: number): Promise<FacilityMutationResult> {
  await requireAuth();

  await prisma.facility.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/facility");
  return { success: true, message: "Facility berhasil dihapus" };
}

