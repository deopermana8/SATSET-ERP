import type { CreateRecipeDto, RecipeDto, RecipeIngredientDto, UpdateRecipeDto } from "../dto/RecipeDto.js";
import { RecipeRepository } from "../repositories/RecipeRepository.js";
import { InventoryRepository } from "../repositories/InventoryRepository.js";

export class RecipeService {
  constructor(
    private readonly recipeRepository: RecipeRepository,
    private readonly inventoryRepository: InventoryRepository
  ) {}

  async list(): Promise<RecipeDto[]> {
    return this.recipeRepository.findAll();
  }

  async getByMenuId(menuId: string): Promise<RecipeDto | null> {
    return this.recipeRepository.findByMenuId(menuId);
  }

  private async validateIngredients(ingredients: RecipeIngredientDto[]): Promise<void> {
    if (!ingredients.length) {
      throw new Error("Recipe ingredients are required");
    }

    for (const item of ingredients) {
      if (item.qty <= 0) {
        throw new Error("Recipe ingredient qty must be > 0");
      }

      const inventory = await this.inventoryRepository.findById(item.inventoryId);
      if (!inventory) {
        throw new Error(`Inventory not found for recipe ingredient ${item.inventoryId}`);
      }
    }
  }

  async upsert(data: CreateRecipeDto | UpdateRecipeDto, menuId: string): Promise<RecipeDto> {
    await this.validateIngredients(data.ingredients);

    const existing = await this.recipeRepository.findByMenuId(menuId);
    if (existing) {
      const updated = await this.recipeRepository.update(existing.id, {
        ingredients: data.ingredients
      });
      if (!updated) {
        throw new Error("Recipe not found");
      }
      return updated;
    }

    return this.recipeRepository.create({
      menuId,
      ingredients: data.ingredients
    });
  }
}
