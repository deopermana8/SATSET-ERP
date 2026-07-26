export class UsersService {
  async list() {
    return { resource: "users", label: "User" };
  }

  async create(input: Record<string, unknown>) {
    return { ok: true, input };
  }
}
