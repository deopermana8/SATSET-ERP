import { randomUUID } from "node:crypto";

import type { RecipeIngredientDto } from "../dto/RecipeDto.js";

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

export class RecipeRepository {
  private readonly items = new Map<string, RecipeEntity>();

  async findAll(): Promise<RecipeEntity[]> {
    return [...this.items.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async findById(id: string): Promise<RecipeEntity | null> {
    return this.items.get(id) ?? null;
  }

  async findByMenuId(menuId: string): Promise<RecipeEntity | null> {
    for (const item of this.items.values()) {
      if (item.menuId === menuId) {
        return item;
      }
    }
    return null;
  }

  async create(data: CreateRecipeInput): Promise<RecipeEntity> {
    const now = new Date().toISOString();
    const created: RecipeEntity = {
      id: randomUUID(),
      menuId: data.menuId,
      ingredients: data.ingredients,
      createdAt: now,
      updatedAt: now
    };
    this.items.set(created.id, created);
    return created;
  }

  async update(id: string, data: UpdateRecipeInput): Promise<RecipeEntity | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: RecipeEntity = {
      ...existing,
      ingredients: data.ingredients,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }
}
