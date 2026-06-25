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
      from: `"${serverEnv.emailFromName}" <${serverEnv.emailFromAddress}>`,
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
      from: `"${serverEnv.emailFromName}" <${serverEnv.emailFromAddress}>`,
      to,
      subject: payload.subject,
      text: payload.message
    })

    return true
  }
}

export const emailService = new EmailService()
