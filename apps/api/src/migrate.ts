import { readFileSync } from "node:fs";
import { join } from "node:path";

const migrationPath = join(process.cwd(), "apps", "api", "prisma", "migrations", "0001_initial", "migration.sql");
const migration = readFileSync(migrationPath, "utf8");

console.log("[migrate] workspace migration ready");
console.log(migration.trim());
