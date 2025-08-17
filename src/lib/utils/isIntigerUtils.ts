export function isInt(value?: string): boolean {
  if (!value) return false;
  return /^\d+$/.test(value);
}
