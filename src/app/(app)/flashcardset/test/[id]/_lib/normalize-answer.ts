// Depends on the written-answer scoring flow and the shared comparison rules used across question types.
export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase();
}
