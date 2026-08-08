import type { CreateRecipeDto, UpdateRecipeDto } from "../dto/RecipeDto.js";
import { RecipeService } from "../services/RecipeService.js";

export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  async list() {
    return this.recipeService.list();
  }

  async upsert(menuId: string, payload: CreateRecipeDto | UpdateRecipeDto) {
    return this.recipeService.upsert(payload, menuId);
  }
}
