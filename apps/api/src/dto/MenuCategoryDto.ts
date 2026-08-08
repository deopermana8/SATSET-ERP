export interface MenuCategoryDto {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface CreateMenuCategoryDto {
  code: string;
  name: string;
  active: boolean;
}
