import { AccountingService } from "./accounting-service";

export class ClosingService {
  constructor(private readonly accountingService: AccountingService) {}

  public closePeriod(periodId: string) {
    return this.accountingService.closeFiscalPeriod(periodId);
  }
}