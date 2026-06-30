export function optional(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()

  return trimmed && trimmed.length > 0 ? trimmed : fallback
}
