import type { PromptTemplate } from "./PromptTemplate.js";

export const DOCUMENTATION_PROMPTS: PromptTemplate[] = [
  { id: "doc-api", category: "documentation", title: "API Documentation", template: "Buat dokumentasi API untuk {{service}} meliputi: endpoint, request/response, autentikasi, error codes, dan contoh penggunaan.", variables: ["service"] },
  { id: "doc-user-guide", category: "documentation", title: "User Guide", template: "Buat panduan pengguna untuk {{product}} dengan screenshots, langkah-langkah operasional, dan FAQ.", variables: ["product"] },
  { id: "doc-architecture", category: "documentation", title: "Architecture Document", template: "Buat dokumen arsitektur sistem {{system}} meliputi: overview, komponen, diagram, keputusan desain, dan trade-off.", variables: ["system"] },
  { id: "doc-runbook", category: "documentation", title: "Runbook / Playbook", template: "Buat runbook operasional untuk {{service}} meliputi: deployment, monitoring, incident response, dan rollback.", variables: ["service"] },
  { id: "doc-onboarding", category: "documentation", title: "Onboarding Guide", template: "Buat panduan onboarding developer untuk proyek {{project}} meliputi: setup, conventions, workflow, dan tools.", variables: ["project"] },
];
