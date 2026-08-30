import nodemailer from 'nodemailer'

import { serverEnv } from '@/config/env'

export type ContactNotificationPayload = {
  tenantName: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  description: string
  wantsSignup: boolean
}

export type BookingEmailPayload = {
  tenantName: string
  customerName: string
  customerEmail: string
  serviceName: string
  confirmationCode: string
  startAt: string
  endAt: string
  timezone: string
  quantity: number
  priceAmountMinor: number
  currency: string
  locationType?: 'in_person' | 'online'
  locationLabel?: string
  mapUrl?: string
  onlineUrl?: string
}

function sender(displayName?: string): { name: string; address: string } {
  return {
    name: displayName?.trim() || serverEnv.emailFromName,
    address: serverEnv.emailFromAddress
  }
}

function isEmailConfigured(): boolean {
  return Boolean(serverEnv.smtpHost && serverEnv.emailFromAddress)
}

export class EmailService {
  private getTransporter() {
    if (!isEmailConfigured()) {
      return null
    }

    return nodemailer.createTransport({
      host: serverEnv.smtpHost,
      port: serverEnv.smtpPort,
      secure: serverEnv.smtpSecure,
      auth: serverEnv.smtpUser
        ? {
            user: serverEnv.smtpUser,
            pass: serverEnv.smtpPass
          }
        : undefined
    })
  }

  async sendContactNotification(to: string, payload: ContactNotificationPayload): Promise<boolean> {
    const transporter = this.getTransporter()

    if (!transporter) {
      console.warn('[EmailService] SMTP not configured — skipping contact notification email')

      return false
    }

    const subject = payload.wantsSignup
      ? `New contact + signup interest — ${payload.firstName} ${payload.lastName}`
      : `New contact form submission — ${payload.firstName} ${payload.lastName}`

    const text = [
      `You received a new message via ${payload.tenantName}'s website contact form.`,
      '',
      `Name: ${payload.firstName} ${payload.lastName}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
      `Interested in signing up: ${payload.wantsSignup ? 'Yes' : 'No'}`,
      '',
      'Message:',
      payload.description
    ]
      .filter(Boolean)
      .join('\n')

    await transporter.sendMail({
      from: sender(payload.tenantName),
      to,
      replyTo: payload.email,
      subject,
      text
    })

    return true
  }

  async sendContactAutoReply(
    to: string,
    payload: { subject: string; message: string; tenantName: string }
  ): Promise<boolean> {
    const transporter = this.getTransporter()

    if (!transporter) {
      console.warn('[EmailService] SMTP not configured — skipping contact auto-reply email')

      return false
    }

    await transporter.sendMail({
      from: sender(payload.tenantName),
      to,
      subject: payload.subject,
      text: payload.message
    })

    return true
  }

  async sendBookingCreatedNotification(
    to: string,
    payload: BookingEmailPayload,
    status: 'pending' | 'confirmed'
  ): Promise<boolean> {
    const statusText =
      status === 'pending' ? 'A new booking request has been received.' : 'A new booking has been received.'

    return this.sendBookingEmail(
      to,
      `${statusText} — ${payload.serviceName}`,
      [
        `A booking was created on ${payload.tenantName}'s website.`,
        '',
        `Customer: ${payload.customerName}`,
        `Email: ${payload.customerEmail}`,
        `Service: ${payload.serviceName}`,
        `When: ${this.formatBookingTime(payload)}`,
        `Quantity: ${payload.quantity}`,
        `Reference: ${payload.confirmationCode}`
      ].join('\n'),
      payload
    )
  }

  async sendBookingConfirmation(to: string, payload: BookingEmailPayload): Promise<boolean> {
    return this.sendBookingEmail(
      to,
      `Booking confirmed — ${payload.serviceName}`,
      [
        `Hi ${payload.customerName},`,
        '',
        `Your booking with ${payload.tenantName} is confirmed.`,
        '',
        `Service: ${payload.serviceName}`,
        `When: ${this.formatBookingTime(payload)}`,
        ...this.formatBookingLocation(payload),
        `Quantity: ${payload.quantity}`,
        `Reference: ${payload.confirmationCode}`,
        '',
        'Please keep this reference for your records.'
      ].join('\n'),
      payload
    )
  }

  async sendBookingRequestReceived(to: string, payload: BookingEmailPayload): Promise<boolean> {
    return this.sendBookingEmail(
      to,
      `Booking request received — ${payload.serviceName}`,
      [
        `Hi ${payload.customerName},`,
        '',
        `We received your booking request with ${payload.tenantName}.`,
        'The business will review it and email you when it is confirmed.',
        '',
        `Service: ${payload.serviceName}`,
        `When: ${this.formatBookingTime(payload)}`,
        `Quantity: ${payload.quantity}`,
        `Reference: ${payload.confirmationCode}`
      ].join('\n'),
      payload
    )
  }

  async sendTermBookingNotification(
    to: string,
    payload: BookingEmailPayload,
    occurrenceCount: number,
    status: 'pending' | 'confirmed'
  ): Promise<boolean> {
    const statusLine =
      status === 'pending'
        ? 'Your term enrolment request has been received and is waiting for approval.'
        : 'Your place in every class in the term is confirmed.'

    return this.sendBookingEmail(
      to,
      `${status === 'pending' ? 'Term enrolment request received' : 'Term enrolment confirmed'} — ${payload.serviceName}`,
      [
        `Hi ${payload.customerName},`,
        '',
        statusLine,
        '',
        `Service: ${payload.serviceName}`,
        `Classes: ${occurrenceCount}`,
        `First class: ${this.formatBookingTime(payload)}`,
        ...(status === 'confirmed' ? this.formatBookingLocation(payload) : []),
        `Seats: ${payload.quantity}`,
        `Reference: ${payload.confirmationCode}`
      ].join('\n'),
      payload
    )
  }

  async sendBookingCancellation(to: string, payload: BookingEmailPayload, reason?: string): Promise<boolean> {
    return this.sendBookingEmail(
      to,
      `Booking cancelled — ${payload.serviceName}`,
      [
        `Hi ${payload.customerName},`,
        '',
        `Your booking with ${payload.tenantName} has been cancelled.`,
        reason?.trim() ? `Reason: ${reason.trim()}` : null,
        '',
        `Service: ${payload.serviceName}`,
        `When: ${this.formatBookingTime(payload)}`,
        `Reference: ${payload.confirmationCode}`
      ]
        .filter(Boolean)
        .join('\n'),
      payload
    )
  }

  async sendServiceRemovedNotification(to: string, payload: BookingEmailPayload): Promise<boolean> {
    return this.sendBookingEmail(
      to,
      `Service removed — ${payload.serviceName}`,
      [
        `Hi ${payload.customerName},`,
        '',
        `Unfortunately, ${payload.tenantName} has removed the service you booked.`,
        'Your booking is no longer available and has been marked as removed.',
        '',
        `Service: ${payload.serviceName}`,
        `Scheduled for: ${this.formatBookingTime(payload)}`,
        `Reference: ${payload.confirmationCode}`,
        '',
        'Please contact the business if you need more information.'
      ].join('\n'),
      payload
    )
  }

  private async sendBookingEmail(
    to: string,
    subject: string,
    text: string,
    payload?: Pick<BookingEmailPayload, 'tenantName'>
  ): Promise<boolean> {
    const transporter = this.getTransporter()

    if (!transporter) {
      console.warn('[EmailService] SMTP not configured — skipping booking email')

      return false
    }

    await transporter.sendMail({
      from: sender(payload?.tenantName),
      to,
      subject,
      text
    })

    return true
  }

  private formatBookingLocation(payload: BookingEmailPayload): string[] {
    if (payload.locationType === 'online') {
      if (payload.onlineUrl) {
        return [`Online session: ${payload.onlineUrl}`]
      }

      return payload.locationLabel ? [`Online access: ${payload.locationLabel}`] : []
    }

    const lines = payload.locationLabel ? [`Location: ${payload.locationLabel}`] : []

    if (payload.mapUrl) {
      lines.push(`Map: ${payload.mapUrl}`)
    }

    return lines
  }

  private formatBookingTime(payload: BookingEmailPayload): string {
    const start = new Date(payload.startAt).toLocaleString('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: payload.timezone
    })

    const end = new Date(payload.endAt).toLocaleTimeString('en', {
      timeStyle: 'short',
      timeZone: payload.timezone
    })

    return `${start}–${end} (${payload.timezone})`
  }
}

export const emailService = new EmailService()
