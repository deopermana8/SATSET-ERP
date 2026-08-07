import { createEventBus } from "./eventBus.js";
import { withLifecycleEnvelope } from "./lifecycle.js";
import { renderAdminHtml as renderAdminDocument } from "./render.js";

const bus = createEventBus();

export const appEventBus = bus;

export function renderAdminHtml(apiUrl: string): string {
  bus.emit("app:render:start", { apiUrl });
  const html = renderAdminDocument(apiUrl);
  const wrapped = withLifecycleEnvelope(html, {
    apiUrl,
    generatedAt: new Date().toISOString(),
    buildLabel: "sprint-11",
  });
  bus.emit("app:render:done", { apiUrl });
  return wrapped;
}
