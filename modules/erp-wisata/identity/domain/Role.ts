export interface Role {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAudit {
  actorId?: string;
  action: string;
  at: string;
  metadata: Record<string, unknown>;
}
