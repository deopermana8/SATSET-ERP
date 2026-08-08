export const recipeRoutes = {
  list: "/api/recipe",
  upsertByMenuId: /^\/api\/recipe\/menu\/([^/]+)$/
} as const;
