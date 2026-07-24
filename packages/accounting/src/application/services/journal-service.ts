import type { JournalEntryDraft, JournalPostingResult } from "@satset/shared";
import { JournalEntry } from "../../domain/accounting-domain";
import { AccountingService } from "./accounting-service";

export class JournalService {
  constructor(private readonly accountingService: AccountingService) {}

  public post(draft: JournalEntryDraft): JournalPostingResult<JournalEntry> {
    return this.accountingService.postJournalDraft(draft);
  }

  public list(): Array<JournalEntry> {
    return this.accountingService.listJournalEntries();
  }
}