import mongoose from 'mongoose'

import { connectDB } from '@/lib/db'
import {
  ContactSubmissionModel,
  type ContactLeadFilter,
  type ContactSubmissionStatus,
  type ContactSubmissionSummary,
  type IContactSubmissionDocument
} from '@/models/contact-submission'

function toSummary(doc: IContactSubmissionDocument): ContactSubmissionSummary {
  return {
    id: doc._id.toString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    description: doc.description,
    wantsSignup: doc.wantsSignup,
    emailSent: doc.emailSent,
    autoReplySent: doc.autoReplySent ?? false,
    status: doc.status ?? 'new',
    createdAt: doc.createdAt.toISOString()
  }
}

export class ContactSubmissionRepository {
  async create(
    data: Pick<
      IContactSubmissionDocument,
      | 'tenantId'
      | 'blockId'
      | 'firstName'
      | 'lastName'
      | 'email'
      | 'phone'
      | 'description'
      | 'wantsSignup'
      | 'notificationEmail'
      | 'emailSent'
      | 'autoReplySent'
      | 'status'
    >
  ): Promise<IContactSubmissionDocument> {
    await connectDB()

    return ContactSubmissionModel.create(data)
  }

  async markEmailSent(id: string): Promise<void> {
    await connectDB()

    await ContactSubmissionModel.findByIdAndUpdate(id, { emailSent: true }).exec()
  }

  async markAutoReplySent(id: string): Promise<void> {
    await connectDB()

    await ContactSubmissionModel.findByIdAndUpdate(id, { autoReplySent: true }).exec()
  }

  async updateStatus(
    tenantId: string,
    id: string,
    status: ContactSubmissionStatus
  ): Promise<ContactSubmissionSummary | null> {
    await connectDB()

    const doc = await ContactSubmissionModel.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: { status } },
      { returnDocument: 'after' }
    ).exec()

    return doc ? toSummary(doc) : null
  }

  async listByTenantId(
    tenantId: string,
    options: { limit?: number; filter?: ContactLeadFilter } = {}
  ): Promise<ContactSubmissionSummary[]> {
    await connectDB()

    const { limit = 200, filter = 'all' } = options
    const query: Record<string, unknown> = { tenantId }

    if (filter !== 'all') {
      query.status = filter
    }

    const docs = await ContactSubmissionModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec()

    return docs.map(toSummary)
  }

  async countByDaySince(tenantId: string, since: Date): Promise<{ day: string; count: number }[]> {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return []
    }

    const rows = await ContactSubmissionModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          createdAt: { $gte: since }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ]).exec()

    return rows.map(row => ({ day: row._id, count: row.count }))
  }
}

export const contactSubmissionRepository = new ContactSubmissionRepository()
