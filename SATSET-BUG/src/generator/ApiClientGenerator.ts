import fs from "node:fs";
import path from "node:path";
import type { DomainModel, DomainEntity } from "./DomainModelGenerator.js";

export interface ApiClientGenerateResult {
  written: string[];
  errors: string[];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function clientFile(entity: DomainEntity): string {
  const n = entity.name;
  const C = cap(n);
  return `import type { Create${C}Dto, Update${C}Dto, ${C}Dto, Paginated${C}Dto, ${C}QueryDto } from "../dto/${n}.dto.js";

const BASE = typeof window !== "undefined" ? "" : "http://localhost:3000";

async function req<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(\`\${BASE}\${url}\`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(\`\${method} \${url} failed: \${res.status}\`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const ${n}Api = {
  list(query?: ${C}QueryDto): Promise<Paginated${C}Dto> {
    const params = new URLSearchParams();
    if (query?.page) params.set("page", String(query.page));
    if (query?.pageSize) params.set("pageSize", String(query.pageSize));
    if (query?.search) params.set("search", query.search);
    if (query?.sortBy) params.set("sortBy", query.sortBy);
    if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
    const qs = params.toString();
    return req<Paginated${C}Dto>("GET", \`/api/${n}s\${qs ? "?" + qs : ""}\`);
  },

  get(id: string): Promise<${C}Dto> {
    return req<${C}Dto>("GET", \`/api/${n}s/\${id}\`);
  },

  create(data: Create${C}Dto): Promise<${C}Dto> {
    return req<${C}Dto>("POST", "/api/${n}s", data);
  },

  update(id: string, data: Update${C}Dto): Promise<${C}Dto> {
    return req<${C}Dto>("PUT", \`/api/${n}s/\${id}\`, data);
  },

  delete(id: string): Promise<void> {
    return req<void>("DELETE", \`/api/${n}s/\${id}\`);
  },
};
`;
}

export class ApiClientGenerator {
  generate(model: DomainModel, outputDir: string): ApiClientGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const dir = path.join(outputDir, "src", "api");
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      errors.push(`failed to create api dir: ${err instanceof Error ? err.message : String(err)}`);
      return { written, errors };
    }

    for (const entity of model.entities) {
      const target = path.join(dir, `${entity.name}Api.ts`);
      try {
        fs.writeFileSync(target, clientFile(entity), "utf8");
        written.push(target);
      } catch (err) {
        errors.push(`failed to write ${entity.name}Api.ts: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { written, errors };
  }
}
