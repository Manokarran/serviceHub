import Holidays from 'date-holidays'

type HolidayCalendar = {
  country: string
  state?: string
  label: string
}

/**
 * Date-holidays has country/state rules, while a service only stores an IANA
 * timezone. This mapping gives common sites the right national and regional
 * calendar without asking the owner to maintain holiday dates manually.
 */
export function resolveHolidayCalendar(timezone: string): HolidayCalendar | null {
  if (timezone === 'Australia/Sydney') {
    return { country: 'AU', state: 'nsw', label: 'New South Wales' }
  }

  if (timezone === 'Australia/Canberra') {
    return { country: 'AU', state: 'act', label: 'Australian Capital Territory' }
  }

  if (timezone === 'Australia/Melbourne') {
    return { country: 'AU', state: 'vic', label: 'Victoria' }
  }

  if (timezone === 'Australia/Brisbane') {
    return { country: 'AU', state: 'qld', label: 'Queensland' }
  }

  if (timezone === 'Australia/Adelaide') {
    return { country: 'AU', state: 'sa', label: 'South Australia' }
  }

  if (timezone === 'Australia/Perth') {
    return { country: 'AU', state: 'wa', label: 'Western Australia' }
  }

  if (timezone === 'Australia/Hobart') {
    return { country: 'AU', state: 'tas', label: 'Tasmania' }
  }

  if (timezone === 'Australia/Darwin') {
    return { country: 'AU', state: 'nt', label: 'Northern Territory' }
  }

  if (timezone.startsWith('Australia/')) {
    return { country: 'AU', label: 'Australia' }
  }

  if (timezone === 'Asia/Kolkata' || timezone === 'Asia/Calcutta') {
    return { country: 'IN', label: 'India' }
  }

  if (timezone === 'Asia/Dubai') {
    return { country: 'AE', label: 'United Arab Emirates' }
  }

  if (timezone === 'Asia/Singapore') {
    return { country: 'SG', label: 'Singapore' }
  }

  if (timezone === 'Asia/Tokyo') {
    return { country: 'JP', label: 'Japan' }
  }

  if (timezone === 'Asia/Shanghai') {
    return { country: 'CN', label: 'China' }
  }

  if (timezone === 'Europe/London') {
    return { country: 'GB', label: 'United Kingdom' }
  }

  if (timezone === 'Europe/Paris') {
    return { country: 'FR', label: 'France' }
  }

  if (timezone === 'Europe/Berlin') {
    return { country: 'DE', label: 'Germany' }
  }

  if (timezone === 'America/Toronto') {
    return { country: 'CA', state: 'on', label: 'Ontario' }
  }

  if (timezone.startsWith('America/')) {
    return { country: 'US', label: 'United States' }
  }

  if (timezone === 'Pacific/Auckland') {
    return { country: 'NZ', label: 'New Zealand' }
  }

  if (timezone === 'Africa/Johannesburg') {
    return { country: 'ZA', label: 'South Africa' }
  }

  return null
}

export function getPublicHolidayDates(
  timezone: string,
  startYear: number,
  endYear: number
): Set<string> {
  const calendar = resolveHolidayCalendar(timezone)

  if (!calendar) {
    return new Set()
  }

  const holidays = calendar.state
    ? new Holidays(calendar.country, calendar.state, { timezone, types: ['public'] })
    : new Holidays(calendar.country, { timezone, types: ['public'] })

  const dates = new Set<string>()

  for (let year = startYear; year <= endYear; year += 1) {
    for (const holiday of holidays.getHolidays(year)) {
      dates.add(holiday.date.slice(0, 10))
    }
  }

  return dates
}

export function getHolidayCalendarLabel(timezone: string): string | null {
  return resolveHolidayCalendar(timezone)?.label ?? null
}
