export const SITE_ANALYTICS_CHART_DAYS = 14
export const SITE_ANALYTICS_KPI_DAYS = 7

export function utcDayStart(daysAgo = 0): Date {
  const date = new Date()

  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - daysAgo)

  return date
}

export function toUtcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function listUtcDayKeys(start: Date, days: number): string[] {
  const keys: string[] = []

  for (let index = 0; index < days; index += 1) {
    const day = new Date(start)

    day.setUTCDate(start.getUTCDate() + index)
    keys.push(toUtcDayKey(day))
  }

  return keys
}

export function formatUtcDayLabel(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00.000Z`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  })
}
