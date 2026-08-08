export interface SupplierDto {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  active: boolean;
}

export interface UpdateSupplierDto {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  active?: boolean;
}
