import { SERVICE_PRICE_MODEL_LABELS, type ServicePriceModel } from '@/lib/constants/service'

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return mins === 0 ? `${hours} hr` : `${hours} hr ${mins} min`
}

export function formatMoney(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2
    }).format(amountMinor / 100)
  } catch {
    return `${currency} ${(amountMinor / 100).toFixed(2)}`
  }
}

export function formatPrice(priceModel: ServicePriceModel, amountMinor: number, currency: string): string {
  if (priceModel === 'free') {
    return 'Free'
  }

  const suffix: Record<Exclude<ServicePriceModel, 'free'>, string> = {
    per_session: 'per session',
    weekly: 'per week',
    monthly: 'per month',
    package: 'package'
  }

  return `${formatMoney(amountMinor, currency)} ${suffix[priceModel]}`
}

export function priceModelLabel(priceModel: ServicePriceModel): string {
  return SERVICE_PRICE_MODEL_LABELS[priceModel]
}

export function formatDateTime(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone
  }).format(new Date(iso))
}

export function formatDayHeading(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone
  }).format(new Date(iso))
}

export function formatClock(iso: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone
  }).format(new Date(iso))
}

export function formatRelativeDays(iso: string | null): string {
  if (!iso) {
    return 'No sessions yet'
  }

  const target = new Date(iso).getTime()
  const days = Math.round((target - Date.now()) / 86_400_000)

  if (days <= 0) {
    return 'Today'
  }

  if (days === 1) {
    return 'Tomorrow'
  }

  return `In ${days} days`
}
