import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const schemas = await prisma.$queryRawUnsafe(
  `SELECT schema_name FROM information_schema.schemata ORDER BY schema_name`,
);
console.log("Schémas présents :", schemas.map((s) => s.schema_name).join(", "));

const tables = await prisma.$queryRawUnsafe(
  `SELECT table_name FROM information_schema.tables WHERE table_schema = 'neon_auth' ORDER BY table_name`,
);
console.log(
  "\nTables dans neon_auth :",
  tables.length ? tables.map((t) => t.table_name).join(", ") : "(aucune)",
);

for (const { table_name } of tables) {
  try {
    const [{ count }] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int AS count FROM neon_auth."${table_name}"`,
    );
    console.log(`  - neon_auth.${table_name} : ${count} ligne(s)`);
  } catch (e) {
    console.log(`  - neon_auth.${table_name} : erreur lecture (${e.message})`);
  }
}

await prisma.$disconnect();
