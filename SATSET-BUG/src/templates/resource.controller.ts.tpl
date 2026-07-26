export class {{ControllerName}} {
  constructor(private readonly service = new (class {})()) {}

  async list() {
    return {
      resource: "{{resourceLabel}}",
      routes: {{routesList}},
      useCases: {{useCasesList}},
    };
  }

  async create(input: Record<string, unknown>) {
    return { ok: true, input, resource: "{{resourceName}}" };
  }
}
