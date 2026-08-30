import type { Document, Types } from 'mongoose'

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'attended', 'no_show', 'removed'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export type BookingStatusChange = {
  status: BookingStatus
  changedAt: Date
  changedBy?: Types.ObjectId | null
  reason?: string
}

export interface IBooking {
  tenantId: Types.ObjectId
  serviceId: Types.ObjectId
  slotId: Types.ObjectId
  customerId: Types.ObjectId
  customerEmail: string
  customerName: string
  customerPhone?: string
  quantity: number
  termEnrollmentId?: string | null
  status: BookingStatus
  statusHistory: BookingStatusChange[]
  confirmationCode: string
  idempotencyKey: string
  priceAmountMinor: number
  currency: string
  serviceName: string
  startAt: Date
  endAt: Date
  timezone: string
  createdAt: Date
  updatedAt: Date
}

export interface IBookingDocument extends IBooking, Document {
  _id: Types.ObjectId
}

export type BookingSummary = {
  id: string
  serviceId: string
  slotId: string
  termEnrollmentId: string | null
  quantity: number
  status: BookingStatus
  customerName: string
  customerEmail: string
  customerPhone: string
  confirmationCode: string
  priceAmountMinor: number
  currency: string
  serviceName: string
  startAt: string
  endAt: string
  timezone: string
  createdAt: string
}

export type BookingInsightPoint = {
  date: string
  label: string
  seatsOffered: number
  seatsBooked: number
}

export type BookingServiceInsight = {
  serviceId: string
  serviceName: string
  bookings: number
  seatsBooked: number
  seatsOffered: number
  utilization: number
}

export type BookingInsights = {
  rangeDays: number
  totalBookings: number
  seatsBooked: number
  seatsOffered: number
  utilization: number
  pendingRequests: number
  revenueMinor: number
  series: BookingInsightPoint[]
  services: BookingServiceInsight[]
}
