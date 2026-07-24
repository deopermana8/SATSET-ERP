class Entity {
    constructor(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }
    equals(entity) {
        if (entity === null || entity === undefined) {
            return false;
        }
        if (entity.constructor !== this.constructor) {
            return false;
        }
        return this._id === entity._id;
    }
}
class AggregateRoot extends Entity {
    constructor(id) {
        super(id);
    }
}
export class FinanceTransaction extends AggregateRoot {
    constructor(id, props) {
        super(id);
        this.props = props;
        this.validate();
    }
    validate() {
        if (!this.props.reference?.trim())
            throw new Error("Reference is required");
        if (this.props.amount <= 0)
            throw new Error("Amount must be positive");
    }
    get reference() {
        return this.props.reference;
    }
    get amount() {
        return this.props.amount;
    }
    get type() {
        return this.props.type;
    }
    get description() {
        return this.props.description;
    }
    get occurredAt() {
        return this.props.occurredAt;
    }
}
