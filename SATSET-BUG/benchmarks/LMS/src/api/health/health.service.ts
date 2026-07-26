export class HealthService {
  async list() {
    return { resource: "health", label: "Health" };
  }

  async create(input: Record<string, unknown>) {
    return { ok: true, input };
  }
}
