import mongoose, { Schema, type Model } from 'mongoose'

import { USER_ROLES } from '@/models/shared/enums'

import type { IUserDocument } from './user.types'

const userSchema = new Schema<IUserDocument>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    image: {
      type: String,
      trim: true
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      index: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'member',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    collection: 'users'
  }
)

userSchema.index({ tenantId: 1, email: 1 })

export const UserModel: Model<IUserDocument> =
  mongoose.models.User ?? mongoose.model<IUserDocument>('User', userSchema)
