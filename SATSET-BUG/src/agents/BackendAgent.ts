import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";

export class BackendAgent implements IEngine {
  public readonly name = "BackendAgent";

  async run(context: Context): Promise<void> {
    const mesh = (context.metadata as Record<string, unknown>).agentMesh as { history?: Array<{ agent: string; status: string; confidence: number }> } | undefined;
    const history = [...(mesh?.history ?? [])];
    history.push({ agent: this.name, status: "completed", confidence: 0.82 });
    context.metadata = {
      ...context.metadata,
      agentMesh: {
        ...(mesh ?? {}),
        history,
      },
    } as typeof context.metadata & { agentMesh?: { history?: Array<{ agent: string; status: string; confidence: number }> } };
  }
}
