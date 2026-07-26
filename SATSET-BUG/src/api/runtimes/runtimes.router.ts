export class RuntimesController {
  constructor(private readonly service = new (class {})()) {}

  async list() {
    return {
      resource: "runtime",
      routes: ["GET /runtimes","POST /runtimes"],
      useCases: ["Create resource","List resources"],
    };
  }

  async create(input: Record<string, unknown>) {
    return { ok: true, input, resource: "runtimes" };
  }
}
