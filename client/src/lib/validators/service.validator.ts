import { z } from 'zod'

import {
  SERVICE_BOOKING_MODES,
  SERVICE_LOCATION_TYPES,
  SERVICE_PRICE_MODELS,
  SERVICE_PURCHASE_MODES,
  SERVICE_SLOT_GRANULARITY_MINUTES,
  SERVICE_SLOT_MODES,
  SERVICE_STATUSES,
  SERVICE_CURRENCY_OPTIONS,
  SERVICE_SLOT_STATUSES,
  SCHEDULE_HORIZON_OPTIONS
} from '@/lib/constants/service'
import { isValidTimeZone } from '@/lib/utils/timezone'

const MINUTES_IN_DAY = 24 * 60
const calendarDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid calendar date')

const timezoneSchema = z
  .string()
  .trim()
  .min(1, 'Timezone is required')
  .max(64)
  .refine(isValidTimeZone, 'Enter a valid IANA timezone, for example Asia/Kolkata')

/** Minute values are always kept on the editor's 15 minute grid. */
const granularMinutes = (label: string, min: number, max: number) =>
  z
    .number()
    .int()
    .min(min)
    .max(max)
    .refine(
      value => value % SERVICE_SLOT_GRANULARITY_MINUTES === 0,
      `${label} must be in ${SERVICE_SLOT_GRANULARITY_MINUTES} minute steps`
    )

export const createServiceSchema = z.object({
  name: z.string().trim().min(2, 'Give the service a name').max(120),
  slotMode: z.enum(SERVICE_SLOT_MODES),
  durationMinutes: granularMinutes('Duration', 15, MINUTES_IN_DAY),
  defaultCapacity: z.number().int().min(1).max(1000),
  purchaseMode: z.enum(SERVICE_PURCHASE_MODES).default('single_session'),
  timezone: timezoneSchema,
  scheduleHorizonDays: z
    .number()
    .int()
    .refine(
      value => SCHEDULE_HORIZON_OPTIONS.includes(value as (typeof SCHEDULE_HORIZON_OPTIONS)[number]),
      'Choose a valid session generation length'
    )
    .default(60),
  scheduleStartDate: calendarDateSchema.nullable().default(null),
  scheduleEndDate: calendarDateSchema.nullable().default(null),
  excludePublicHolidays: z.boolean().default(false),
  currency: z.enum(SERVICE_CURRENCY_OPTIONS.map(option => option.code) as [string, ...string[]]).default('INR')
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>

export const updateServiceSchema = z
  .object({
    serviceId: z.string().min(1),

    name: z.string().trim().min(2, 'Give the service a name').max(120),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2)
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
    tagline: z.string().trim().max(180).default(''),
    description: z.string().trim().max(5000).default(''),
    coverImageUrl: z.string().trim().max(2048).default(''),
    category: z.string().trim().max(60).default(''),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),

    slotMode: z.enum(SERVICE_SLOT_MODES),
    durationMinutes: granularMinutes('Duration', 15, MINUTES_IN_DAY),
    slotIntervalMinutes: granularMinutes('Interval', 15, MINUTES_IN_DAY).nullable().default(null),
    bufferAfterMinutes: z.number().int().min(0).max(240).default(0),
    defaultCapacity: z.number().int().min(1).max(1000),
    maxSeatsPerBooking: z.number().int().min(1).max(50).default(1),

    bookingMode: z.enum(SERVICE_BOOKING_MODES),
    purchaseMode: z.enum(SERVICE_PURCHASE_MODES).default('single_session'),
    minNoticeHours: z.number().int().min(0).max(720).default(2),
    maxDaysAhead: z.number().int().min(1).max(365).default(60),
    scheduleHorizonDays: z
      .number()
      .int()
      .refine(
        value => SCHEDULE_HORIZON_OPTIONS.includes(value as (typeof SCHEDULE_HORIZON_OPTIONS)[number]),
        'Choose a valid session generation length'
      ),
    scheduleStartDate: calendarDateSchema.nullable().default(null),
    scheduleEndDate: calendarDateSchema.nullable().default(null),
    cancellationWindowHours: z.number().int().min(0).max(720).default(12),
    waitlistEnabled: z.boolean().default(false),
    excludePublicHolidays: z.boolean().default(false),

    locationType: z.enum(SERVICE_LOCATION_TYPES),
    locationLabel: z.string().trim().max(240).default(''),
    timezone: timezoneSchema,

    priceModel: z.enum(SERVICE_PRICE_MODELS),
    priceAmountMinor: z.number().int().min(0).max(100_000_000).default(0),
    currency: z.enum(SERVICE_CURRENCY_OPTIONS.map(option => option.code) as [string, ...string[]]).default('INR')
  })
  .superRefine((value, ctx) => {
    if (value.slotMode === 'rolling' && value.maxSeatsPerBooking > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxSeatsPerBooking'],
        message: 'A one-to-one appointment can only hold one seat'
      })
    }

    if (value.slotMode === 'rolling' && value.defaultCapacity > 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['defaultCapacity'],
        message: 'A one-to-one appointment can only hold one seat'
      })
    }

    if (value.purchaseMode === 'term' && value.slotMode !== 'fixed') {
      ctx.addIssue({
        code: 'custom',
        path: ['purchaseMode'],
        message: 'Term enrolments are available for group sessions only'
      })
    }

    if (value.purchaseMode === 'term' && (!value.scheduleStartDate || !value.scheduleEndDate)) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduleStartDate'],
        message: 'Add both term start and end dates'
      })
    }

    if (value.maxSeatsPerBooking > value.defaultCapacity) {
      ctx.addIssue({
        code: 'custom',
        path: ['maxSeatsPerBooking'],
        message: 'Seats per booking cannot exceed the session capacity'
      })
    }

    if (value.scheduleStartDate && value.scheduleEndDate && value.scheduleEndDate < value.scheduleStartDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['scheduleEndDate'],
        message: 'Season end date must be on or after the start date'
      })
    }

    if (value.purchaseMode === 'term' && value.scheduleStartDate && value.scheduleEndDate) {
      const termDays =
        Math.round(
          (Date.parse(`${value.scheduleEndDate}T00:00:00Z`) - Date.parse(`${value.scheduleStartDate}T00:00:00Z`)) /
            (24 * 60 * 60 * 1000)
        ) + 1

      if (termDays > value.scheduleHorizonDays) {
        ctx.addIssue({
          code: 'custom',
          path: ['scheduleHorizonDays'],
          message: 'Set the session generation length to cover the entire term'
        })
      }
    }

    if (value.purchaseMode === 'term' && value.priceModel !== 'free' && value.priceModel !== 'package') {
      ctx.addIssue({
        code: 'custom',
        path: ['priceModel'],
        message: 'Use a package price for a whole-term enrolment'
      })
    }

    if (value.priceModel !== 'free' && value.priceAmountMinor <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['priceAmountMinor'],
        message: 'Set a price, or switch the pricing model to Free'
      })
    }
  })

export type UpdateServiceInput = z.infer<typeof updateServiceSchema>

export const scheduleBlockSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().trim().max(120).default(''),
    byWeekday: z.array(z.number().int().min(0).max(6)).min(1, 'Pick at least one day'),
    startMinutes: granularMinutes('Start time', 0, MINUTES_IN_DAY - 1),
    endMinutes: granularMinutes('End time', 15, MINUTES_IN_DAY),
    capacity: z.number().int().min(1).max(1000),
    staffUserId: z.string().min(1).nullable().default(null),
    exceptionDates: z
      .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Exception dates must be YYYY-MM-DD'))
      .max(200)
      .default([]),
    isActive: z.boolean().default(true)
  })
  .superRefine((value, ctx) => {
    if (value.endMinutes <= value.startMinutes) {
      ctx.addIssue({
        code: 'custom',
        path: ['endMinutes'],
        message: 'End time must be after the start time'
      })
    }
  })

export type ScheduleBlockInput = z.infer<typeof scheduleBlockSchema>

export const saveSchedulesSchema = z.object({
  serviceId: z.string().min(1),
  blocks: z.array(scheduleBlockSchema).max(100)
})

export type SaveSchedulesInput = z.infer<typeof saveSchedulesSchema>

export const createOneOffSessionSchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid calendar date'),
  startMinutes: granularMinutes('Start time', 0, MINUTES_IN_DAY - 1),
  capacity: z.number().int().min(1).max(1000)
})

export type CreateOneOffSessionInput = z.infer<typeof createOneOffSessionSchema>

export const setServiceStatusSchema = z.object({
  serviceId: z.string().min(1),
  status: z.enum(SERVICE_STATUSES)
})

export type SetServiceStatusInput = z.infer<typeof setServiceStatusSchema>

export const serviceIdSchema = z.object({
  serviceId: z.string().min(1)
})

export type ServiceIdInput = z.infer<typeof serviceIdSchema>

export const setServiceSlotStatusSchema = z.object({
  slotId: z.string().min(1),
  status: z.enum(SERVICE_SLOT_STATUSES)
})

export type SetServiceSlotStatusInput = z.infer<typeof setServiceSlotStatusSchema>
