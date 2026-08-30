import type { Document, Types } from 'mongoose'

export interface ISiteCustomer {
  tenantId: Types.ObjectId
  googleId: string
  email: string
  name: string
  phone?: string
  image?: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface ISiteCustomerDocument extends ISiteCustomer, Document {
  _id: Types.ObjectId
}
