import { ValueObject } from "../../shared/value-object";
export class ReservationId extends ValueObject {
    constructor(value) {
        const normalized = value?.trim();
        if (!normalized) {
            throw new Error("ReservationId must be a non-empty string");
        }
        super({ value: normalized });
    }
    get value() {
        return this.props.value;
    }
    toString() {
        return this.value;
    }
}
