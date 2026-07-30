import type { ProjectPlan } from "./ProjectPlanner.js";

export interface UIComponent {
  name: string;
  type: string;
  props?: Record<string, string>;
}

export interface UIForm {
  name: string;
  entity: string;
  fields: Array<{ name: string; type: string; required: boolean; label: string }>;
  actions: string[];
}

export interface UITable {
  name: string;
  entity: string;
  columns: Array<{ key: string; label: string; sortable: boolean }>;
  features: string[];
}

export interface UIPage {
  name: string;
  path: string;
  layout: string;
  components: string[];
  roles: string[];
}

export interface UIDashboard {
  cards: Array<{ title: string; metric: string; icon: string }>;
  charts: Array<{ title: string; type: "bar" | "line" | "pie" | "area"; dataKey: string }>;
  tables: string[];
}

export interface UINavItem {
  label: string;
  path: string;
  icon: string;
  roles: string[];
  children?: UINavItem[];
}

export interface UIDialog {
  name: string;
  title: string;
  type: "confirm" | "form" | "info";
  entity?: string;
}

export interface UIFilter {
  entity: string;
  fields: Array<{ name: string; type: "text" | "select" | "date" | "range" }>;
}

export interface UIPermission {
  role: string;
  pages: string[];
  actions: string[];
}

export interface UIPlan {
  pages: UIPage[];
  components: UIComponent[];
  forms: UIForm[];
  tables: UITable[];
  dashboard: UIDashboard;
  sidebar: UINavItem[];
  navbar: { title: string; showUserMenu: boolean; showNotifications: boolean };
  buttons: Array<{ id: string; label: string; variant: string; action: string }>;
  dialogs: UIDialog[];
  charts: Array<{ title: string; type: string; entity: string }>;
  breadcrumb: boolean;
  search: Array<{ entity: string; fields: string[] }>;
  pagination: boolean;
  filters: UIFilter[];
  export: string[];
  print: string[];
  permissions: UIPermission[];
}

const ICONS: Record<string, string> = {
  product: "Package", category: "Tag", supplier: "Truck", stock: "Warehouse",
  order: "ShoppingCart", payment: "CreditCard", customer: "Users", user: "User",
  employee: "UserCheck", attendance: "Clock", payroll: "DollarSign", leave: "Calendar",
  transaction: "Receipt", shift: "AlarmClock", report: "BarChart", dashboard: "LayoutDashboard",
  course: "BookOpen", exam: "FileText", certificate: "Award", enrollment: "UserPlus",
  citizen: "Users", letter: "Mail", budget: "PiggyBank", ticket: "Ticket",
  attraction: "MapPin", visitor: "Eye", auth: "Lock", setting: "Settings",
};

function getIcon(module: string): string {
  return ICONS[module.toLowerCase()] ?? "Circle";
}

function moduleToFormFields(module: string): UIForm["fields"] {
  const defaults = [
    { name: "name", type: "text", required: true, label: "Name" },
  ];
  const extras: Record<string, UIForm["fields"]> = {
    product: [{ name: "sku", type: "text", required: false, label: "SKU" }, { name: "price", type: "number", required: true, label: "Price" }, { name: "stock", type: "number", required: true, label: "Stock" }],
    employee: [{ name: "email", type: "email", required: true, label: "Email" }, { name: "position", type: "text", required: false, label: "Position" }],
    customer: [{ name: "email", type: "email", required: false, label: "Email" }, { name: "phone", type: "text", required: false, label: "Phone" }],
    ticket: [{ name: "price", type: "number", required: true, label: "Price" }],
    payroll: [{ name: "baseSalary", type: "number", required: true, label: "Base Salary" }, { name: "period", type: "text", required: true, label: "Period" }],
  };
  return [...defaults, ...(extras[module.toLowerCase()] ?? [])];
}

function moduleToColumns(module: string): UITable["columns"] {
  const base = [
    { key: "id", label: "ID", sortable: false },
    { key: "name", label: "Name", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
  ];
  const extras: Record<string, UITable["columns"]> = {
    product: [{ key: "price", label: "Price", sortable: true }, { key: "stock", label: "Stock", sortable: true }],
    order: [{ key: "total", label: "Total", sortable: true }, { key: "status", label: "Status", sortable: false }],
    transaction: [{ key: "total", label: "Total", sortable: true }, { key: "status", label: "Status", sortable: false }],
    employee: [{ key: "email", label: "Email", sortable: false }, { key: "position", label: "Position", sortable: true }],
    payroll: [{ key: "baseSalary", label: "Salary", sortable: true }, { key: "status", label: "Status", sortable: false }],
  };
  return [...base, ...(extras[module.toLowerCase()] ?? [])];
}

export class UIPlanner {
  plan(projectPlan: ProjectPlan): UIPlan {
    const crudModules = projectPlan.modules.filter(
      (m) => !["auth", "report", "dashboard"].includes(m)
    );
    const hasAuth = projectPlan.authentication;

    // Pages
    const pages: UIPage[] = [];
    if (hasAuth) {
      pages.push({ name: "LoginPage", path: "/login", layout: "auth", components: ["LoginForm"], roles: ["*"] });
    }
    pages.push({ name: "DashboardPage", path: "/", layout: "main", components: ["DashboardCards", "DashboardCharts"], roles: projectPlan.navigation });
    for (const m of crudModules) {
      const cap = m.charAt(0).toUpperCase() + m.slice(1);
      pages.push({ name: `${cap}ListPage`, path: `/${m}`, layout: "main", components: [`${cap}Table`, `${cap}SearchBar`], roles: ["admin", "manager", "staff"] });
      pages.push({ name: `${cap}FormPage`, path: `/${m}/new`, layout: "main", components: [`${cap}Form`], roles: ["admin", "manager"] });
    }
    if (projectPlan.reports.length > 0) {
      pages.push({ name: "ReportPage", path: "/reports", layout: "main", components: ["ReportFilter", "ReportTable", "ExportButton"], roles: ["admin", "manager"] });
    }

    // Components
    const components: UIComponent[] = [
      { name: "Navbar", type: "navigation", props: { showSearch: "true", showNotifications: "true" } },
      { name: "Sidebar", type: "navigation", props: { collapsible: "true" } },
      { name: "Breadcrumb", type: "navigation" },
      { name: "Pagination", type: "data", props: { pageSize: "20" } },
      { name: "SearchBar", type: "input", props: { debounce: "300" } },
      { name: "ExportButton", type: "action", props: { formats: "csv,excel,pdf" } },
      { name: "PrintButton", type: "action" },
      ...crudModules.map((m) => ({
        name: `${m.charAt(0).toUpperCase() + m.slice(1)}Table`,
        type: "table",
        props: { sortable: "true", filterable: "true", exportable: "true" },
      })),
    ];

    // Forms
    const forms: UIForm[] = crudModules.map((m) => ({
      name: `${m.charAt(0).toUpperCase() + m.slice(1)}Form`,
      entity: m.charAt(0).toUpperCase() + m.slice(1),
      fields: moduleToFormFields(m),
      actions: ["save", "cancel", "reset"],
    }));

    // Tables
    const tables: UITable[] = crudModules.map((m) => ({
      name: `${m.charAt(0).toUpperCase() + m.slice(1)}Table`,
      entity: m.charAt(0).toUpperCase() + m.slice(1),
      columns: moduleToColumns(m),
      features: ["sort", "filter", "pagination", "export", "search"],
    }));

    // Dashboard
    const dashboard: UIDashboard = {
      cards: projectPlan.dashboard.map((d, i) => ({ title: d, metric: "0", icon: getIcon(crudModules[i] ?? "dashboard") })),
      charts: crudModules.slice(0, 3).map((m, i) => ({
        title: `${m.charAt(0).toUpperCase() + m.slice(1)} Trend`,
        type: (["bar", "line", "pie"] as const)[i % 3]!,
        dataKey: m,
      })),
      tables: crudModules.slice(0, 2).map((m) => `${m.charAt(0).toUpperCase() + m.slice(1)}Table`),
    };

    // Sidebar
    const sidebar: UINavItem[] = [
      { label: "Dashboard", path: "/", icon: "LayoutDashboard", roles: ["*"] },
      ...crudModules.map((m) => ({ label: m.charAt(0).toUpperCase() + m.slice(1), path: `/${m}`, icon: getIcon(m), roles: ["admin", "manager", "staff"] })),
      ...(projectPlan.reports.length > 0 ? [{ label: "Reports", path: "/reports", icon: "BarChart", roles: ["admin", "manager"] }] : []),
    ];

    // Dialogs
    const dialogs: UIDialog[] = [
      { name: "ConfirmDeleteDialog", title: "Confirm Delete", type: "confirm" },
      { name: "ConfirmLogoutDialog", title: "Confirm Logout", type: "confirm" },
      ...crudModules.slice(0, 3).map((m) => ({ name: `${m.charAt(0).toUpperCase() + m.slice(1)}QuickViewDialog`, title: m.charAt(0).toUpperCase() + m.slice(1), type: "info" as const, entity: m.charAt(0).toUpperCase() + m.slice(1) })),
    ];

    // Charts
    const charts = dashboard.charts.map((c) => ({ title: c.title, type: c.type, entity: c.dataKey }));

    // Search
    const search = crudModules.map((m) => ({ entity: m.charAt(0).toUpperCase() + m.slice(1), fields: ["name", "id"] }));

    // Filters
    const filters: UIFilter[] = crudModules.map((m) => ({
      entity: m.charAt(0).toUpperCase() + m.slice(1),
      fields: [
        { name: "search", type: "text" as const },
        { name: "status", type: "select" as const },
        { name: "createdAt", type: "date" as const },
      ],
    }));

    // Permissions
    const permissions: UIPermission[] = [
      { role: "admin", pages: pages.map((p) => p.name), actions: ["create", "read", "update", "delete", "export", "print"] },
      { role: "manager", pages: pages.filter((p) => p.name !== "LoginPage").map((p) => p.name), actions: ["create", "read", "update", "export"] },
      { role: "staff", pages: pages.filter((p) => p.layout === "main" && !p.name.includes("Form")).map((p) => p.name), actions: ["read"] },
    ];

    return {
      pages,
      components,
      forms,
      tables,
      dashboard,
      sidebar,
      navbar: { title: projectPlan.projectType, showUserMenu: hasAuth, showNotifications: true },
      buttons: [
        { id: "btn-new", label: "New", variant: "primary", action: "create" },
        { id: "btn-edit", label: "Edit", variant: "secondary", action: "update" },
        { id: "btn-delete", label: "Delete", variant: "danger", action: "delete" },
        { id: "btn-export", label: "Export", variant: "outline", action: "export" },
        { id: "btn-print", label: "Print", variant: "outline", action: "print" },
      ],
      dialogs,
      charts,
      breadcrumb: true,
      search,
      pagination: true,
      filters,
      export: ["csv", "excel", "pdf"],
      print: crudModules.map((m) => `${m.charAt(0).toUpperCase() + m.slice(1)}PrintView`),
      permissions,
    };
  }
}
