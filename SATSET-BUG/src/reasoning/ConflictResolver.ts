export class ConflictResolver {
  resolve(values: string[]): string[] {
    return Array.from(new Set(values));
  }
}
