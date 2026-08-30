import type { Document, Types } from 'mongoose'

import type {
  ServiceBookingMode,
  ServiceLocationType,
  ServicePriceModel,
  ServicePurchaseMode,
  ServiceSlotMode,
  ServiceStatus
} from '@/lib/constants/service'

export interface IService {
  tenantId: Types.ObjectId
  slug: string
  name: string
  tagline?: string
  description?: string
  coverImageUrl?: string
  category?: string
  tags: string[]

  slotMode: ServiceSlotMode
  durationMinutes: number
  slotIntervalMinutes?: number
  bufferAfterMinutes: number
  defaultCapacity: number
  maxSeatsPerBooking: number

  bookingMode: ServiceBookingMode
  purchaseMode: ServicePurchaseMode
  minNoticeHours: number
  maxDaysAhead: number
  scheduleHorizonDays: number
  scheduleStartDate?: string | null
  scheduleEndDate?: string | null
  cancellationWindowHours: number
  waitlistEnabled: boolean
  excludePublicHolidays: boolean

  locationType: ServiceLocationType
  locationLabel?: string
  timezone: string

  priceModel: ServicePriceModel
  priceAmountMinor: number
  currency: string

  status: ServiceStatus
  sortOrder: number

  /** Set once the first booking lands. Freezes `slotMode` from then on. */
  hasBookings: boolean
  nextAvailableAt?: Date | null

  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IServiceDocument extends IService, Document {
  _id: Types.ObjectId
}

export type ServiceSummary = {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  coverImageUrl: string
  category: string
  tags: string[]

  slotMode: ServiceSlotMode
  durationMinutes: number
  slotIntervalMinutes: number | null
  bufferAfterMinutes: number
  defaultCapacity: number
  maxSeatsPerBooking: number

  bookingMode: ServiceBookingMode
  purchaseMode: ServicePurchaseMode
  minNoticeHours: number
  maxDaysAhead: number
  scheduleHorizonDays: number
  scheduleStartDate: string | null
  scheduleEndDate: string | null
  cancellationWindowHours: number
  waitlistEnabled: boolean
  excludePublicHolidays: boolean

  locationType: ServiceLocationType
  locationLabel: string
  timezone: string

  priceModel: ServicePriceModel
  priceAmountMinor: number
  currency: string

  status: ServiceStatus
  sortOrder: number
  hasBookings: boolean
  nextAvailableAt: string | null
  createdAt: string
  updatedAt: string
}
