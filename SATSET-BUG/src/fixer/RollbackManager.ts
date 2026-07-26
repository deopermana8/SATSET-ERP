export interface BackupRecord {
  id: string;
  path: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface RollbackSession {
  id: string;
  createdAt: string;
  backups: BackupRecord[];
}

export class RollbackManager {
  private readonly backups = new Map<string, BackupRecord>();
  private readonly sessions = new Map<string, RollbackSession>();

  public registerBackup(backup: BackupRecord): void {
    this.backups.set(backup.id, backup);
  }

  public createSession(sessionId: string): RollbackSession {
    const session: RollbackSession = {
      id: sessionId,
      createdAt: new Date().toISOString(),
      backups: [],
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  public restoreSession(sessionId: string): RollbackSession | null {
    return this.sessions.get(sessionId) ?? null;
  }

  public cleanup(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  public listBackups(): BackupRecord[] {
    return Array.from(this.backups.values());
  }
}
