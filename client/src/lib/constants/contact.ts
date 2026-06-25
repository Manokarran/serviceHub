export const DEFAULT_CONTACT_AUTO_REPLY_SUBJECT = 'We received your message'

export const DEFAULT_CONTACT_AUTO_REPLY_MESSAGE = `Hi {{firstName}},

Thank you for contacting {{tenantName}}. We have received your message and will get back to you as soon as possible.

Best regards,
{{tenantName}}`

export function renderContactAutoReplyTemplate(
  template: string,
  values: { firstName: string; tenantName: string }
): string {
  return template
    .replaceAll('{{firstName}}', values.firstName)
    .replaceAll('{{tenantName}}', values.tenantName)
}
