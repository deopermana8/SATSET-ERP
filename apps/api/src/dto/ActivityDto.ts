export interface ActivityDto {
  id: string;
  code: string;
  name: string;
  category: string;
  duration: number;
  capacity: number;
  price: number;
  active: boolean;
}

export interface CreateActivityDto {
  code: string;
  name: string;
  category: string;
  duration: number;
  capacity: number;
  price: number;
  active: boolean;
}

export interface UpdateActivityDto {
  code?: string;
  name?: string;
  category?: string;
  duration?: number;
  capacity?: number;
  price?: number;
  active?: boolean;
}
