export interface CreateTicketDto {
  code: string;
  name: string;
  category: string;
  description: string;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  quota: number;
  remainingQuota: number;
  startTime: string;
  endTime: string;
  validFrom: string;
  validUntil: string;
  barcode: string;
  qrCode: string;
  active: boolean;
}

export interface UpdateTicketDto {
  code?: string;
  name?: string;
  category?: string;
  description?: string;
  weekdayPrice?: number;
  weekendPrice?: number;
  holidayPrice?: number;
  quota?: number;
  remainingQuota?: number;
  startTime?: string;
  endTime?: string;
  validFrom?: string;
  validUntil?: string;
  barcode?: string;
  qrCode?: string;
  active?: boolean;
}

export interface TicketItem {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  weekdayPrice: number;
  weekendPrice: number;
  holidayPrice: number;
  quota: number;
  remainingQuota: number;
  startTime: string;
  endTime: string;
  validFrom: string;
  validUntil: string;
  barcode: string;
  qrCode: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TicketListResponse {
  data: TicketItem[];
  total: number;
}
