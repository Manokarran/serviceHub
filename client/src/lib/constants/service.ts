export const SERVICE_SLOT_MODES = ['fixed', 'rolling'] as const
export type ServiceSlotMode = (typeof SERVICE_SLOT_MODES)[number]

export const SERVICE_STATUSES = ['draft', 'published', 'archived'] as const
export type ServiceStatus = (typeof SERVICE_STATUSES)[number]

export const SERVICE_BOOKING_MODES = ['instant', 'request'] as const
export type ServiceBookingMode = (typeof SERVICE_BOOKING_MODES)[number]

export const SERVICE_PURCHASE_MODES = ['single_session', 'term'] as const
export type ServicePurchaseMode = (typeof SERVICE_PURCHASE_MODES)[number]

export const SERVICE_LOCATION_TYPES = ['in_person', 'online'] as const
export type ServiceLocationType = (typeof SERVICE_LOCATION_TYPES)[number]

export const SERVICE_PRICE_MODELS = ['free', 'per_session', 'weekly', 'monthly', 'package'] as const
export type ServicePriceModel = (typeof SERVICE_PRICE_MODELS)[number]

export const SERVICE_SLOT_STATUSES = ['scheduled', 'paused', 'cancelled', 'completed'] as const
export type ServiceSlotStatus = (typeof SERVICE_SLOT_STATUSES)[number]

export const DEFAULT_SCHEDULE_HORIZON_DAYS = 60
export const SCHEDULE_HORIZON_OPTIONS = [30, 60, 90, 120, 180, 365] as const

export const SERVICE_SLOT_GRANULARITY_MINUTES = 15

export const DEFAULT_SERVICE_TIMEZONE = 'Asia/Kolkata'
export const DEFAULT_SERVICE_CURRENCY = 'INR'

export const SERVICE_TIMEZONE_OPTIONS = [
  'UTC',
  'Pacific/Auckland',
  'Australia/Sydney',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Africa/Johannesburg',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'America/Toronto',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Pacific/Honolulu'
] as const

export const SERVICE_CURRENCY_OPTIONS = [
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
  { code: 'SGD', label: 'Singapore Dollar (S$)' },
  { code: 'AED', label: 'UAE Dirham (د.إ)' },
  { code: 'NZD', label: 'New Zealand Dollar (NZ$)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'CNY', label: 'Chinese Yuan (¥)' },
  { code: 'CHF', label: 'Swiss Franc (CHF)' },
  { code: 'ZAR', label: 'South African Rand (R)' }
] as const

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const SERVICE_PRICE_MODEL_LABELS: Record<ServicePriceModel, string> = {
  free: 'Free',
  per_session: 'Per session',
  weekly: 'Per week',
  monthly: 'Per month',
  package: 'Package'
}

export const SERVICE_SLOT_MODE_LABELS: Record<ServiceSlotMode, string> = {
  fixed: 'Group sessions',
  rolling: 'One-to-one'
}

export const SERVICE_PURCHASE_MODE_LABELS: Record<ServicePurchaseMode, string> = {
  single_session: 'Book one session',
  term: 'Book the whole term'
}

export const SERVICE_SLOT_STATUS_LABELS: Record<ServiceSlotStatus, string> = {
  scheduled: 'Scheduled',
  paused: 'Paused',
  cancelled: 'Removed',
  completed: 'Completed'
}

/** Minutes from midnight rendered as a 24-hour label, e.g. 570 becomes "09:30". */
export function minutesToLabel(minutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(minutes)))
  const hours = Math.floor(clamped / 60)
  const mins = clamped % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function labelToMinutes(label: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(label.trim())

  if (!match) {
    return null
  }

  const hours = Number(match[1])
  const mins = Number(match[2])

  if (hours > 24 || mins > 59) {
    return null
  }

  return hours * 60 + mins
}

/**
 * Effective gap between one-to-one appointment start times. Defaults to the
 * appointment itself plus its trailing buffer so generated slots never overlap.
 */
export function resolveSlotInterval(
  durationMinutes: number,
  bufferAfterMinutes: number,
  slotIntervalMinutes?: number | null
): number {
  const fallback = durationMinutes + bufferAfterMinutes

  if (!slotIntervalMinutes || slotIntervalMinutes < SERVICE_SLOT_GRANULARITY_MINUTES) {
    return fallback
  }

  return slotIntervalMinutes
}

export function inferCurrencyFromTimeZone(timeZone: string): string {
  if (timeZone.startsWith('Asia/Kolkata') || timeZone.startsWith('Asia/Calcutta')) return 'INR'
  if (timeZone.startsWith('Asia/Dubai')) return 'AED'
  if (timeZone.startsWith('Asia/Singapore')) return 'SGD'
  if (timeZone.startsWith('Asia/Tokyo')) return 'JPY'
  if (timeZone.startsWith('Asia/Shanghai')) return 'CNY'
  if (timeZone.startsWith('Australia/')) return 'AUD'
  if (timeZone.startsWith('Pacific/Auckland')) return 'NZD'
  if (timeZone.startsWith('Europe/London')) return 'GBP'
  if (timeZone.startsWith('Europe/')) return 'EUR'
  if (timeZone.startsWith('America/Toronto')) return 'CAD'
  if (timeZone.startsWith('America/')) return 'USD'
  if (timeZone.startsWith('Africa/Johannesburg')) return 'ZAR'

  return DEFAULT_SERVICE_CURRENCY
}
