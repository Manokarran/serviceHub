/**
 * IANA timezone helpers built on Intl, so schedules can be authored in a
 * tenant's local wall clock while every stored instant stays UTC.
 */

export type CalendarDate = {
  year: number
  month: number
  day: number
}

const NUMERIC_PARTS = new Set(['year', 'month', 'day', 'hour', 'minute', 'second'])

function getZonedParts(date: Date, timeZone: string): Record<string, number> {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })

  const parts: Record<string, number> = {}

  for (const part of formatter.formatToParts(date)) {
    if (NUMERIC_PARTS.has(part.type)) {
      parts[part.type] = Number(part.value)
    }
  }

  return parts
}

function getZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone)

  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)

  return asUtc - date.getTime()
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone })

    return true
  } catch {
    return false
  }
}

export function getBrowserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/**
 * Convert a wall-clock time in `timeZone` to the matching UTC instant.
 *
 * Resolved in two passes because the offset itself depends on the instant:
 * the first pass gives an approximate instant, the second corrects it across
 * daylight-saving boundaries.
 */
export function zonedWallClockToUtc(date: CalendarDate, minutesFromMidnight: number, timeZone: string): Date {
  const naive = Date.UTC(date.year, date.month - 1, date.day) + minutesFromMidnight * 60_000

  const firstPass = naive - getZoneOffsetMs(new Date(naive), timeZone)
  const secondPass = naive - getZoneOffsetMs(new Date(firstPass), timeZone)

  return new Date(secondPass)
}

export function getCalendarDateInZone(date: Date, timeZone: string): CalendarDate {
  const parts = getZonedParts(date, timeZone)

  return { year: parts.year, month: parts.month, day: parts.day }
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days))

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate()
  }
}

/** Day of week for a calendar date, 0 = Sunday through 6 = Saturday. */
export function weekdayOf(date: CalendarDate): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay()
}

export function toIsoDate(date: CalendarDate): string {
  const month = String(date.month).padStart(2, '0')
  const day = String(date.day).padStart(2, '0')

  return `${date.year}-${month}-${day}`
}
