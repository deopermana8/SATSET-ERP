export interface {{aggregateName}} {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface {{aggregateName}}Audit {
  actorId?: string;
  action: string;
  at: string;
  metadata: Record<string, unknown>;
}
