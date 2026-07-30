import type { ProjectPlan } from "./ProjectPlanner.js";

export interface DbField {
  name: string;
  type: "String" | "Int" | "Float" | "Boolean" | "DateTime" | "Json";
  required: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  default?: string;
}

export interface DbRelation {
  from: string;
  to: string;
  type: "one-to-many" | "many-to-one" | "many-to-many" | "one-to-one";
  fieldName: string;
}

export interface DbIndex {
  entity: string;
  fields: string[];
  unique?: boolean;
}

export interface DbEnum {
  name: string;
  values: string[];
}

export interface DbEntity {
  name: string;
  fields: DbField[];
  relations: DbRelation[];
  indexes: DbIndex[];
}

export interface DatabasePlan {
  entities: DbEntity[];
  enums: DbEnum[];
}

// --- Field blueprints ---
const BASE_FIELDS: DbField[] = [
  { name: "id", type: "String", required: true, primaryKey: true, default: "cuid()" },
  { name: "createdAt", type: "DateTime", required: true, default: "now()" },
  { name: "updatedAt", type: "DateTime", required: true },
];

const ENTITY_FIELDS: Record<string, DbField[]> = {
  Product: [
    { name: "name", type: "String", required: true },
    { name: "sku", type: "String", required: false, unique: true },
    { name: "price", type: "Float", required: true },
    { name: "stock", type: "Int", required: true, default: "0" },
    { name: "description", type: "String", required: false },
    { name: "isActive", type: "Boolean", required: true, default: "true" },
  ],
  Category: [
    { name: "name", type: "String", required: true, unique: true },
    { name: "slug", type: "String", required: true, unique: true },
  ],
  Supplier: [
    { name: "name", type: "String", required: true },
    { name: "email", type: "String", required: false },
    { name: "phone", type: "String", required: false },
    { name: "address", type: "String", required: false },
  ],
  PurchaseOrder: [
    { name: "totalAmount", type: "Float", required: true },
    { name: "status", type: "String", required: true, default: '"pending"' },
    { name: "supplierId", type: "String", required: true },
  ],
  SalesOrder: [
    { name: "totalAmount", type: "Float", required: true },
    { name: "status", type: "String", required: true, default: '"pending"' },
    { name: "customerId", type: "String", required: false },
  ],
  Stock: [
    { name: "productId", type: "String", required: true },
    { name: "quantity", type: "Int", required: true },
    { name: "location", type: "String", required: false },
  ],
  Transaction: [
    { name: "total", type: "Float", required: true },
    { name: "status", type: "String", required: true, default: '"pending"' },
    { name: "cashierId", type: "String", required: true },
  ],
  Receipt: [
    { name: "transactionId", type: "String", required: true },
    { name: "number", type: "String", required: true, unique: true },
    { name: "total", type: "Float", required: true },
  ],
  Shift: [
    { name: "startAt", type: "DateTime", required: true },
    { name: "endAt", type: "DateTime", required: false },
    { name: "cashierId", type: "String", required: true },
    { name: "openingCash", type: "Float", required: true },
    { name: "closingCash", type: "Float", required: false },
  ],
  Customer: [
    { name: "name", type: "String", required: true },
    { name: "email", type: "String", required: false, unique: true },
    { name: "phone", type: "String", required: false },
  ],
  User: [
    { name: "email", type: "String", required: true, unique: true },
    { name: "name", type: "String", required: false },
    { name: "passwordHash", type: "String", required: true },
    { name: "role", type: "String", required: true, default: '"user"' },
  ],
  Employee: [
    { name: "name", type: "String", required: true },
    { name: "email", type: "String", required: true, unique: true },
    { name: "position", type: "String", required: false },
    { name: "department", type: "String", required: false },
    { name: "joinDate", type: "DateTime", required: true },
  ],
  Attendance: [
    { name: "employeeId", type: "String", required: true },
    { name: "date", type: "DateTime", required: true },
    { name: "checkIn", type: "DateTime", required: false },
    { name: "checkOut", type: "DateTime", required: false },
    { name: "status", type: "String", required: true, default: '"present"' },
  ],
  Payroll: [
    { name: "employeeId", type: "String", required: true },
    { name: "period", type: "String", required: true },
    { name: "baseSalary", type: "Float", required: true },
    { name: "totalDeduction", type: "Float", required: true, default: "0" },
    { name: "netSalary", type: "Float", required: true },
    { name: "status", type: "String", required: true, default: '"draft"' },
  ],
  Leave: [
    { name: "employeeId", type: "String", required: true },
    { name: "type", type: "String", required: true },
    { name: "startDate", type: "DateTime", required: true },
    { name: "endDate", type: "DateTime", required: true },
    { name: "status", type: "String", required: true, default: '"pending"' },
  ],
  Recruitment: [
    { name: "position", type: "String", required: true },
    { name: "status", type: "String", required: true, default: '"open"' },
    { name: "openedAt", type: "DateTime", required: true, default: "now()" },
  ],
  Order: [
    { name: "total", type: "Float", required: true },
    { name: "status", type: "String", required: true, default: '"pending"' },
    { name: "customerId", type: "String", required: false },
  ],
  Payment: [
    { name: "amount", type: "Float", required: true },
    { name: "method", type: "String", required: true },
    { name: "status", type: "String", required: true, default: '"pending"' },
  ],
  Cart: [
    { name: "userId", type: "String", required: true },
    { name: "status", type: "String", required: true, default: '"active"' },
  ],
  Ticket: [
    { name: "number", type: "String", required: true, unique: true },
    { name: "attractionId", type: "String", required: true },
    { name: "price", type: "Float", required: true },
    { name: "status", type: "String", required: true, default: '"valid"' },
  ],
  Attraction: [
    { name: "name", type: "String", required: true },
    { name: "description", type: "String", required: false },
    { name: "price", type: "Float", required: true },
    { name: "isActive", type: "Boolean", required: true, default: "true" },
  ],
  Visitor: [
    { name: "name", type: "String", required: false },
    { name: "ticketId", type: "String", required: true },
    { name: "visitDate", type: "DateTime", required: true, default: "now()" },
  ],
  Citizen: [
    { name: "name", type: "String", required: true },
    { name: "nik", type: "String", required: true, unique: true },
    { name: "address", type: "String", required: false },
    { name: "birthDate", type: "DateTime", required: false },
  ],
  Letter: [
    { name: "type", type: "String", required: true },
    { name: "number", type: "String", required: true, unique: true },
    { name: "requesterId", type: "String", required: true },
    { name: "status", type: "String", required: true, default: '"draft"' },
  ],
  Budget: [
    { name: "period", type: "String", required: true },
    { name: "totalAmount", type: "Float", required: true },
    { name: "usedAmount", type: "Float", required: true, default: "0" },
    { name: "status", type: "String", required: true, default: '"draft"' },
  ],
  Course: [
    { name: "title", type: "String", required: true },
    { name: "description", type: "String", required: false },
    { name: "instructorId", type: "String", required: true },
    { name: "isPublished", type: "Boolean", required: true, default: "false" },
  ],
  Enrollment: [
    { name: "studentId", type: "String", required: true },
    { name: "courseId", type: "String", required: true },
    { name: "enrolledAt", type: "DateTime", required: true, default: "now()" },
    { name: "status", type: "String", required: true, default: '"active"' },
  ],
  Exam: [
    { name: "courseId", type: "String", required: true },
    { name: "title", type: "String", required: true },
    { name: "duration", type: "Int", required: true },
    { name: "passingScore", type: "Int", required: true, default: "70" },
  ],
  Certificate: [
    { name: "studentId", type: "String", required: true },
    { name: "courseId", type: "String", required: true },
    { name: "issuedAt", type: "DateTime", required: true, default: "now()" },
    { name: "number", type: "String", required: true, unique: true },
  ],
};

const RELATION_RULES: DbRelation[] = [
  { from: "PurchaseOrder", to: "Supplier", type: "many-to-one", fieldName: "supplier" },
  { from: "Stock", to: "Product", type: "many-to-one", fieldName: "product" },
  { from: "Transaction", to: "Shift", type: "many-to-one", fieldName: "shift" },
  { from: "Receipt", to: "Transaction", type: "one-to-one", fieldName: "transaction" },
  { from: "Attendance", to: "Employee", type: "many-to-one", fieldName: "employee" },
  { from: "Payroll", to: "Employee", type: "many-to-one", fieldName: "employee" },
  { from: "Leave", to: "Employee", type: "many-to-one", fieldName: "employee" },
  { from: "Enrollment", to: "Course", type: "many-to-one", fieldName: "course" },
  { from: "Enrollment", to: "Employee", type: "many-to-one", fieldName: "student" },
  { from: "Certificate", to: "Course", type: "many-to-one", fieldName: "course" },
  { from: "Visitor", to: "Ticket", type: "one-to-one", fieldName: "ticket" },
  { from: "Letter", to: "Citizen", type: "many-to-one", fieldName: "requester" },
  { from: "Product", to: "Category", type: "many-to-one", fieldName: "category" },
  { from: "Order", to: "Customer", type: "many-to-one", fieldName: "customer" },
  { from: "Payment", to: "Order", type: "many-to-one", fieldName: "order" },
];

const STATUS_ENUMS: Record<string, string[]> = {
  OrderStatus: ["pending", "processing", "completed", "cancelled"],
  PaymentStatus: ["pending", "paid", "failed", "refunded"],
  AttendanceStatus: ["present", "absent", "late", "leave"],
  LeaveStatus: ["pending", "approved", "rejected"],
  TicketStatus: ["valid", "used", "expired"],
};

function defaultFieldsFor(entity: string): DbField[] {
  return ENTITY_FIELDS[entity] ?? [{ name: "name", type: "String", required: true }];
}

function relationsFor(entity: string, allEntities: string[]): DbRelation[] {
  return RELATION_RULES.filter(
    (r) => r.from === entity && allEntities.includes(r.to)
  );
}

function indexesFor(entity: string, fields: DbField[]): DbIndex[] {
  const fkFields = fields.filter((f) => f.name.endsWith("Id") && !f.primaryKey).map((f) => f.name);
  return fkFields.map((fk) => ({ entity, fields: [fk] }));
}

export class DatabaseDesignerPlanner {
  design(plan: ProjectPlan): DatabasePlan {
    const entityNames = plan.entities.length > 0
      ? plan.entities
      : plan.modules
          .filter((m) => !["auth", "report", "dashboard"].includes(m))
          .map((m) => m.charAt(0).toUpperCase() + m.slice(1));

    const entities: DbEntity[] = entityNames.map((name) => {
      const fields: DbField[] = [
        ...BASE_FIELDS.map((f) => ({ ...f })),
        ...defaultFieldsFor(name),
      ];
      const relations = relationsFor(name, entityNames);
      const indexes = indexesFor(name, fields);
      return { name, fields, relations, indexes };
    });

    const relevantEnums = Object.entries(STATUS_ENUMS)
      .filter(([enumName]) => {
        const prefix = enumName.replace("Status", "").toLowerCase();
        return entityNames.some((e) => e.toLowerCase().includes(prefix));
      })
      .map(([name, values]) => ({ name, values }));

    return { entities, enums: relevantEnums };
  }
}
