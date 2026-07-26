export class {{ServiceName}} {
  async list() {
    return { resource: "{{resourceName}}", label: "{{resourceLabel}}" };
  }

  async create(input: Record<string, unknown>) {
    return { ok: true, input };
  }
}
