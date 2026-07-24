export class Entity {
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
