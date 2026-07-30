import type { GenerationContext } from "../generator/IGenerator.js";

export interface ProjectPlan {
  projectType: string;
  modules: string[];
  entities: string[];
  pages: string[];
  api: string[];
  database: string[];
  authentication: boolean;
  reports: string[];
  dashboard: string[];
  navigation: string[];
  structure: ProjectStructure;
}

export interface ProjectStructure {
  frontend: string[];
  backend: string[];
  shared: string[];
}

// --- Domain blueprints ---
const BLUEPRINTS: Record<string, {
  modules: string[];
  entities: string[];
  reports: string[];
  dashboard: string[];
}> = {
  pos: {
    modules: ["cashier", "product", "transaction", "receipt", "shift", "report", "customer", "auth"],
    entities: ["Product", "Transaction", "Receipt", "Shift", "Customer", "User"],
    reports: ["SalesReport", "ShiftReport", "ProductReport"],
    dashboard: ["SalesSummary", "TopProducts", "DailyRevenue"],
  },
  erp: {
    modules: ["purchase", "sales", "inventory", "accounting", "supplier", "customer", "report", "auth"],
    entities: ["PurchaseOrder", "SalesOrder", "Inventory", "Account", "Supplier", "Customer"],
    reports: ["PurchaseReport", "SalesReport", "InventoryReport", "FinanceReport"],
    dashboard: ["Revenue", "Expenses", "StockLevel", "OrderStatus"],
  },
  hris: {
    modules: ["employee", "attendance", "payroll", "leave", "recruitment", "report", "auth"],
    entities: ["Employee", "Attendance", "Payroll", "Leave", "Recruitment"],
    reports: ["AttendanceReport", "PayrollReport", "LeaveReport"],
    dashboard: ["HeadCount", "AttendanceRate", "PayrollSummary"],
  },
  lms: {
    modules: ["course", "student", "instructor", "enrollment", "exam", "certificate", "report", "auth"],
    entities: ["Course", "Student", "Instructor", "Enrollment", "Exam", "Certificate"],
    reports: ["EnrollmentReport", "ExamReport", "ProgressReport"],
    dashboard: ["ActiveStudents", "CourseCompletion", "ExamScores"],
  },
  village: {
    modules: ["citizen", "letter", "budget", "report", "auth"],
    entities: ["Citizen", "Letter", "Budget", "Village"],
    reports: ["CitizenReport", "BudgetReport", "ActivityReport"],
    dashboard: ["Population", "BudgetUsage", "LetterCount"],
  },
  tourism: {
    modules: ["ticket", "visitor", "attraction", "payment", "report", "auth"],
    entities: ["Ticket", "Visitor", "Attraction", "Payment"],
    reports: ["VisitorReport", "RevenueReport", "AttractionReport"],
    dashboard: ["DailyVisitors", "Revenue", "TopAttractions"],
  },
  ecommerce: {
    modules: ["product", "category", "order", "payment", "cart", "customer", "report", "auth"],
    entities: ["Product", "Category", "Order", "Payment", "Cart", "Customer"],
    reports: ["SalesReport", "ProductReport", "CustomerReport"],
    dashboard: ["Revenue", "Orders", "TopProducts", "NewCustomers"],
  },
  inventory: {
    modules: ["product", "category", "supplier", "purchase", "sales", "stock", "report", "auth"],
    entities: ["Product", "Category", "Supplier", "PurchaseOrder", "SalesOrder", "Stock"],
    reports: ["StockReport", "PurchaseReport", "SalesReport"],
    dashboard: ["StockLevel", "LowStock", "PendingOrders"],
  },
};

const AUTH_MODULES = new Set(["auth", "login", "user", "role", "permission"]);
const REPORT_MODULES = new Set(["report", "laporan", "analytics"]);

function inferFromModules(modules: string[]): {
  entities: string[];
  reports: string[];
  dashboard: string[];
} {
  const entities = modules
    .filter((m) => !AUTH_MODULES.has(m) && !REPORT_MODULES.has(m))
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1));

  const reports = modules.some((m) => REPORT_MODULES.has(m))
    ? entities.map((e) => `${e}Report`)
    : [];

  const dashboard = entities.length > 0
    ? [`${entities[0]}Summary`, "Overview"]
    : ["Overview"];

  return { entities, reports, dashboard };
}

function modulesToPages(modules: string[]): string[] {
  const pages: string[] = [];
  for (const m of modules) {
    if (AUTH_MODULES.has(m)) { pages.push("LoginPage", "RegisterPage"); continue; }
    if (REPORT_MODULES.has(m)) { pages.push("ReportPage"); continue; }
    const cap = m.charAt(0).toUpperCase() + m.slice(1);
    pages.push(`${cap}ListPage`, `${cap}FormPage`);
  }
  pages.push("DashboardPage");
  return Array.from(new Set(pages));
}

function modulesToApi(modules: string[]): string[] {
  return modules
    .filter((m) => !AUTH_MODULES.has(m))
    .map((m) => `/api/${m}s`);
}

function buildNavigation(modules: string[]): string[] {
  return modules
    .filter((m) => !AUTH_MODULES.has(m))
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1));
}

function buildStructure(modules: string[]): ProjectStructure {
  return {
    frontend: ["src/components", "src/pages", "src/hooks", "src/api"],
    backend: ["src/routes", "src/controllers", "src/services", "src/repositories"],
    shared: ["src/dto", "src/schemas"],
  };
}

export class ProjectPlanner {
  plan(context: GenerationContext): ProjectPlan {
    const type = context.projectType;
    const blueprint = BLUEPRINTS[type] ?? BLUEPRINTS[context.modules[0] ?? ""] ?? null;

    let modules: string[];
    let entities: string[];
    let reports: string[];
    let dashboard: string[];

    if (blueprint) {
      // Merge blueprint modules with any extra modules from context
      const extra = context.modules.filter((m) => !blueprint.modules.includes(m));
      modules = [...blueprint.modules, ...extra];
      entities = blueprint.entities;
      reports = blueprint.reports;
      dashboard = blueprint.dashboard;
    } else if (context.modules.length > 0) {
      modules = context.modules;
      const inferred = inferFromModules(modules);
      entities = inferred.entities;
      reports = inferred.reports;
      dashboard = inferred.dashboard;
    } else {
      modules = ["auth", "dashboard", "report"];
      entities = [];
      reports = ["GeneralReport"];
      dashboard = ["Overview"];
    }

    const hasAuth = modules.some((m) => AUTH_MODULES.has(m));

    return {
      projectType: type,
      modules: Array.from(new Set(modules)),
      entities: Array.from(new Set(entities)),
      pages: modulesToPages(modules),
      api: modulesToApi(modules),
      database: ["postgresql"],
      authentication: hasAuth,
      reports: Array.from(new Set(reports)),
      dashboard: Array.from(new Set(dashboard)),
      navigation: buildNavigation(modules),
      structure: buildStructure(modules),
    };
  }
}
