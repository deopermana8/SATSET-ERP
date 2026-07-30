import type { PromptTemplate } from "./PromptTemplate.js";

export const API_PROMPTS: PromptTemplate[] = [
  { id: "api-rest", category: "api", title: "REST API", template: "Buat REST API untuk {{service}} menggunakan {{framework}} dengan endpoint CRUD, autentikasi JWT, dan dokumentasi Swagger.", variables: ["service", "framework"] },
  { id: "api-graphql", category: "api", title: "GraphQL API", template: "Buat GraphQL API untuk {{service}} dengan schema, resolver, autentikasi, dan subscription realtime.", variables: ["service"] },
  { id: "api-microservice", category: "api", title: "Microservice", template: "Buat microservice {{service_name}} untuk {{domain}} dengan message broker {{broker}}, health check, dan logging.", variables: ["service_name", "domain", "broker"] },
  { id: "api-gateway", category: "api", title: "API Gateway", template: "Buat API Gateway untuk sistem {{system}} dengan fitur: routing, rate limiting, autentikasi, dan load balancing.", variables: ["system"] },
];
