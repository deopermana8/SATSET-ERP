export class RuntimesService {
  async list() {
    return { resource: "runtimes", label: "runtime" };
  }

  async create(input: Record<string, unknown>) {
    return { ok: true, input };
  }
}
