/**
 * RBAC seed — idempotent via upsert.
 * Run: node -r ../.node-home/shim.cjs ../../node_modules/tsx/dist/cli.mjs seed/rbac.ts
 */
import { PrismaClient } from "../../generated/prisma";
import { PERMISSION_DEFINITIONS } from "../../lib/rbac/permissions";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Upsert all permissions ────────────────────────────────────────────
  console.log("Seeding permissions…");
  for (const def of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { code: def.code },
      update: { name: def.name, module: def.module, description: def.description ?? null },
      create: { code: def.code, name: def.name, module: def.module, description: def.description ?? null },
    });
  }
  console.log(`  ✓ ${PERMISSION_DEFINITIONS.length} permissions upserted`);

  // ── 2. Ensure core roles exist ───────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });

  const superRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN" },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: "Staff" },
    update: {},
    create: { name: "Staff" },
  });

  const kasirRole = await prisma.role.upsert({
    where: { name: "Kasir" },
    update: {},
    create: { name: "Kasir" },
  });
  console.log("  ✓ Roles: Admin, SUPER_ADMIN, Staff, Kasir upserted");

  // ── 3. Admin gets every permission ──────────────────────────────────────
  const allPerms = await prisma.permission.findMany({ select: { id: true } });
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  console.log(`  ✓ Admin: ${allPerms.length} permissions assigned`);

  // ── 4. SUPER_ADMIN gets every permission too ─────────────────────────────
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superRole.id, permissionId: perm.id },
    });
  }
  console.log(`  ✓ SUPER_ADMIN: ${allPerms.length} permissions assigned`);

  // ── 5. Staff: read-only access ───────────────────────────────────────────
  const staffCodes = [
    "ticket.view", "category.view", "destination.view", "facility.view",
    "gate.view", "visitor.view", "reservation.view", "payment.view",
    "report.view", "employee.view",
  ];
  const staffPerms = await prisma.permission.findMany({
    where: { code: { in: staffCodes } },
    select: { id: true },
  });
  for (const perm of staffPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: staffRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: staffRole.id, permissionId: perm.id },
    });
  }
  console.log(`  ✓ Staff: ${staffPerms.length} permissions assigned (read-only)`);

  // ── 6. Kasir: reservation + payment CRUD ────────────────────────────────
  const kasirCodes = [
    "ticket.view",
    "visitor.view", "visitor.create",
    "reservation.view", "reservation.create", "reservation.update",
    "payment.view", "payment.create", "payment.update",
    "report.view",
  ];
  const kasirPerms = await prisma.permission.findMany({
    where: { code: { in: kasirCodes } },
    select: { id: true },
  });
  for (const perm of kasirPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: kasirRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: kasirRole.id, permissionId: perm.id },
    });
  }
  console.log(`  ✓ Kasir: ${kasirPerms.length} permissions assigned`);

  // ── 7. Ensure admin user exists and is Admin role ────────────────────────
  const { default: bcrypt } = await import("bcryptjs");
  const hash = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@lontarsewu.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@lontarsewu.com",
      password: hash,
      roleId: adminRole.id,
    },
  });
  console.log(`  ✓ Admin user: ${adminUser.email}`);

  console.log("\n════════════════════════════════════");
  console.log("RBAC SEED SELESAI");
  console.log("════════════════════════════════════");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
