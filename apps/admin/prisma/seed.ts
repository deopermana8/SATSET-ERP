import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: "dashboard.view", name: "dashboard.view", module: "dashboard.view".split(".")[0], description: "Lihat dashboard" },
  { code: "dashboard.manage", name: "dashboard.manage", module: "dashboard.manage".split(".")[0], description: "Kelola dashboard" },

  { code: "user.view", name: "user.view", module: "user.view".split(".")[0], description: "Lihat user" },
  { code: "user.create", name: "user.create", module: "user.create".split(".")[0], description: "Buat user" },
  { code: "user.update", name: "user.update", module: "user.update".split(".")[0], description: "Edit user" },
  { code: "user.delete", name: "user.delete", module: "user.delete".split(".")[0], description: "Hapus user" },

  { code: "role.view", name: "role.view", module: "role.view".split(".")[0], description: "Lihat role" },
  { code: "role.create", name: "role.create", module: "role.create".split(".")[0], description: "Buat role" },
  { code: "role.update", name: "role.update", module: "role.update".split(".")[0], description: "Edit role" },
  { code: "role.delete", name: "role.delete", module: "role.delete".split(".")[0], description: "Hapus role" },

  { code: "permission.view", name: "permission.view", module: "permission.view".split(".")[0], description: "Lihat permission" },
  { code: "permission.create", name: "permission.create", module: "permission.create".split(".")[0], description: "Buat permission" },
  { code: "permission.update", name: "permission.update", module: "permission.update".split(".")[0], description: "Edit permission" },
  { code: "permission.delete", name: "permission.delete", module: "permission.delete".split(".")[0], description: "Hapus permission" },
];

async function main() {
  // â”€â”€ Task 011 & 014: upsert permissions (idempotent) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const upsertedPerms: { id: number; name: string }[] = [];

  for (const perm of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: { code: perm.code, name: perm.name, module: perm.module, description: perm.description },
    });
    upsertedPerms.push(record);
    console.log(`Permission created/verified: ${record.name}`);
  }

  // â”€â”€ Task 012 & 014: upsert Admin role (idempotent) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const adminRole = await prisma.role.upsert({
    where:  { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });
  console.log(`Role created/verified: ${adminRole.name}`);

  // â”€â”€ Task 013 & 014: assign all permissions to Admin (idempotent) â”€â”€â”€â”€â”€â”€â”€â”€â”€
  for (const perm of upsertedPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId:       adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId:       adminRole.id,
        permissionId: perm.id,
      },
    });
    console.log(`RolePermission assigned: ${adminRole.name} â†’ ${perm.name}`);
  }

  // â”€â”€ Task 015: final log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());



