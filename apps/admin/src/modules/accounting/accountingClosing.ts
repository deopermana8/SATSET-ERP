import type { AccountingClosingStatus } from "./accountingTypes.js";

export function createClosingStatus(period: string): AccountingClosingStatus {
  return {
    period,
    closed: false,
  };
}

export function closePeriod(status: AccountingClosingStatus): AccountingClosingStatus {
  return {
    ...status,
    closed: true,
    closedAt: new Date().toISOString(),
  };
}
