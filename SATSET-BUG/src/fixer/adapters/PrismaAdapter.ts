export interface PrismaCommand {
  action: "generate" | "validate" | "format" | "db pull" | "db push" | "migrate deploy" | "migrate dev";
  command: string;
  description: string;
}

export class PrismaAdapter {
  public generatePlans(): PrismaCommand[] {
    return [
      {
        action: "generate",
        command: "prisma generate",
        description: "Regenerate the Prisma client from the schema.",
      },
      {
        action: "validate",
        command: "prisma validate",
        description: "Validate the Prisma schema.",
      },
      {
        action: "format",
        command: "prisma format",
        description: "Format the Prisma schema file.",
      },
      {
        action: "db pull",
        command: "prisma db pull",
        description: "Sync the Prisma schema with the database state.",
      },
      {
        action: "db push",
        command: "prisma db push",
        description: "Push schema changes to the database.",
      },
      {
        action: "migrate deploy",
        command: "prisma migrate deploy",
        description: "Apply pending migrations in deployment mode.",
      },
      {
        action: "migrate dev",
        command: "prisma migrate dev",
        description: "Create and apply a new migration during development.",
      },
    ];
  }
}
