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
