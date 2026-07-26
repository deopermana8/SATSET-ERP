export type SwarmAgentName = "ArchitectAgent" | "BackendAgent" | "FrontendAgent" | "DatabaseAgent" | "APIAgent" | "SecurityAgent" | "TestingAgent" | "RepairAgent" | "BenchmarkAgent" | "DocumentationAgent";

export interface SwarmTask {
  id: string;
  title: string;
  description: string;
  priority: number;
  agent: SwarmAgentName;
  status: "queued" | "running" | "completed" | "blocked";
  attempts?: number;
}

export interface SwarmAgent {
  name: SwarmAgentName;
  queue: SwarmTask[];
  active: boolean;
  role: string;
}

export interface SwarmMessage {
  from: SwarmAgentName;
  to: SwarmAgentName;
  type: "task" | "status" | "conflict" | "knowledge";
  payload: string;
  timestamp: string;
}

export interface SwarmSnapshot {
  agents: SwarmAgent[];
  tasks: SwarmTask[];
  messages: SwarmMessage[];
}
