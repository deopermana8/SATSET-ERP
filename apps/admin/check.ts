import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Role =", typeof prisma.role);
  console.log("User =", typeof prisma.user);
  await prisma.$disconnect();
}

main();
