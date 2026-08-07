export type KeyboardLike = { ctrlKey?: boolean; metaKey?: boolean; key?: string };

export function isCommandKey(event: KeyboardLike, key: string): boolean {
  const eventKey = (event.key ?? "").toLowerCase();
  return Boolean(event.ctrlKey || event.metaKey) && eventKey === key.toLowerCase();
}

export function isEscapeKey(event: KeyboardLike): boolean {
  return (event.key ?? "").toLowerCase() === "escape";
}

export function isEnterKey(event: KeyboardLike): boolean {
  return (event.key ?? "").toLowerCase() === "enter";
}

export function isSpaceKey(event: KeyboardLike): boolean {
  const value = event.key ?? "";
  return value === " " || value.toLowerCase() === "space";
}
