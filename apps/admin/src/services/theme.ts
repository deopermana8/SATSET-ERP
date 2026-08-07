export type ThemeMode = "light" | "dark";

export function applyTheme(mode: ThemeMode): void {
  const doc = (globalThis as { document?: { documentElement: { classList: { toggle: (value: string, force?: boolean) => void; contains: (value: string) => boolean } } } }).document;
  if (!doc) {
    return;
  }
  const root = doc.documentElement;
  root.classList.toggle("dark", mode === "dark");
  localStorage.setItem("theme", mode);
}

export function toggleTheme(): ThemeMode {
  const doc = (globalThis as { document?: { documentElement: { classList: { contains: (value: string) => boolean } } } }).document;
  if (!doc) {
    return "dark";
  }
  const isDark = !doc.documentElement.classList.contains("dark");
  const mode: ThemeMode = isDark ? "dark" : "light";
  applyTheme(mode);
  return mode;
}
