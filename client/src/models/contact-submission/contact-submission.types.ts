import type { Document, Types } from 'mongoose'

export type ContactSubmissionStatus = 'new' | 'read' | 'archived'

export interface IContactSubmission {
  tenantId: Types.ObjectId
  blockId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  description: string
  wantsSignup: boolean
  notificationEmail: string
  emailSent: boolean
  autoReplySent: boolean
  status: ContactSubmissionStatus
  createdAt: Date
  updatedAt: Date
}

export interface IContactSubmissionDocument extends IContactSubmission, Document {}

export type ContactSubmissionSummary = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  description: string
  wantsSignup: boolean
  emailSent: boolean
  autoReplySent: boolean
  status: ContactSubmissionStatus
  createdAt: string
}

export type ContactLeadFilter = 'all' | ContactSubmissionStatus
