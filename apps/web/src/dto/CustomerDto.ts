export interface CreateCustomerDto {
  code: string;
  fullName: string;
  email: string;
  phone?: string;
}

export interface UpdateCustomerDto {
  code?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface CustomerItem {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  data: CustomerItem[];
  total: number;
}