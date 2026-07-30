import type { ParsedRequirement } from "../ai/RequirementParser.js";

export interface EntityField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  primaryKey?: boolean;
}

export interface EntityRelation {
  from: string;
  to: string;
  type: "one-to-many" | "many-to-one" | "many-to-many" | "one-to-one";
}

export interface DomainEntity {
  name: string;
  fields: EntityField[];
  relations: EntityRelation[];
  rules: string[];
}

export interface DomainModel {
  entities: DomainEntity[];
}

const BASE_FIELDS: EntityField[] = [
  { name: "id", type: "string", required: true, primaryKey: true },
  { name: "createdAt", type: "datetime", required: true },
  { name: "updatedAt", type: "datetime", required: true },
];

const ENTITY_MAP: Record<string, { fields: EntityField[]; rules: string[] }> = {
  user: {
    fields: [
      { name: "email", type: "string", required: true, unique: true },
      { name: "name", type: "string", required: false },
      { name: "passwordHash", type: "string", required: true },
    ],
    rules: ["email must be unique", "password must be hashed before storage"],
  },
  product: {
    fields: [
      { name: "name", type: "string", required: true },
      { name: "price", type: "float", required: true },
      { name: "stock", type: "integer", required: true },
      { name: "sku", type: "string", required: false, unique: true },
    ],
    rules: ["price must be >= 0", "stock must be >= 0"],
  },
  category: {
    fields: [
      { name: "name", type: "string", required: true, unique: true },
      { name: "slug", type: "string", required: true, unique: true },
    ],
    rules: ["name must be unique"],
  },
  order: {
    fields: [
      { name: "total", type: "float", required: true },
      { name: "status", type: "string", required: true },
      { name: "userId", type: "string", required: true },
    ],
    rules: ["total must be >= 0", "status must be one of: pending, paid, cancelled, completed"],
  },
  payment: {
    fields: [
      { name: "amount", type: "float", required: true },
      { name: "method", type: "string", required: true },
      { name: "status", type: "string", required: true },
      { name: "orderId", type: "string", required: true },
    ],
    rules: ["amount must be > 0", "method must be one of: cash, card, transfer"],
  },
  inventory: {
    fields: [
      { name: "productId", type: "string", required: true },
      { name: "quantity", type: "integer", required: true },
      { name: "location", type: "string", required: false },
    ],
    rules: ["quantity must be >= 0", "productId must reference a valid product"],
  },
  cart: {
    fields: [
      { name: "userId", type: "string", required: true },
      { name: "status", type: "string", required: true },
    ],
    rules: ["one active cart per user"],
  },
};

const RELATIONS: EntityRelation[] = [
  { from: "order", to: "user", type: "many-to-one" },
  { from: "order", to: "payment", type: "one-to-many" },
  { from: "product", to: "category", type: "many-to-one" },
  { from: "inventory", to: "product", type: "many-to-one" },
  { from: "cart", to: "user", type: "many-to-one" },
  { from: "cart", to: "product", type: "many-to-many" },
];

export function generateDomainModel(requirement: ParsedRequirement): DomainModel {
  const entities: DomainEntity[] = [];

  for (const module of requirement.modules) {
    const spec = ENTITY_MAP[module];
    if (!spec) continue;

    const fields: EntityField[] = [
      ...BASE_FIELDS.map((f) => ({ ...f })),
      ...spec.fields,
    ];

    const relations = RELATIONS.filter(
      (r) => r.from === module &&
        requirement.modules.includes(r.to)
    );

    entities.push({ name: module, fields, relations, rules: spec.rules });
  }

  return { entities };
}
