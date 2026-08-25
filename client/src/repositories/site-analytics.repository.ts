import mongoose from 'mongoose'

import { connectDB } from '@/lib/db'
import {
  SiteAnalyticsEventModel,
  type ISiteAnalyticsEventDocument
} from '@/models/site-analytics'

type DayCountRow = { _id: string; count: number }
type CountRow = { count: number }

export type SiteAnalyticsDayBuckets = {
  viewsByDay: Map<string, number>
  clicksByDay: Map<string, number>
  uniquesByDay: Map<string, number>
  uniqueVisitorCount: number
  previousUniqueVisitorCount: number
}

function toCountMap(rows: DayCountRow[]): Map<string, number> {
  return new Map(rows.map(row => [row._id, row.count]))
}

function toObjectId(tenantId: string): mongoose.Types.ObjectId | null {
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return null
  }

  return new mongoose.Types.ObjectId(tenantId)
}

export class SiteAnalyticsRepository {
  async create(
    data: Pick<ISiteAnalyticsEventDocument, 'tenantId' | 'visitorId' | 'type' | 'pageSlug'>
  ): Promise<void> {
    await connectDB()
    await SiteAnalyticsEventModel.create(data)
  }

  async getDayBuckets(options: {
    tenantId: string
    rangeStart: Date
    currentStart: Date
  }): Promise<SiteAnalyticsDayBuckets | null> {
    await connectDB()

    const tenantObjectId = toObjectId(options.tenantId)

    if (!tenantObjectId) {
      return null
    }

    const [facet] = await SiteAnalyticsEventModel.aggregate<{
      viewsByDay: DayCountRow[]
      clicksByDay: DayCountRow[]
      uniquesByDay: DayCountRow[]
      uniqueCurrent: CountRow[]
      uniquePrevious: CountRow[]
    }>([
      {
        $match: {
          tenantId: tenantObjectId,
          createdAt: { $gte: options.rangeStart }
        }
      },
      {
        $facet: {
          viewsByDay: [
            { $match: { type: 'view' } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            }
          ],
          clicksByDay: [
            { $match: { type: 'click' } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            }
          ],
          uniquesByDay: [
            { $match: { type: 'view' } },
            {
              $group: {
                _id: {
                  day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                  visitorId: '$visitorId'
                }
              }
            },
            {
              $group: {
                _id: '$_id.day',
                count: { $sum: 1 }
              }
            }
          ],
          uniqueCurrent: [
            { $match: { type: 'view', createdAt: { $gte: options.currentStart } } },
            { $group: { _id: '$visitorId' } },
            { $count: 'count' }
          ],
          uniquePrevious: [
            {
              $match: {
                type: 'view',
                createdAt: { $gte: options.rangeStart, $lt: options.currentStart }
              }
            },
            { $group: { _id: '$visitorId' } },
            { $count: 'count' }
          ]
        }
      }
    ]).exec()

    return {
      viewsByDay: toCountMap(facet?.viewsByDay ?? []),
      clicksByDay: toCountMap(facet?.clicksByDay ?? []),
      uniquesByDay: toCountMap(facet?.uniquesByDay ?? []),
      uniqueVisitorCount: facet?.uniqueCurrent?.[0]?.count ?? 0,
      previousUniqueVisitorCount: facet?.uniquePrevious?.[0]?.count ?? 0
    }
  }
}

export const siteAnalyticsRepository = new SiteAnalyticsRepository()
