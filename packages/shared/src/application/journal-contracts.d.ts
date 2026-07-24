export type JournalSide = "debit" | "credit";
export type JournalLineDraft = {
    accountCode: string;
    accountName: string;
    side: JournalSide;
    amount: number;
    memo?: string;
};
export type JournalEntryDraft = {
    entryNumber: string;
    description: string;
    reference?: string;
    occurredAt: Date;
    lines: Array<JournalLineDraft>;
};
export type JournalPostingResult<T> = {
    item: T;
    entryNumber: string;
};
export interface JournalPostingPort<T> {
    postJournalDraft(draft: JournalEntryDraft): JournalPostingResult<T>;
}
//# sourceMappingURL=journal-contracts.d.ts.map