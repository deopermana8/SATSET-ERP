export type AttrValue = string | number | boolean | null | undefined;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function attrs(input?: Record<string, AttrValue>): string {
  if (!input) {
    return "";
  }
  return Object.entries(input)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }
      return `${key}=\"${escapeHtml(String(value))}\"`;
    })
    .join(" ");
}

export function el(tag: string, input: Record<string, AttrValue> | undefined, children = ""): string {
  const attributes = attrs(input);
  if (!children) {
    return attributes ? `<${tag} ${attributes}></${tag}>` : `<${tag}></${tag}>`;
  }
  return attributes ? `<${tag} ${attributes}>${children}</${tag}>` : `<${tag}>${children}</${tag}>`;
}
