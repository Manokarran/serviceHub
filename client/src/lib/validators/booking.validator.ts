import { z } from 'zod'

import { BOOKING_STATUSES } from '@/models/booking'

export const createBookingSchema = z.object({
  tenantSlug: z.string().trim().min(1).max(80),
  serviceSlug: z.string().trim().min(1).max(80),
  slotId: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(1000),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(40),
  idempotencyKey: z.string().trim().min(16).max(128),
  holdToken: z.string().trim().min(16).max(128).optional()
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>

export const createTermBookingSchema = z.object({
  tenantSlug: z.string().trim().min(1).max(80),
  serviceSlug: z.string().trim().min(1).max(80),
  batchId: z.string().trim().min(1).max(4096),
  quantity: z.number().int().min(1).max(1000),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(40),
  idempotencyKey: z.string().trim().min(16).max(128)
})

export type CreateTermBookingInput = z.infer<typeof createTermBookingSchema>

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(BOOKING_STATUSES),
  reason: z.string().trim().max(500).optional()
})

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>

export const bookingIdSchema = z.object({
  bookingId: z.string().trim().min(1)
})

export const createBookingHoldSchema = z.object({
  tenantSlug: z.string().trim().min(1).max(80),
  serviceSlug: z.string().trim().min(1).max(80),
  slotId: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(1000)
})
