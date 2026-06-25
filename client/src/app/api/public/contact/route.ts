import { NextResponse } from 'next/server'

import { AppError } from '@/lib/errors'
import { contactFormSubmitSchema } from '@/lib/validators/contact.validator'
import { contactService } from '@/services/contact/contact.service'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = contactFormSubmitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid form data' },
        { status: 400 }
      )
    }

    const result = await contactService.submitPublicContactForm(parsed.data)

    return NextResponse.json({
      success: true,
      submissionId: result.submissionId,
      emailSent: result.emailSent
    })
  } catch (error) {
    if (error instanceof AppError) {
      if (error.code === 'SPAM_DETECTED') {
        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    console.error('[api/public/contact]', error)

    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 })
  }
}
