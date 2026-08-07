export function formatIsoDate(value: string | number | Date): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toISOString().slice(0, 10);
}

export function formatRelativeMinutes(minutesAgo: number): string {
  if (minutesAgo <= 1) {
    return "baru saja";
  }
  if (minutesAgo < 60) {
    return `${minutesAgo} menit lalu`;
  }
  const hours = Math.floor(minutesAgo / 60);
  return `${hours} jam lalu`;
}
