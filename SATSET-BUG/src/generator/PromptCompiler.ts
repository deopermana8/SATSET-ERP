import { parseRequirement } from "../ai/RequirementParser.js";
import { planModules } from "../ai/ModulePlanner.js";
import { generateDomainModel } from "../generator/DomainModelGenerator.js";
import type { GenerationContext } from "../generator/IGenerator.js";

export interface CompiledContext extends GenerationContext {
  entities: string[];
  pages: string[];
  database: string[];
  roles: string[];
  hasAuthentication: boolean;
  hasCrud: boolean;
  hasReports: boolean;
  hasDashboard: boolean;
}

const AUTH_KEYWORDS = ["login", "auth", "register", "jwt", "oauth", "sso", "rbac", "role", "permission", "akun", "masuk"];
const CRUD_KEYWORDS = ["create", "read", "update", "delete", "crud", "tambah", "hapus", "edit", "simpan", "manage"];
const REPORT_KEYWORDS = ["report", "laporan", "rekap", "analytic", "statistik", "chart", "grafik", "export"];
const DASHBOARD_KEYWORDS = ["dashboard", "panel", "summary", "ringkasan", "overview", "monitor", "home"];

const ROLE_MAP: Array<{ keywords: string[]; role: string }> = [
  { keywords: ["admin", "administrator", "superuser"], role: "admin" },
  { keywords: ["manager", "manajer", "supervisor"], role: "manager" },
  { keywords: ["kasir", "cashier", "operator"], role: "cashier" },
  { keywords: ["guru", "teacher", "pengajar"], role: "teacher" },
  { keywords: ["siswa", "student", "pelajar"], role: "student" },
  { keywords: ["petugas", "staff", "pegawai", "karyawan"], role: "staff" },
  { keywords: ["user", "pengguna", "member", "pelanggan", "customer"], role: "user" },
  { keywords: ["viewer", "guest", "tamu"], role: "viewer" },
];

const PAGE_MAP: Record<string, string[]> = {
  auth: ["LoginPage", "RegisterPage"],
  dashboard: ["DashboardPage"],
  report: ["ReportPage"],
  product: ["ProductListPage", "ProductFormPage", "ProductDetailPage"],
  order: ["OrderListPage", "OrderFormPage", "OrderDetailPage"],
  user: ["UserListPage", "UserFormPage"],
  inventory: ["InventoryPage"],
  category: ["CategoryPage"],
  supplier: ["SupplierPage"],
  employee: ["EmployeeListPage", "EmployeeFormPage"],
  course: ["CourseListPage", "CourseDetailPage"],
  exam: ["ExamPage"],
  ticket: ["TicketPage"],
  citizen: ["CitizenPage"],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function hasAny(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw));
}

function extractRoles(text: string): string[] {
  const roles: string[] = [];
  for (const entry of ROLE_MAP) {
    if (entry.keywords.some((kw) => text.includes(kw))) {
      roles.push(entry.role);
    }
  }
  return roles.length > 0 ? roles : ["admin", "user"];
}

function inferPages(modules: string[]): string[] {
  const pages: string[] = [];
  for (const module of modules) {
    const modulePagesMap = PAGE_MAP[module];
    if (modulePagesMap) pages.push(...modulePagesMap);
  }
  if (pages.length === 0) pages.push("HomePage");
  return Array.from(new Set(pages));
}

export class PromptCompiler {
  compile(requirement: string): CompiledContext {
    const text = normalize(requirement);
    const parsed = parseRequirement(requirement);
    const plan = planModules(parsed);
    const domain = generateDomainModel(parsed);

    const hasAuthentication = hasAny(text, AUTH_KEYWORDS) || parsed.modules.includes("auth");
    const hasCrud = hasAny(text, CRUD_KEYWORDS) || parsed.modules.length > 0;
    const hasReports = hasAny(text, REPORT_KEYWORDS) || parsed.modules.includes("report");
    const hasDashboard = hasAny(text, DASHBOARD_KEYWORDS) || parsed.projectType === "admin";

    const modules = plan.modules.map((m) => m.name);
    const entities = domain.entities.map((e) => e.name);
    const roles = extractRoles(text);
    const pages = inferPages(modules);

    return {
      requirement,
      projectType: parsed.projectType,
      modules,
      outputDir: "",
      entities,
      pages,
      database: parsed.database,
      roles,
      hasAuthentication,
      hasCrud,
      hasReports,
      hasDashboard,
    };
  }
}
