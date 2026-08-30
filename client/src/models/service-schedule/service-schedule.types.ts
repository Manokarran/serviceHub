import type { Document, Types } from 'mongoose'

export interface IServiceSchedule {
  tenantId: Types.ObjectId
  serviceId: Types.ObjectId

  /** Optional owner-facing name, e.g. "Weekday mornings". */
  label?: string

  /** 0 = Sunday through 6 = Saturday. */
  byWeekday: number[]

  /**
   * Minutes from local midnight. For group services this is the session start
   * and `endMinutes` is derived from the duration; for one-to-one services the
   * pair describes an availability window that gets stepped through.
   */
  startMinutes: number
  endMinutes: number

  capacity: number
  staffUserId?: Types.ObjectId | null

  validFrom?: Date | null
  validTo?: Date | null

  /** ISO dates (YYYY-MM-DD) skipped when expanding this rule. */
  exceptionDates: string[]

  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IServiceScheduleDocument extends IServiceSchedule, Document {
  _id: Types.ObjectId
}

export type ServiceScheduleSummary = {
  id: string
  serviceId: string
  label: string
  byWeekday: number[]
  startMinutes: number
  endMinutes: number
  capacity: number
  staffUserId: string | null
  validFrom: string | null
  validTo: string | null
  exceptionDates: string[]
  isActive: boolean
}
