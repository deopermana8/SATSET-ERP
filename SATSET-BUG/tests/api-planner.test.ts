import assert from "node:assert/strict";
import { ProjectPlanner } from "../src/planner/ProjectPlanner.js";
import { ApiPlanner } from "../src/planner/ApiPlanner.js";

async function main(): Promise<void> {
  const planner = new ProjectPlanner();
  const apiPlanner = new ApiPlanner();

  const plan = planner.plan({ requirement: "inventory", projectType: "inventory", modules: [], outputDir: "" });
  const api = apiPlanner.plan(plan);

  // Swagger
  assert.ok(api.swagger.openapi.startsWith("3."), "swagger must be OpenAPI 3.x");
  assert.ok(api.swagger.title.length > 0, "swagger must have title");
  assert.ok(api.swagger.tags.length > 0, "swagger must have tags");

  // Endpoints
  assert.ok(api.endpoints.length > 0, "must have endpoints");

  const methods = new Set(api.endpoints.map((e) => e.method));
  assert.ok(methods.has("GET"), "must have GET endpoints");
  assert.ok(methods.has("POST"), "must have POST endpoints");
  assert.ok(methods.has("PUT"), "must have PUT endpoints");
  assert.ok(methods.has("DELETE"), "must have DELETE endpoints");
  assert.ok(methods.has("PATCH"), "must have PATCH endpoints (bulk update)");

  const ops = api.endpoints.map((e) => e.operationId);
  assert.ok(ops.some((o) => o.startsWith("export")), "must have export endpoint");
  assert.ok(ops.some((o) => o.startsWith("import")), "must have import endpoint");
  assert.ok(ops.some((o) => o.startsWith("bulkUpdate")), "must have bulk update endpoint");
  assert.ok(ops.some((o) => o.startsWith("bulkDelete")), "must have bulk delete endpoint");
  assert.ok(ops.some((o) => o.startsWith("search")), "must have search endpoint");

  // Auth
  assert.ok(api.authentication.type === "jwt", "must use JWT auth");
  assert.ok(api.endpoints.some((e) => e.operationId === "login"), "must have login endpoint");
  assert.ok(api.endpoints.some((e) => e.operationId === "refreshToken"), "must have refresh endpoint");

  // Rate limits
  assert.ok(api.rateLimits.global.requests > 0, "must have global rate limit");
  assert.ok(api.endpoints.every((e) => e.rateLimit === undefined || e.rateLimit.requests > 0), "rate limits must be positive");

  // Validation
  assert.ok(Object.keys(api.validation).length > 0, "must have validation schemas");

  // Authorization
  assert.ok(api.authorization["admin"]?.includes("delete"), "admin must be able to delete");
  assert.ok(api.authorization["viewer"]?.includes("read"), "viewer must be able to read");

  // All endpoints have responses
  assert.ok(api.endpoints.every((e) => e.responses.length > 0), "every endpoint must have responses");

  console.log("api-planner test passed");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
