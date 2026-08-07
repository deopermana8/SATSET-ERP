import { PrismaClient } from "../../generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!initialPassword || initialPassword.length < 12) {
    throw new Error("ADMIN_INITIAL_PASSWORD wajib di-set dan minimal 12 karakter.");
  }

  const role = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: { name: "Admin" },
  });

  const password = await bcrypt.hash(initialPassword, 12);

  await prisma.user.upsert({
    where: { email: "admin@lontarsewu.com" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@lontarsewu.com",
      password,
      roleId: role.id,
    },
  });

  console.log("ADMIN BERHASIL DIBUAT / DIPERBARUI");
  console.log("Email: admin@lontarsewu.com");
  console.log("Password: berasal dari ADMIN_INITIAL_PASSWORD");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
