const { PrismaClient } = require('./generated/prisma');

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { id: 'asc' }
    });
    console.log(JSON.stringify(rows, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
