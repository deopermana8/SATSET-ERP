export class MigrationGenerator {
  generate(): string[] {
    return ["src/database/migrations/init.sql"];
  }
}
