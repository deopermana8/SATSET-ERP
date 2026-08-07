export interface Permission {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionAudit {
  actorId?: string;
  action: string;
  at: string;
  metadata: Record<string, unknown>;
}
