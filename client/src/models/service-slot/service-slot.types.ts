import type { Document, Types } from 'mongoose'

import type { ServiceSlotStatus } from '@/lib/constants/service'

export interface IServiceSlot {
  tenantId: Types.ObjectId
  serviceId: Types.ObjectId
  scheduleId: Types.ObjectId

  /** Part of slot identity: two staff free at 10:00 are two separate slots. */
  staffUserId: Types.ObjectId | null

  startAt: Date
  endAt: Date
  timezone: string

  capacity: number
  seatsBooked: number
  seatsHeld: number

  status: ServiceSlotStatus
  priceOverrideMinor?: number | null

  /** Stamped on every materialiser pass so stale rows can be pruned. */
  materialisedAt: Date

  createdAt: Date
  updatedAt: Date
}

export interface IServiceSlotDocument extends IServiceSlot, Document {
  _id: Types.ObjectId
}

export type ServiceSlotSummary = {
  id: string
  serviceId: string
  scheduleId: string
  staffUserId: string | null
  startAt: string
  endAt: string
  timezone: string
  capacity: number
  seatsBooked: number
  seatsHeld: number
  seatsAvailable: number
  status: ServiceSlotStatus
}

export type ServiceSlotStats = {
  total: number
  upcoming: number
  seatsOffered: number
  nextAvailableAt: string | null
}
