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
import { mergeFormFieldTypographySx, resolveTextTypographySx } from '../../utils/textTypographyHelpers'
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
  const fieldSx = mergeFormFieldTypographySx(
    getContactFormFieldSx(siteStyles, props.fieldStyle, props.fieldBorderRadius, props.fieldBorderWidth),
    siteStyles.fonts,
    siteStyles.forms,
    props.fieldTypography
  )
  const titleSx = {
    ...resolveTextTypographySx('formTitle', siteStyles.fonts, props.titleTypography),
    color: siteStyles.colors.text
  }
  const bodySx = {
    ...resolveTextTypographySx('formBody', siteStyles.fonts, props.bodyTypography),
    color: 'text.secondary'
  }
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

  const contentBoxSx = {
    width: '100%',
    maxWidth: 560,
    ...(props.alignment === 'center'
      ? { mx: 'auto' }
      : props.alignment === 'right'
        ? { ml: 'auto' }
        : undefined)
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
      <Box sx={{ ...contentBoxSx, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant='h5' component='h2' sx={titleSx}>
          <InlineEditableText value={props.title} field='title' placeholder='Form title' sx={titleSx} />
        </Typography>
        {props.subtitle ? (
          <Typography variant='body1' sx={bodySx}>
            <InlineEditableText value={props.subtitle} field='subtitle' placeholder='Form subtitle' multiline sx={bodySx} />
          </Typography>
        ) : null}
      </Box>

      {success ? (
        <Alert severity='success' sx={contentBoxSx}>
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
            ...contentBoxSx
          }}
        >
          {error ? <Alert severity='error'>{error}</Alert> : null}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, ...fieldSx }}>
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
          </Box>

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

          <Box sx={{ textAlign: props.alignment }}>
            <Button
              type='submit'
              variant={submitButton.variant}
              color='inherit'
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
