export function required(value: string): boolean {
  return value.trim().length > 0;
}

export function minLength(value: string, length: number): boolean {
  return value.trim().length >= length;
}
