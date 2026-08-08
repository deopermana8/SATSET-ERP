export interface RecipeIngredientDto {
  inventoryId: string;
  qty: number;
}

export interface RecipeDto {
  id: string;
  menuId: string;
  ingredients: RecipeIngredientDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipeDto {
  menuId: string;
  ingredients: RecipeIngredientDto[];
}

export interface UpdateRecipeDto {
  ingredients: RecipeIngredientDto[];
}
