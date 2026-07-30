import type { ProjectPlan } from "./ProjectPlanner.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiParameter {
  name: string;
  in: "path" | "query" | "body" | "header";
  required: boolean;
  type: string;
  description?: string;
}

export interface ApiResponse {
  status: number;
  description: string;
  schema?: string;
}

export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  operationId: string;
  summary: string;
  tags: string[];
  parameters: ApiParameter[];
  responses: ApiResponse[];
  auth: boolean;
  roles: string[];
  rateLimit?: { requests: number; windowSeconds: number };
  validation?: string[];
}

export interface ApiSwagger {
  openapi: string;
  title: string;
  version: string;
  basePath: string;
  tags: Array<{ name: string; description: string }>;
}

export interface ApiPlan {
  swagger: ApiSwagger;
  endpoints: ApiEndpoint[];
  authentication: {
    type: "jwt" | "none";
    headerName: string;
    scheme: string;
  };
  rateLimits: {
    global: { requests: number; windowSeconds: number };
    perEndpoint: Record<string, { requests: number; windowSeconds: number }>;
  };
  validation: Record<string, string[]>;
  authorization: Record<string, string[]>;
}

const QUERY_PARAMS: ApiParameter[] = [
  { name: "page", in: "query", required: false, type: "integer", description: "Page number (1-based)" },
  { name: "pageSize", in: "query", required: false, type: "integer", description: "Items per page (default 20)" },
  { name: "search", in: "query", required: false, type: "string", description: "Full-text search" },
  { name: "sortBy", in: "query", required: false, type: "string", description: "Sort field" },
  { name: "sortOrder", in: "query", required: false, type: "string", description: "asc | desc" },
];

const ID_PARAM: ApiParameter = { name: "id", in: "path", required: true, type: "string", description: "Resource ID" };

function endpointsForEntity(entity: string, hasAuth: boolean, roles: string[]): ApiEndpoint[] {
  const tag = entity;
  const base = `/api/${entity.toLowerCase()}s`;
  const rateLimit = { requests: 100, windowSeconds: 60 };
  const writeRateLimit = { requests: 30, windowSeconds: 60 };
  const writeRoles = roles.filter((r) => r !== "viewer");

  return [
    // GET list
    {
      method: "GET", path: base, operationId: `list${entity}s`, summary: `List all ${entity}s`,
      tags: [tag], parameters: QUERY_PARAMS, auth: hasAuth, roles,
      responses: [{ status: 200, description: `List of ${entity}s`, schema: `Paginated<${entity}>` }, { status: 401, description: "Unauthorized" }],
      rateLimit, validation: [],
    },
    // GET by id
    {
      method: "GET", path: `${base}/{id}`, operationId: `get${entity}`, summary: `Get ${entity} by ID`,
      tags: [tag], parameters: [ID_PARAM], auth: hasAuth, roles,
      responses: [{ status: 200, description: entity, schema: entity }, { status: 404, description: "Not found" }, { status: 401, description: "Unauthorized" }],
      rateLimit, validation: [],
    },
    // POST create
    {
      method: "POST", path: base, operationId: `create${entity}`, summary: `Create ${entity}`,
      tags: [tag], parameters: [{ name: "body", in: "body", required: true, type: entity, description: `${entity} payload` }],
      auth: hasAuth, roles: writeRoles,
      responses: [{ status: 201, description: `${entity} created`, schema: entity }, { status: 400, description: "Validation error" }, { status: 401, description: "Unauthorized" }],
      rateLimit: writeRateLimit, validation: [`${entity}CreateSchema`],
    },
    // PUT update
    {
      method: "PUT", path: `${base}/{id}`, operationId: `update${entity}`, summary: `Update ${entity}`,
      tags: [tag], parameters: [ID_PARAM, { name: "body", in: "body", required: true, type: entity, description: `${entity} payload` }],
      auth: hasAuth, roles: writeRoles,
      responses: [{ status: 200, description: `${entity} updated`, schema: entity }, { status: 404, description: "Not found" }, { status: 400, description: "Validation error" }],
      rateLimit: writeRateLimit, validation: [`${entity}UpdateSchema`],
    },
    // DELETE
    {
      method: "DELETE", path: `${base}/{id}`, operationId: `delete${entity}`, summary: `Delete ${entity}`,
      tags: [tag], parameters: [ID_PARAM], auth: hasAuth, roles: writeRoles,
      responses: [{ status: 204, description: "Deleted" }, { status: 404, description: "Not found" }, { status: 401, description: "Unauthorized" }],
      rateLimit: writeRateLimit, validation: [],
    },
    // SEARCH
    {
      method: "POST", path: `${base}/search`, operationId: `search${entity}s`, summary: `Search ${entity}s`,
      tags: [tag], parameters: [{ name: "body", in: "body", required: true, type: "SearchQuery", description: "Search criteria" }],
      auth: hasAuth, roles,
      responses: [{ status: 200, description: `Search results`, schema: `Paginated<${entity}>` }],
      rateLimit, validation: [],
    },
    // EXPORT
    {
      method: "GET", path: `${base}/export`, operationId: `export${entity}s`, summary: `Export ${entity}s`,
      tags: [tag], parameters: [{ name: "format", in: "query", required: false, type: "string", description: "csv|excel|pdf" }, ...QUERY_PARAMS],
      auth: hasAuth, roles: writeRoles,
      responses: [{ status: 200, description: "File download" }],
      rateLimit: { requests: 10, windowSeconds: 60 }, validation: [],
    },
    // IMPORT
    {
      method: "POST", path: `${base}/import`, operationId: `import${entity}s`, summary: `Import ${entity}s from file`,
      tags: [tag], parameters: [{ name: "file", in: "body", required: true, type: "multipart/form-data", description: "CSV or Excel file" }],
      auth: hasAuth, roles: writeRoles,
      responses: [{ status: 200, description: "Import result" }, { status: 400, description: "Parse error" }],
      rateLimit: { requests: 5, windowSeconds: 60 }, validation: [],
    },
    // BULK UPDATE
    {
      method: "PATCH", path: `${base}/bulk`, operationId: `bulkUpdate${entity}s`, summary: `Bulk update ${entity}s`,
      tags: [tag], parameters: [{ name: "body", in: "body", required: true, type: `BulkUpdate<${entity}>`, description: "Array of updates" }],
      auth: hasAuth, roles: writeRoles,
      responses: [{ status: 200, description: "Updated count" }, { status: 400, description: "Validation error" }],
      rateLimit: writeRateLimit, validation: [`${entity}BulkUpdateSchema`],
    },
    // BULK DELETE
    {
      method: "DELETE", path: `${base}/bulk`, operationId: `bulkDelete${entity}s`, summary: `Bulk delete ${entity}s`,
      tags: [tag], parameters: [{ name: "body", in: "body", required: true, type: "string[]", description: "Array of IDs to delete" }],
      auth: hasAuth, roles: writeRoles,
      responses: [{ status: 200, description: "Deleted count" }, { status: 400, description: "Validation error" }],
      rateLimit: writeRateLimit, validation: [],
    },
  ];
}

export class ApiPlanner {
  plan(projectPlan: ProjectPlan): ApiPlan {
    const entities = projectPlan.entities.length > 0
      ? projectPlan.entities
      : projectPlan.modules.filter((m) => !["auth", "report", "dashboard"].includes(m))
          .map((m) => m.charAt(0).toUpperCase() + m.slice(1));

    const hasAuth = projectPlan.authentication;
    const roles = ["admin", "manager", "staff", "user"];

    const allEndpoints: ApiEndpoint[] = [];

    // Auth endpoints
    if (hasAuth) {
      allEndpoints.push(
        { method: "POST", path: "/api/auth/login", operationId: "login", summary: "User login", tags: ["Auth"], parameters: [{ name: "body", in: "body", required: true, type: "LoginDto", description: "Credentials" }], auth: false, roles: ["*"], responses: [{ status: 200, description: "JWT token" }, { status: 401, description: "Invalid credentials" }], rateLimit: { requests: 10, windowSeconds: 60 }, validation: ["LoginSchema"] },
        { method: "POST", path: "/api/auth/logout", operationId: "logout", summary: "User logout", tags: ["Auth"], parameters: [], auth: true, roles: ["*"], responses: [{ status: 204, description: "Logged out" }], rateLimit: { requests: 20, windowSeconds: 60 }, validation: [] },
        { method: "POST", path: "/api/auth/refresh", operationId: "refreshToken", summary: "Refresh access token", tags: ["Auth"], parameters: [{ name: "body", in: "body", required: true, type: "RefreshTokenDto", description: "Refresh token" }], auth: false, roles: ["*"], responses: [{ status: 200, description: "New access token" }, { status: 401, description: "Invalid token" }], rateLimit: { requests: 20, windowSeconds: 60 }, validation: [] },
      );
    }

    for (const entity of entities) {
      allEndpoints.push(...endpointsForEntity(entity, hasAuth, roles));
    }

    const swagger: ApiSwagger = {
      openapi: "3.0.0",
      title: `${projectPlan.projectType.toUpperCase()} API`,
      version: "1.0.0",
      basePath: "/api",
      tags: [
        ...(hasAuth ? [{ name: "Auth", description: "Authentication endpoints" }] : []),
        ...entities.map((e) => ({ name: e, description: `${e} CRUD and operations` })),
      ],
    };

    const validation: Record<string, string[]> = {};
    for (const entity of entities) {
      validation[entity] = [`${entity}CreateSchema`, `${entity}UpdateSchema`, `${entity}BulkUpdateSchema`];
    }

    const authorization: Record<string, string[]> = {
      admin: ["create", "read", "update", "delete", "export", "import", "bulk"],
      manager: ["create", "read", "update", "export"],
      staff: ["read", "create"],
      user: ["read"],
      viewer: ["read"],
    };

    return {
      swagger,
      endpoints: allEndpoints,
      authentication: { type: hasAuth ? "jwt" : "none", headerName: "Authorization", scheme: "Bearer" },
      rateLimits: {
        global: { requests: 200, windowSeconds: 60 },
        perEndpoint: { export: { requests: 10, windowSeconds: 60 }, import: { requests: 5, windowSeconds: 60 } },
      },
      validation,
      authorization,
    };
  }
}
