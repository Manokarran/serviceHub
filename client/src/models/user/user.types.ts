import type { Document, Types } from 'mongoose'

import type { UserRole } from '@/models/shared/enums'

export interface IUser {
  googleId: string
  email: string
  name: string
  image?: string
  tenantId?: Types.ObjectId
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface IUserDocument extends IUser, Document {}
