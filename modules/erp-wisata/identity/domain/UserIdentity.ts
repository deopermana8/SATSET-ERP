export interface UserIdentity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserIdentityAudit {
  actorId?: string;
  action: string;
  at: string;
  metadata: Record<string, unknown>;
}
