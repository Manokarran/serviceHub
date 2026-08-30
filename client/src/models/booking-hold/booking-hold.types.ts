import type { Document, Types } from 'mongoose'

export type BookingHoldStatus = 'active' | 'consumed' | 'released'

export interface IBookingHold {
  tenantId: Types.ObjectId
  serviceId: Types.ObjectId
  slotId: Types.ObjectId
  holdToken: string
  quantity: number
  status: BookingHoldStatus
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface IBookingHoldDocument extends IBookingHold, Document {
  _id: Types.ObjectId
}
