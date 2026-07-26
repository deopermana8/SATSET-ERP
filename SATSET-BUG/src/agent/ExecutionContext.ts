export interface AgentTask {
  id: string;
  title: string;
  type: "analyze" | "repair" | "verify" | "report";
  priority: number;
  status: "pending" | "running" | "completed" | "failed";
  attempts: number;
  goalId?: string;
  summary?: string;
  error?: string;
}

export interface AgentGoal {
  id: string;
  title: string;
  description: string;
  status: "planned" | "running" | "completed" | "blocked";
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecutionEntry {
  id: string;
  goalId: string;
  taskId: string;
  status: "running" | "completed" | "failed";
  summary: string;
  timestamp: string;
  error?: string;
}

export interface AgentPlan {
  goal: string;
  tasks: AgentTask[];
  createdAt: string;
  status: "planned" | "running" | "completed";
}
