"use server";

import { Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth/require-auth";
import { prisma } from "@/lib/prisma";

export type CategoryInput = {
  name: string;
};

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function normalizeCategoryName(name: string) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error("Nama wajib diisi");
  }

  return normalizedName;
}

function createCategorySlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function createCategory(input: CategoryInput) {
  await requireAuth();

  const name = normalizeCategoryName(input.name);

  try {
    const category = await prisma.category.create({
      data: {
        name,
        slug: createCategorySlug(name),
      },
    });

    revalidatePath("/category");
    return category;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Nama kategori sudah ada");
    }

    throw error;
  }
}

export async function updateCategory(id: number, input: CategoryInput) {
  await requireAuth();

  const name = normalizeCategoryName(input.name);

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: createCategorySlug(name),
      },
    });

    revalidatePath("/category");
    return category;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new Error("Nama kategori sudah ada");
    }

    throw error;
  }
}

export async function deleteCategory(id: number) {
  await requireAuth();

  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/category");
}

