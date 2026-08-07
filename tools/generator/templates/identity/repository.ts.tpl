export interface IdentityRepository {
  findUserById(userId: string): Promise<unknown | null>;
  findUserByCredential(input: { email?: string; phone?: string; username?: string }): Promise<unknown | null>;
  saveSession(input: {
    userId: string;
    refreshToken: string;
    rememberMe: boolean;
    deviceId: string;
    expiresAt: string;
  }): Promise<void>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
  appendAudit(input: {
    userId?: string;
    action: string;
    entityName: string;
    entityId?: string;
    status: "ok" | "failed";
    metadata: Record<string, unknown>;
  }): Promise<void>;
}
