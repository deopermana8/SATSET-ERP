import { AccountingService } from "./accounting-service";

export class LedgerService {
  constructor(private readonly accountingService: AccountingService) {}

  public viewLedger() {
    return this.accountingService.buildLedgers();
  }
}