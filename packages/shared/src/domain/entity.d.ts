export declare abstract class Entity<T = string> {
    protected readonly _id: T;
    constructor(id: T);
    get id(): T;
    equals(entity?: Entity<T>): boolean;
}
//# sourceMappingURL=entity.d.ts.map