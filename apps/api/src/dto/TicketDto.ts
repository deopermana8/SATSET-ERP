export interface CreateTicketDto {
  code: string;
  name: string;
  category: string;
  price: number;
  quota: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

export interface UpdateTicketDto {
  code?: string;
  name?: string;
  category?: string;
  price?: number;
  quota?: number;
  validFrom?: string;
  validUntil?: string;
  active?: boolean;
}
