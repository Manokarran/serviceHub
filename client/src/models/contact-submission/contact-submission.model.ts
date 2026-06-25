import mongoose, { Schema, type Model } from 'mongoose'

import type { IContactSubmissionDocument } from './contact-submission.types'

const contactSubmissionSchema = new Schema<IContactSubmissionDocument>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    blockId: { type: String, trim: true, maxlength: 128 },
    firstName: { type: String, required: true, trim: true, maxlength: 80 },
    lastName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 32 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    wantsSignup: { type: Boolean, default: false, required: true },
    notificationEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    emailSent: { type: Boolean, default: false, required: true },
    autoReplySent: { type: Boolean, default: false, required: true },
    status: {
      type: String,
      enum: ['new', 'read', 'archived'],
      default: 'new',
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'contact_submissions'
  }
)

contactSubmissionSchema.index({ tenantId: 1, createdAt: -1 })

export const ContactSubmissionModel: Model<IContactSubmissionDocument> =
  mongoose.models.ContactSubmission ??
  mongoose.model<IContactSubmissionDocument>('ContactSubmission', contactSubmissionSchema)
