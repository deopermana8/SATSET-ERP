export class ApiGenerator {
  generate(): string[] {
    return ["src/api/routes.ts", "src/api/openapi.ts"];
  }
}
