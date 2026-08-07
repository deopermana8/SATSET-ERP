export type ToastKind = "success" | "error";

export function pushToast(message: string, kind: ToastKind = "success"): void {
  const doc = (globalThis as { document?: { getElementById: (id: string) => { appendChild: (node: unknown) => void } | null; createElement: (tag: string) => { className: string; textContent: string } } }).document;
  if (!doc) {
    return;
  }
  const root = doc.getElementById("toasts");
  if (!root) {
    return;
  }
  const el = doc.createElement("div");
  el.className = `toast ${kind === "error" ? "er" : "ok"}`;
  el.textContent = `${kind === "error" ? "✕" : "✓"} ${message}`;
  root.appendChild(el);
  setTimeout(() => {
    const asNode = el as unknown as { parentNode?: { removeChild: (child: unknown) => void } };
    if (asNode.parentNode) {
      asNode.parentNode.removeChild(el);
    }
  }, 3500);
}
