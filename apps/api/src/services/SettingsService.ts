import { prisma } from "../prismaClient.js";

export const MODULE_KEYS = [
  "ticket", "reservation", "activity", "cafe", "kitchen", "gate",
  "inventory", "supplier", "purchase", "finance", "accounting",
  "customer", "report",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

// Module dependencies: key must be enabled if dependency enabled
export const MODULE_DEPS: Partial<Record<ModuleKey, ModuleKey[]>> = {
  reservation: ["ticket"],
  activity: ["reservation"],
  kitchen: ["cafe"],
  gate: ["ticket"],
  accounting: ["finance"],
};

// ── Organization ───────────────────────────────────────────────────────────

export async function getOrCreateOrganization() {
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "SATSET ERP", updatedAt: new Date() },
    });
  }
  return org;
}

export async function updateOrganization(data: {
  name?: string; legalName?: string; logo?: string; address?: string;
  phone?: string; email?: string; website?: string; village?: string;
  district?: string; regency?: string; skNumber?: string; foundedYear?: number;
}) {
  const org = await getOrCreateOrganization();
  return prisma.organization.update({
    where: { id: org.id },
    data: { ...data, updatedAt: new Date() },
  });
}

// ── Module Settings ────────────────────────────────────────────────────────

export async function getModuleSettings() {
  const org = await getOrCreateOrganization();
  const rows = await prisma.moduleSetting.findMany({ where: { organizationId: org.id } });
  const map: Record<string, boolean> = {};
  // default all enabled
  for (const key of MODULE_KEYS) map[key] = true;
  for (const row of rows) map[row.moduleKey] = row.enabled;
  return map;
}

export async function setModuleEnabled(moduleKey: ModuleKey, enabled: boolean) {
  const org = await getOrCreateOrganization();
  return prisma.moduleSetting.upsert({
    where: { organizationId_moduleKey: { organizationId: org.id, moduleKey } },
    update: { enabled, updatedAt: new Date() },
    create: { organizationId: org.id, moduleKey, enabled, updatedAt: new Date() },
  });
}

export async function setModules(updates: Record<string, boolean>) {
  const org = await getOrCreateOrganization();
  await prisma.$transaction(
    Object.entries(updates).map(([moduleKey, enabled]) =>
      prisma.moduleSetting.upsert({
        where: { organizationId_moduleKey: { organizationId: org.id, moduleKey } },
        update: { enabled, updatedAt: new Date() },
        create: { organizationId: org.id, moduleKey, enabled, updatedAt: new Date() },
      })
    )
  );
  return getModuleSettings();
}

// ── Dashboard Widget Settings ──────────────────────────────────────────────

export async function getDashboardWidgetSettings(userId?: number) {
  // global settings (userId=null) merged with user-specific overrides
  const globalRows = await prisma.dashboardWidgetSetting.findMany({ where: { userId: null } });
  const userRows = userId
    ? await prisma.dashboardWidgetSetting.findMany({ where: { userId } })
    : [];
  const map: Record<string, { hidden: boolean; pinned: boolean; sortOrder: number; width: string }> = {};
  for (const row of globalRows) map[row.widgetId] = { hidden: row.hidden, pinned: row.pinned, sortOrder: row.sortOrder, width: row.width };
  for (const row of userRows) map[row.widgetId] = { hidden: row.hidden, pinned: row.pinned, sortOrder: row.sortOrder, width: row.width };
  return map;
}

export async function setDashboardWidget(widgetId: string, patch: { hidden?: boolean; pinned?: boolean; sortOrder?: number; width?: string }, userId?: number) {
  const uid = userId ?? null;
  return prisma.dashboardWidgetSetting.upsert({
    where: { userId_widgetId: { userId: uid as number, widgetId } },
    update: { ...patch, updatedAt: new Date() },
    create: { userId: uid, widgetId, hidden: patch.hidden ?? false, pinned: patch.pinned ?? false, sortOrder: patch.sortOrder ?? 0, width: patch.width ?? "md", updatedAt: new Date() },
  });
}

export async function resetDashboardWidgets(userId?: number) {
  await prisma.dashboardWidgetSetting.deleteMany({ where: { userId: userId ?? null } });
}

// ── User / Permission Management ───────────────────────────────────────────

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true, role: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getUserPermissions(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true,
      role: { select: { name: true, rolePermissions: { select: { permission: { select: { code: true, name: true, module: true } } } } } },
      userPermissions: { select: { granted: true, permission: { select: { code: true, name: true, module: true } } } },
    },
  });
  return user;
}

export async function setUserPermission(userId: number, permissionCode: string, granted: boolean) {
  const perm = await prisma.permission.findUnique({ where: { code: permissionCode }, select: { id: true } });
  if (!perm) throw new Error(`Permission '${permissionCode}' not found`);
  return prisma.userPermission.upsert({
    where: { userId_permissionId: { userId, permissionId: perm.id } },
    update: { granted, createdAt: new Date() },
    create: { userId, permissionId: perm.id, granted },
  });
}
