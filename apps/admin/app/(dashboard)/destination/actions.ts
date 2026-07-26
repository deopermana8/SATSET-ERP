"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

import type { DestinationMutationResult } from "./types";
import type { CreateDestinationInput, UpdateDestinationInput } from "./validation";

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function normalizeDestinationName(name: string) {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new Error("Nama wajib diisi");
  }
  return normalizedName;
}

function createDestinationSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function createDestinationAction(
  input: CreateDestinationInput
): Promise<DestinationMutationResult> {
  await requireAuth();

  const name = normalizeDestinationName(input.name);

  try {
    await prisma.destination.create({
      data: {
        name,
        slug: createDestinationSlug(name),
        description: input.description || null,
        address: input.address || null,
        phone: input.phone || null,
        email: input.email || null,
        active: true,
      },
    });

    revalidatePath("/destination");
    return {
      success: true,
      message: "Destinasi berhasil ditambahkan",
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Nama destinasi sudah ada");
    }
    throw error;
  }
}

export async function updateDestinationAction(
  id: number,
  input: UpdateDestinationInput
): Promise<DestinationMutationResult> {
  await requireAuth();

  const name = input.name !== undefined ? normalizeDestinationName(input.name) : undefined;

  try {
    await prisma.destination.update({
      where: { id },
      data: {
        name: name ?? undefined,
        slug: name ? createDestinationSlug(name) : undefined,
        description: input.description || null,
        address: input.address || null,
        phone: input.phone || null,
        email: input.email || null,
      },
    });

    revalidatePath("/destination");
    return {
      success: true,
      message: "Destinasi berhasil diperbarui",
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Nama destinasi sudah ada");
    }
    throw error;
  }
}

export async function deleteDestinationAction(
  id: number
): Promise<DestinationMutationResult> {
  await requireAuth();

  await prisma.destination.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/destination");

  return {
    success: true,
    message: "Destinasi berhasil dihapus",
  };
}

