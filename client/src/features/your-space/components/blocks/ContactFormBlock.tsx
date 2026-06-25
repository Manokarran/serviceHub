'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { ContactFormBlockProps } from '../../types'
import { usePublicTenantSlug } from '../../hooks/usePublicTenantSlug'
import { useSitePageNavigation } from '../../hooks/useSitePageNavigation'
import { getContactFormFieldSx, getContactFormSubmitButtonConfig } from '../../utils/siteStylesHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  blockId: string
  props: ContactFormBlockProps
}

export function ContactFormBlock({ blockId, props }: Props) {
  const siteStyles = useSiteStyles()
  const tenantSlug = usePublicTenantSlug()
  const { isCanvasEditing } = useSitePageNavigation()
  const fieldSx = getContactFormFieldSx(
    siteStyles,
    props.fieldStyle,
    props.fieldBorderRadius,
    props.fieldBorderWidth
  )
  const submitButton = getContactFormSubmitButtonConfig(
    siteStyles,
    props.submitVariant,
    props.submitColor,
    props.submitBorderRadius
  )

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [wantsSignup, setWantsSignup] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const alignmentSx = {
    textAlign: props.alignment,
    alignItems: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
  } as const

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isCanvasEditing) {
      return
    }

    if (!tenantSlug) {
      setError('This form is not available right now.')

      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantSlug,
          blockId,
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          description,
          wantsSignup,
          website: honeypot
        })
      })

      const data = (await response.json()) as { error?: string; success?: boolean }

      if (!response.ok) {
        setError(data.error ?? 'Failed to send your message. Please try again.')
        setIsSubmitting(false)

        return
      }

      setSuccess(true)
      setFirstName('')
      setLastName('')
      setEmail('')
      setPhone('')
      setDescription('')
      setWantsSignup(false)
    } catch {
      setError('Failed to send your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box sx={{ px: 4, py: 3, display: 'flex', flexDirection: 'column', gap: 2, ...alignmentSx }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', maxWidth: 560 }}>
        <Typography variant='h5' component='h2' sx={{ fontWeight: 700, color: siteStyles.colors.text }}>
          <InlineEditableText value={props.title} field='title' placeholder='Form title' />
        </Typography>
        {props.subtitle ? (
          <Typography variant='body1' sx={{ color: 'text.secondary' }}>
            <InlineEditableText value={props.subtitle} field='subtitle' placeholder='Form subtitle' multiline />
          </Typography>
        ) : null}
      </Box>

      {success ? (
        <Alert severity='success' sx={{ maxWidth: 560, width: '100%' }}>
          {props.successMessage}
        </Alert>
      ) : (
        <Box
          component='form'
          onSubmit={handleSubmit}
          noValidate
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: 560,
            ...fieldSx
          }}
        >
          {error ? <Alert severity='error'>{error}</Alert> : null}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label='First name'
              value={firstName}
              onChange={event => setFirstName(event.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
            />
            <TextField
              label='Last name'
              value={lastName}
              onChange={event => setLastName(event.target.value)}
              required
              fullWidth
              disabled={isSubmitting}
            />
          </Box>

          <TextField
            label='Email'
            type='email'
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label='Phone number'
            type='tel'
            value={phone}
            onChange={event => setPhone(event.target.value)}
            fullWidth
            disabled={isSubmitting}
          />

          <TextField
            label='Quick description'
            value={description}
            onChange={event => setDescription(event.target.value)}
            required
            fullWidth
            multiline
            minRows={4}
            disabled={isSubmitting}
          />

          {props.showSignupOption ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={wantsSignup}
                  onChange={event => setWantsSignup(event.target.checked)}
                  disabled={isSubmitting}
                />
              }
              label={props.signupLabel}
            />
          ) : null}

          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              left: -10000,
              top: 'auto',
              width: 1,
              height: 1,
              overflow: 'hidden'
            }}
          >
            <TextField
              tabIndex={-1}
              autoComplete='off'
              label='Website'
              value={honeypot}
              onChange={event => setHoneypot(event.target.value)}
            />
          </Box>

          <Box>
            <Button
              type='submit'
              variant={submitButton.variant}
              disableElevation
              disabled={isSubmitting || isCanvasEditing}
              sx={submitButton.sx}
            >
              {isSubmitting ? 'Sending...' : props.submitLabel}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
