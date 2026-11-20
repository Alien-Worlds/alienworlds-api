/**
 * Delay before retry number `attempt` (1 for the first): `baseMs`, doubling each time, never
 * more than `maxMs`.
 */
export function exponentialDelay(
  attempt: number,
  baseMs: number,
  maxMs: number
): number {
  return Math.min(maxMs, baseMs * Math.pow(2, Math.max(0, attempt - 1)));
}
