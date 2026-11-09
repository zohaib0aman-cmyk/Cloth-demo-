import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../lib/seed";

const prisma = new PrismaClient();

async function main() {
  if (process.argv.includes("--if-empty")) {
    const existing = await prisma.setting.count();
    if (existing > 0) {
      console.log("Demo data already present — skipping seed.");
      return;
    }
  }
  await seedDatabase(prisma);
  console.log("Demo store seeded with sample products, orders and reviews.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
