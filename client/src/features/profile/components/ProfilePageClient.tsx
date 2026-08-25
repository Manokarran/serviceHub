'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  checkTenantSlugAvailabilityAction,
  updateTenantProfileAction
} from '@/app/actions/tenant-profile.actions'
import { migrateLocalTenantSlug } from '@/features/profile/utils/migrate-local-tenant-slug'
import { isImageKitConfigured } from '@/lib/imagekit/config'
import { getDisplayImageUrl } from '@/lib/imagekit/urls'
import { sanitizeSlugInput, slugify } from '@/lib/utils/slug'
import { tenantSlugSchema } from '@/lib/validators/auth.validator'
import type { TenantProfileView } from '@/services/tenant'

type Props = {
  userName: string
  userEmail: string
  userImage: string
  userRole: string
  canEdit: boolean
  siteUrlPrefix: string
  liveSitePath: string
  profile: TenantProfileView
}

type SlugStatus = 'idle' | 'checking' | 'current' | 'available' | 'taken' | 'reserved' | 'invalid'

function formatRole(role: string) {
  if (!role) {
    return 'Member'
  }

  return role.charAt(0).toUpperCase() + role.slice(1)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

export function ProfilePageClient({
  userName,
  userEmail,
  userImage,
  userRole,
  canEdit,
  siteUrlPrefix,
  liveSitePath,
  profile
}: Props) {
  const theme = useTheme()
  const router = useRouter()
  const { update } = useSession()
  const [companyName, setCompanyName] = useState(profile.companyName)
  const [slug, setSlug] = useState(profile.slug)
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl)
  const [savedProfile, setSavedProfile] = useState(profile)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('current')
  const [slugMessage, setSlugMessage] = useState('This is your current site URL')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const normalizedSlug = slugify(slug)
  const slugChanged = normalizedSlug !== savedProfile.slug

  const isDirty =
    companyName.trim() !== savedProfile.companyName ||
    slugChanged ||
    logoUrl !== savedProfile.logoUrl

  const imageKitReady = isImageKitConfigured()
  const slugLocked = savedProfile.isSystemTenant

  const canSave =
    canEdit &&
    isDirty &&
    !uploadingLogo &&
    !isPending &&
    companyName.trim().length >= 2 &&
    (!slugChanged || slugStatus === 'available')

  const livePreviewUrl = `${siteUrlPrefix}${normalizedSlug || savedProfile.slug}`
  const logoPreview = logoUrl ? getDisplayImageUrl(logoUrl, 160, { quality: 92 }) : ''

  const slugHelperColor = useMemo(() => {
    if (slugStatus === 'available' || slugStatus === 'current') {
      return 'success.main'
    }

    if (slugStatus === 'checking' || slugStatus === 'idle') {
      return 'text.secondary'
    }

    return 'error.main'
  }, [slugStatus])

  useEffect(() => {
    const scrollToWorkspace = () => {
      if (window.location.hash !== '#workspace') {
        return
      }

      window.setTimeout(() => {
        document.getElementById('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }

    scrollToWorkspace()
    window.addEventListener('hashchange', scrollToWorkspace)

    return () => window.removeEventListener('hashchange', scrollToWorkspace)
  }, [])

  useEffect(() => {
    if (!canEdit || slugLocked) {
      setSlugStatus('current')
      setSlugMessage(slugLocked ? 'This workspace URL cannot be changed' : 'This is your current site URL')

      return
    }

    if (!slugChanged) {
      setSlugStatus('current')
      setSlugMessage('This is your current site URL')

      return
    }

    const parsed = tenantSlugSchema.safeParse(normalizedSlug)

    if (!parsed.success) {
      setSlugStatus('invalid')
      setSlugMessage(parsed.error.issues[0]?.message ?? 'Enter a valid site URL')

      return
    }

    let cancelled = false

    setSlugStatus('checking')
    setSlugMessage('Checking availability…')

    const timer = window.setTimeout(() => {
      void checkTenantSlugAvailabilityAction(parsed.data).then(result => {
        if (cancelled) {
          return
        }

        if (!result.success) {
          setSlugStatus('invalid')
          setSlugMessage(result.error)

          return
        }

        const { availability } = result

        if (availability.reason === 'current') {
          setSlugStatus('current')
          setSlugMessage('This is your current site URL')

          return
        }

        if (availability.available) {
          setSlugStatus('available')
          setSlugMessage('This URL is available')

          return
        }

        if (availability.reason === 'reserved') {
          setSlugStatus('reserved')
          setSlugMessage('This URL is reserved')

          return
        }

        if (availability.reason === 'taken') {
          setSlugStatus('taken')
          setSlugMessage('This URL is already taken')

          return
        }

        setSlugStatus('invalid')
        setSlugMessage('Enter a valid site URL')
      })
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [canEdit, normalizedSlug, slugChanged, slugLocked])

  const persistProfile = () => {
    setError(null)
    setMessage(null)

    startTransition(async () => {
      const previousSlug = savedProfile.slug

      const result = await updateTenantProfileAction({
        companyName: companyName.trim(),
        slug: normalizedSlug,
        logoUrl
      })

      if (!result.success) {
        setError(result.error)

        return
      }

      migrateLocalTenantSlug(previousSlug, result.profile.slug)
      setSavedProfile(result.profile)
      setCompanyName(result.profile.companyName)
      setSlug(result.profile.slug)
      setLogoUrl(result.profile.logoUrl)
      setConfirmOpen(false)
      setMessage('Profile updated')
      await update({
        tenantSlug: result.profile.slug,
        tenantName: result.profile.companyName
      })
      router.refresh()
    })
  }

  const handleSave = () => {
    if (!canSave) {
      return
    }

    if (slugChanged) {
      setConfirmOpen(true)

      return
    }

    persistProfile()
  }

  const uploadLogo = async (file: File) => {
    if (!imageKitReady) {
      setError('Image uploads are not configured yet.')

      return
    }

    setUploadingLogo(true)
    setError(null)
    setMessage(null)

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('mediaType', 'image')

      const response = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const payload = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? 'Could not upload the logo.')
      }

      setLogoUrl(payload.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <Box className='flex flex-col gap-6'>
      <Box
        sx={{
          borderRadius: 4,
          px: { xs: 2.75, md: 4 },
          py: { xs: 3, md: 3.5 },
          color: 'common.white',
          background: `linear-gradient(118deg, #5B21B6 0%, ${theme.palette.primary.main} 58%, #818CF8 100%)`,
          boxShadow: `0 18px 40px ${alpha('#6D28D9', 0.24)}`
        }}
      >
        <Chip
          label={savedProfile.companyName}
          size='small'
          sx={{
            mb: 1.5,
            bgcolor: alpha('#fff', 0.16),
            color: 'common.white',
            border: `1px solid ${alpha('#fff', 0.32)}`,
            fontWeight: 600
          }}
        />
        <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 0.75 }}>
          My profile
        </Typography>
        <Typography sx={{ color: alpha('#fff', 0.9), maxWidth: 560, mb: 2 }}>
          Account details for {userName}, plus the company name, logo, and public site URL used across your workspace.
        </Typography>
        {liveSitePath ? (
          <Button
            component={Link}
            href={liveSitePath}
            target='_blank'
            variant='outlined'
            startIcon={<i className='ri-external-link-line' />}
            sx={{
              borderColor: alpha('#fff', 0.5),
              color: 'common.white',
              '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.12) }
            }}
          >
            View live site
          </Button>
        ) : null}
      </Box>

      {error ? <Alert severity='error'>{error}</Alert> : null}
      {message ? <Alert severity='success' onClose={() => setMessage(null)}>{message}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 0.9fr) minmax(0, 1.2fr)' }
        }}
      >
        <Box
          sx={{
            borderRadius: 3,
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            display: 'flex',
            flexDirection: 'column',
            gap: 2.25
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            Account
          </Typography>
          <Box className='flex items-center gap-3'>
            <Avatar alt={userName} src={userImage} sx={{ width: 64, height: 64 }} />
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{userName}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {userEmail}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
            <MetaItem label='Role' value={formatRole(userRole)} />
            <MetaItem label='Plan' value={formatRole(savedProfile.plan)} />
            <MetaItem label='Workspace status' value={formatRole(savedProfile.status)} />
            <MetaItem label='Workspace created' value={formatDate(savedProfile.createdAt)} />
          </Box>
          <Typography variant='caption' color='text.secondary'>
            Signed in with Google. Name, email, and photo come from your Google account.
          </Typography>
        </Box>

        <Box
          id='workspace'
          sx={{
            borderRadius: 3,
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            scrollMarginTop: 88
          }}
        >
          <Box className='flex items-center justify-between gap-2 flex-wrap'>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              Company settings
            </Typography>
            <Chip label={canEdit ? 'Editable' : 'View only'} size='small' variant='tonal' color='primary' />
          </Box>

          <TextField
            label='Company name'
            value={companyName}
            onChange={event => setCompanyName(event.target.value)}
            disabled={!canEdit || isPending}
            fullWidth
            helperText='Shown on your website header, footer, and workspace.'
          />

          <Box>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
              Company logo
            </Typography>
            <Box className='flex items-center gap-3 flex-wrap'>
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 2,
                  border: `1px dashed ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  bgcolor: alpha(theme.palette.text.primary, 0.03)
                }}
              >
                {logoPreview ? (
                  <Box component='img' src={logoPreview} alt='Company logo' sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', p: 1 }} />
                ) : (
                  <i className='ri-image-line' style={{ fontSize: '1.6rem', opacity: 0.45 }} />
                )}
              </Box>
              <Box className='flex flex-col gap-1.5'>
                <Box className='flex gap-1.5 flex-wrap'>
                  <Button
                    component='label'
                    variant='outlined'
                    disabled={!canEdit || uploadingLogo || isPending}
                    startIcon={uploadingLogo ? <CircularProgress size={14} /> : <i className='ri-upload-2-line' />}
                  >
                    {uploadingLogo ? 'Uploading…' : logoUrl ? 'Replace logo' : 'Upload logo'}
                    <input
                      hidden
                      type='file'
                      accept='image/png,image/jpeg,image/webp,image/gif'
                      onChange={event => {
                        const file = event.target.files?.[0]

                        if (file) {
                          void uploadLogo(file)
                        }

                        event.target.value = ''
                      }}
                    />
                  </Button>
                  {logoUrl ? (
                    <Button
                      color='inherit'
                      disabled={!canEdit || isPending}
                      onClick={() => setLogoUrl('')}
                    >
                      Remove
                    </Button>
                  ) : null}
                </Box>
                <Typography variant='caption' color='text.secondary'>
                  Used in your site header and footer. PNG, JPEG, or WebP with a transparent background works best.
                </Typography>
              </Box>
            </Box>
          </Box>

          <TextField
            label='Site URL'
            value={slug}
            onChange={event => setSlug(sanitizeSlugInput(event.target.value))}
            onBlur={() => setSlug(slugify(slug))}
            disabled={!canEdit || slugLocked || isPending}
            error={slugChanged && (slugStatus === 'taken' || slugStatus === 'reserved' || slugStatus === 'invalid')}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <Typography variant='body2' color='text.secondary' noWrap sx={{ maxWidth: { xs: 120, sm: 220 } }}>
                      {siteUrlPrefix}
                    </Typography>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    {slugStatus === 'checking' ? (
                      <CircularProgress size={16} />
                    ) : slugStatus === 'available' || slugStatus === 'current' ? (
                      <i className='ri-checkbox-circle-line' style={{ color: theme.palette.success.main }} />
                    ) : slugChanged ? (
                      <i className='ri-error-warning-line' style={{ color: theme.palette.error.main }} />
                    ) : null}
                  </InputAdornment>
                )
              }
            }}
            helperText={
              <Box component='span' sx={{ color: slugHelperColor }}>
                {slugMessage}. Preview: {livePreviewUrl}
              </Box>
            }
          />

          <Box className='flex items-center justify-end gap-2'>
            <Button
              variant='contained'
              disabled={!canSave}
              onClick={handleSave}
              startIcon={isPending ? <CircularProgress size={16} color='inherit' /> : <i className='ri-save-line' />}
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog open={confirmOpen} onClose={() => !isPending && setConfirmOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Change your public site URL?</DialogTitle>
        <DialogContent className='flex flex-col gap-2'>
          <Alert severity='warning' variant='outlined'>
            Visitors using the old link will no longer reach your site. Internal page links will be updated to the new
            URL.
          </Alert>
          <Typography variant='body2' color='text.secondary'>
            From <strong>{siteUrlPrefix}{savedProfile.slug}</strong>
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            To <strong>{livePreviewUrl}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant='contained' color='warning' onClick={persistProfile} disabled={isPending}>
            {isPending ? 'Updating…' : 'Update URL'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant='body2' sx={{ fontWeight: 600 }} noWrap title={value}>
        {value}
      </Typography>
    </Box>
  )
}
