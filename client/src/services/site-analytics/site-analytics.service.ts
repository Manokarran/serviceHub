import { AppError } from '@/lib/errors'
import {
  formatUtcDayLabel,
  listUtcDayKeys,
  SITE_ANALYTICS_CHART_DAYS,
  SITE_ANALYTICS_KPI_DAYS,
  utcDayStart
} from '@/lib/site-analytics/dates'
import type { SiteAnalyticsEventInput } from '@/lib/validators/site-analytics.validator'
import type { SiteAnalyticsOverview, SiteAnalyticsTotals } from '@/models/site-analytics'
import { contactSubmissionRepository, siteAnalyticsRepository, tenantRepository } from '@/repositories'

const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|whatsapp|telegram|preview|lighthouse|headless/i

function emptyTotals(): SiteAnalyticsTotals {
  return { views: 0, uniqueVisitors: 0, clicks: 0, leads: 0 }
}

function emptyOverview(): SiteAnalyticsOverview {
  const rangeStart = utcDayStart(SITE_ANALYTICS_CHART_DAYS - 1)

  const series = listUtcDayKeys(rangeStart, SITE_ANALYTICS_CHART_DAYS).map(date => ({
    date,
    label: formatUtcDayLabel(date),
    views: 0,
    uniqueVisitors: 0,
    clicks: 0,
    leads: 0
  }))

  return {
    rangeDays: SITE_ANALYTICS_CHART_DAYS,
    kpiDays: SITE_ANALYTICS_KPI_DAYS,
    current: emptyTotals(),
    previous: emptyTotals(),
    series
  }
}

function sumMap(keys: string[], map: Map<string, number>): number {
  return keys.reduce((total, key) => total + (map.get(key) ?? 0), 0)
}

export class SiteAnalyticsService {
  async trackPublicEvent(input: SiteAnalyticsEventInput, userAgent?: string | null): Promise<void> {
    if (userAgent && BOT_UA.test(userAgent)) {
      return
    }

    const tenant = await tenantRepository.findBySlug(input.tenantSlug)

    if (!tenant) {
      throw new AppError('Organization not found', 404, 'TENANT_NOT_FOUND')
    }

    await siteAnalyticsRepository.create({
      tenantId: tenant._id,
      visitorId: input.visitorId,
      type: input.type,
      pageSlug: input.pageSlug || 'home'
    })
  }

  async getHomeOverview(tenantId: string | undefined): Promise<SiteAnalyticsOverview> {
    if (!tenantId) {
      return emptyOverview()
    }

    try {
      const rangeStart = utcDayStart(SITE_ANALYTICS_CHART_DAYS - 1)
      const currentStart = utcDayStart(SITE_ANALYTICS_KPI_DAYS - 1)
      const dayKeys = listUtcDayKeys(rangeStart, SITE_ANALYTICS_CHART_DAYS)
      const currentKeys = dayKeys.slice(-SITE_ANALYTICS_KPI_DAYS)
      const previousKeys = dayKeys.slice(0, SITE_ANALYTICS_KPI_DAYS)

      const [buckets, leadRows] = await Promise.all([
        siteAnalyticsRepository.getDayBuckets({
          tenantId,
          rangeStart,
          currentStart
        }),
        contactSubmissionRepository.countByDaySince(tenantId, rangeStart)
      ])

      if (!buckets) {
        return emptyOverview()
      }

      const leadsByDay = new Map(leadRows.map(row => [row.day, row.count]))

      const series = dayKeys.map(date => ({
        date,
        label: formatUtcDayLabel(date),
        views: buckets.viewsByDay.get(date) ?? 0,
        uniqueVisitors: buckets.uniquesByDay.get(date) ?? 0,
        clicks: buckets.clicksByDay.get(date) ?? 0,
        leads: leadsByDay.get(date) ?? 0
      }))

      return {
        rangeDays: SITE_ANALYTICS_CHART_DAYS,
        kpiDays: SITE_ANALYTICS_KPI_DAYS,
        current: {
          views: sumMap(currentKeys, buckets.viewsByDay),
          uniqueVisitors: buckets.uniqueVisitorCount,
          clicks: sumMap(currentKeys, buckets.clicksByDay),
          leads: sumMap(currentKeys, leadsByDay)
        },
        previous: {
          views: sumMap(previousKeys, buckets.viewsByDay),
          uniqueVisitors: buckets.previousUniqueVisitorCount,
          clicks: sumMap(previousKeys, buckets.clicksByDay),
          leads: sumMap(previousKeys, leadsByDay)
        },
        series
      }
    } catch (error) {
      console.error('[SiteAnalyticsService.getHomeOverview]', error)

      return emptyOverview()
    }
  }
}

export const siteAnalyticsService = new SiteAnalyticsService()
