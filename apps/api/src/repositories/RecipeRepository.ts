import type { RecipeIngredientDto } from "../dto/RecipeDto.js";
import { prisma } from "../prismaClient.js";

export interface RecipeEntity {
  id: string;
  menuId: string;
  ingredients: RecipeIngredientDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeInput {
  menuId: string;
  ingredients: RecipeIngredientDto[];
}

export interface UpdateRecipeInput {
  ingredients: RecipeIngredientDto[];
}

type PrismaRecipeRow = {
  id: number;
  menuId: string;
  ingredients: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function toEntity(row: PrismaRecipeRow): RecipeEntity {
  return {
    id: String(row.id),
    menuId: row.menuId,
    ingredients: (Array.isArray(row.ingredients) ? row.ingredients : []) as RecipeIngredientDto[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type JsonInput = Parameters<typeof prisma.recipe.create>[0]["data"]["ingredients"];

export class RecipeRepository {
  async findAll(): Promise<RecipeEntity[]> {
    const rows = await prisma.recipe.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((row) => toEntity(row as PrismaRecipeRow));
  }

  async findById(id: string): Promise<RecipeEntity | null> {
    const recipeId = Number(id);
    if (!Number.isInteger(recipeId)) return null;
    const row = await prisma.recipe.findUnique({ where: { id: recipeId } });
    return row ? toEntity(row as PrismaRecipeRow) : null;
  }

  async findByMenuId(menuId: string): Promise<RecipeEntity | null> {
    const row = await prisma.recipe.findUnique({ where: { menuId } });
    return row ? toEntity(row as PrismaRecipeRow) : null;
  }

  async create(data: CreateRecipeInput): Promise<RecipeEntity> {
    const row = await prisma.recipe.create({
      data: {
        menuId: data.menuId,
        ingredients: data.ingredients as unknown as JsonInput,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaRecipeRow);
  }

  async update(id: string, data: UpdateRecipeInput): Promise<RecipeEntity | null> {
    const recipeId = Number(id);
    if (!Number.isInteger(recipeId)) return null;
    const existing = await prisma.recipe.findUnique({ where: { id: recipeId }, select: { id: true } });
    if (!existing) return null;
    const row = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        ingredients: data.ingredients as unknown as JsonInput,
        updatedAt: new Date(),
      },
    });
    return toEntity(row as PrismaRecipeRow);
  }
}
