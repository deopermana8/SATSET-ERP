export type CashReceivedPayload = {
    reference: string;
    amount: number;
    occurredAt: Date;
    description: string;
};
export declare class CashReceived {
    readonly reference: string;
    readonly amount: number;
    readonly occurredAt: Date;
    readonly description: string;
    constructor(payload: CashReceivedPayload);
}
//# sourceMappingURL=cash-received.d.ts.map