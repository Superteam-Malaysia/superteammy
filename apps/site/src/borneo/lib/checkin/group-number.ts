export function parseGroupNumber(name: string | null | undefined): number | null {
  if (!name) return null;
  const n = Number.parseInt(name.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
