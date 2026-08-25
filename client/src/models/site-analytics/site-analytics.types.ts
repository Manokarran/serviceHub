import type { Document, Types } from 'mongoose'

export const SITE_ANALYTICS_EVENT_TYPES = ['view', 'click'] as const

export type SiteAnalyticsEventType = (typeof SITE_ANALYTICS_EVENT_TYPES)[number]

export interface ISiteAnalyticsEvent {
  tenantId: Types.ObjectId
  visitorId: string
  type: SiteAnalyticsEventType
  pageSlug: string
  createdAt: Date
}

export interface ISiteAnalyticsEventDocument extends ISiteAnalyticsEvent, Document {}

export type SiteAnalyticsDayPoint = {
  date: string
  label: string
  views: number
  uniqueVisitors: number
  clicks: number
  leads: number
}

export type SiteAnalyticsTotals = {
  views: number
  uniqueVisitors: number
  clicks: number
  leads: number
}

export type SiteAnalyticsOverview = {
  rangeDays: number
  kpiDays: number
  current: SiteAnalyticsTotals
  previous: SiteAnalyticsTotals
  series: SiteAnalyticsDayPoint[]
}
