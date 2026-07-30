export interface Template {
  id: string;
  name: string;
  content: string;
}

export class TemplateRegistry {
  private readonly templates: Map<string, Template> = new Map();

  register(template: Template): void {
    this.templates.set(template.id, template);
  }

  unregister(id: string): void {
    this.templates.delete(id);
  }

  get(id: string): Template | undefined {
    return this.templates.get(id);
  }

  list(): Template[] {
    return Array.from(this.templates.values());
  }
}
