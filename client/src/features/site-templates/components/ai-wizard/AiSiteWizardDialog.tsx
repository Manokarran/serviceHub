'use client'

import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  applyAiGeneratedSiteAction,
  generateAiSiteFromWorkspaceAction,
  generateAiSitePreviewAction,
  saveAiGeneratedSiteToLibraryAction
} from '@/app/actions/ai-site-wizard.actions'
import type { AiSiteGenerationPreview } from '@/lib/ai-site-wizard/types'
import type { AiSiteWizardProfile } from '@/lib/validators/ai-site-wizard.validator'
import type { SiteTemplateSummary } from '@/models/site-template'

import { TemplateWebsitePreviewDialog } from '../TemplateWebsitePreviewDialog'
import { BrandStep } from './BrandStep'
import { GoalsStep } from './GoalsStep'
import { LookFeelStep } from './LookFeelStep'
import { ReviewStep } from './ReviewStep'

const STEPS = ['Your brand', 'Business goals', 'Look & feel', 'Review'] as const

const GENERATING_MESSAGES = [
  'Reading your brand details…',
  'Choosing a colour story and type pairing…',
  'Writing headlines and stories…',
  'Sourcing photography that fits the palette…',
  'Setting spacing, corners, and motion…',
  'Harmonising every section…'
]

const DEFAULT_PROFILE: AiSiteWizardProfile = {
  companyName: '',
  slogan: '',
  description: '',
  logoUrl: '',
  siteTitle: '',
  audience: '',
  keyOfferings: '',
  differentiators: '',
  category: 'business',
  industry: 'technology',
  purpose: 'get_leads',
  stylePersonality: 'professional',
  colorMood: 'ai_pick',
  colorMode: 'ai_pick',
  animationLevel: 'moderate',
  fontChoice: 'ai_pick',
  layoutDensity: 'ai_pick',
  cornerStyle: 'ai_pick',
  brandVoice: 'ai_pick',
  heroStyle: 'ai_pick',
  generationNonce: ''
}

type Props = {
  open: boolean

  /** Accepted for call-site compatibility; generation always starts from the master base template. */
  templates?: SiteTemplateSummary[]
  mode?: 'user' | 'library'
  onClose: () => void
  onCreated?: (templateId?: string) => void
}

const GENERATE_TIMEOUT_MS = 60_000

function nextGenerationNonce() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function runWithTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms)
      })
    ])
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

export function AiSiteWizardDialog({ open, mode = 'user', onClose, onCreated }: Props) {
  const theme = useTheme()
  const isLibraryMode = mode === 'library'
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<AiSiteWizardProfile>(DEFAULT_PROFILE)
  const [preview, setPreview] = useState<AiSiteGenerationPreview | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewPageSlug, setPreviewPageSlug] = useState('home')
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false)
  const [libraryName, setLibraryName] = useState('')
  const [progressIndex, setProgressIndex] = useState(0)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const previewPage = useMemo(() => {
    if (!preview) {
      return null
    }

    const page = preview.pages.find(entry => entry.slug === previewPageSlug) ?? preview.pages[0] ?? null

    if (!page) {
      return null
    }

    const sharedStyles =
      preview.pages.find(entry => entry.slug === 'home')?.siteStyles ?? preview.pages[0]?.siteStyles ?? null

    return {
      ...page,
      siteStyles: page.siteStyles ?? sharedStyles
    }
  }, [preview, previewPageSlug])

  useEffect(() => {
    if (busy !== 'generate') {
      setProgressIndex(0)

      return
    }

    const timer = window.setInterval(() => {
      setProgressIndex(current => (current + 1) % GENERATING_MESSAGES.length)
    }, 1800)

    return () => window.clearInterval(timer)
  }, [busy])

  const reset = () => {
    setStep(0)
    setProfile(DEFAULT_PROFILE)
    setPreview(null)
    setBusy(null)
    setError(null)
    setPreviewPageSlug('home')
    setFullPreviewOpen(false)
    setLibraryName('')
  }

  const handleClose = () => {
    if (busy === 'apply' || busy === 'save') {
      return
    }

    reset()
    onClose()
  }

  const updateProfile = <K extends keyof AiSiteWizardProfile>(key: K, value: AiSiteWizardProfile[K]) => {
    setProfile(current => ({ ...current, [key]: value }))
    setError(null)
  }

  const canContinue = () => step !== 0 || profile.companyName.trim().length > 0

  const generatePreview = async () => {
    setBusy('generate')
    setError(null)
    setStep(3)

    const nextProfile = { ...profile, generationNonce: nextGenerationNonce() }

    setProfile(nextProfile)

    try {
      const result = await runWithTimeout(
        isLibraryMode ? generateAiSiteFromWorkspaceAction(nextProfile) : generateAiSitePreviewAction(nextProfile),
        GENERATE_TIMEOUT_MS,
        'Generation is taking too long. Check your OpenAI key, then try again.'
      )

      if (!result.success) {
        setError(result.error)
        setBusy(null)
        setStep(2)

        return
      }

      setPreview(result.preview)
      setPreviewPageSlug(result.preview.pages[0]?.slug ?? 'home')
      setLibraryName(nextProfile.siteTitle.trim() || nextProfile.companyName.trim())
      setBusy(null)
    } catch (generateError) {
      setError(
        generateError instanceof Error ? generateError.message : 'Failed to generate your website. Please try again.'
      )
      setBusy(null)
      setStep(2)
    }
  }

  const applySite = async () => {
    if (!preview) {
      return
    }

    setBusy('apply')
    setError(null)

    const result = await applyAiGeneratedSiteAction(preview.templateId, preview)

    if (!result.success) {
      setError(result.error)
      setBusy(null)

      return
    }

    setBusy(null)
    onCreated?.()
    handleClose()
  }

  const saveToLibrary = async () => {
    if (!preview) {
      return
    }

    const name = libraryName.trim() || profile.companyName.trim()

    if (!name) {
      setError('Give this website a library name before saving.')

      return
    }

    setBusy('save')
    setError(null)

    const result = await saveAiGeneratedSiteToLibraryAction(preview, {
      name,
      description: profile.description || preview.pages[0]?.description,
      category: profile.category,
      logoUrl: profile.logoUrl
    })

    if (!result.success) {
      setError(result.error)
      setBusy(null)

      return
    }

    setBusy(null)
    onCreated?.(result.templateId)
    handleClose()
  }

  const handleNext = async () => {
    if (step === 2) {
      await generatePreview()

      return
    }

    setStep(current => Math.min(current + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setError(null)
    setStep(current => Math.max(current - 1, 0))
  }

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true)
    setError(null)

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append('mediaType', 'image')

      const response = await fetch('/api/media/upload', { method: 'POST', body: formData })
      const payload = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? 'Could not upload the logo.')
      }

      updateProfile('logoUrl', payload.url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the logo.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const fillReviewLayout = step === 3 && Boolean(preview) && busy !== 'generate'

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='lg'
      scroll='paper'
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            maxHeight: 'min(94vh, 960px)',
            display: 'flex',
            flexDirection: 'column',
            ...(fillReviewLayout ? { height: 'min(94vh, 960px)' } : {})
          }
        }
      }}
    >
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 2.5, sm: 3 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.14)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative'
        }}
      >
        <IconButton
          aria-label='Close'
          onClick={handleClose}
          disabled={Boolean(busy)}
          sx={{ position: 'absolute', top: 12, insetInlineEnd: 12 }}
        >
          <i className='ri-close-line' />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.secondary.main, 0.16),
              color: 'secondary.main',
              flexShrink: 0
            }}
          >
            <i className='ri-sparkling-line' style={{ fontSize: '1.5rem' }} />
          </Box>
          <div>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 0.25 }}>
              {isLibraryMode ? 'Generate a library website' : 'Generate your website'}
            </Typography>
            <Typography color='text.secondary'>
              {isLibraryMode
                ? 'Use your designed base, then generate a branded variation to verify and save.'
                : 'Answer a few questions and our AI art director designs the whole site — copy, colour, type, and photography.'}
            </Typography>
          </div>
        </Box>
      </Box>

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: fillReviewLayout ? 2 : 3,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: fillReviewLayout ? 'hidden' : 'auto'
        }}
      >
        <Stepper activeStep={step} alternativeLabel sx={{ mb: fillReviewLayout ? 2 : 4, flexShrink: 0 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error ? (
          <Alert severity='error' sx={{ mb: 3, flexShrink: 0 }}>
            {error}
          </Alert>
        ) : null}

        {step === 0 ? (
          <BrandStep
            profile={profile}
            update={updateProfile}
            isLibraryMode={isLibraryMode}
            uploadingLogo={uploadingLogo}
            onUploadLogo={file => void uploadLogo(file)}
          />
        ) : null}

        {step === 1 ? <GoalsStep profile={profile} update={updateProfile} /> : null}

        {step === 2 ? <LookFeelStep profile={profile} update={updateProfile} /> : null}

        {step === 3 ? (
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ReviewStep
              generating={busy === 'generate'}
              progressMessage={GENERATING_MESSAGES[progressIndex]}
              preview={preview}
              previewPage={previewPage}
              onSelectPage={setPreviewPageSlug}
              onOpenFullPreview={() => setFullPreviewOpen(true)}
              isLibraryMode={isLibraryMode}
              libraryName={libraryName}
              onLibraryNameChange={setLibraryName}
            />
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: 2.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1.5,
          flexShrink: 0
        }}
      >
        <Button onClick={handleClose} disabled={busy === 'apply' || busy === 'save'}>
          {busy === 'generate' ? 'Stop' : 'Cancel'}
        </Button>
        <Box sx={{ flex: 1 }} />
        {step > 0 && step < 3 ? (
          <Button onClick={handleBack} disabled={Boolean(busy)}>
            Back
          </Button>
        ) : null}
        {step === 3 && preview ? (
          <Button
            onClick={() => void generatePreview()}
            disabled={Boolean(busy)}
            startIcon={<i className='ri-refresh-line' />}
          >
            Try another direction
          </Button>
        ) : null}
        {step < 3 ? (
          <Button
            variant='contained'
            disabled={!canContinue() || Boolean(busy)}
            onClick={() => void handleNext()}
            endIcon={
              busy ? (
                <i className='ri-loader-4-line animate-spin' />
              ) : step === 2 ? (
                <i className='ri-sparkling-line' />
              ) : (
                <i className='ri-arrow-right-line' />
              )
            }
          >
            {step === 2 ? 'Generate website' : 'Continue'}
          </Button>
        ) : preview && isLibraryMode ? (
          <Button
            variant='contained'
            color='success'
            disabled={Boolean(busy)}
            onClick={() => void saveToLibrary()}
            startIcon={busy === 'save' ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-save-line' />}
          >
            {busy === 'save' ? 'Saving…' : 'Save to library'}
          </Button>
        ) : preview ? (
          <Button
            variant='contained'
            color='success'
            disabled={Boolean(busy)}
            onClick={() => void applySite()}
            startIcon={
              busy === 'apply' ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-rocket-line' />
            }
          >
            {busy === 'apply' ? 'Creating…' : 'Use this website'}
          </Button>
        ) : null}
      </DialogActions>

      {preview ? (
        <TemplateWebsitePreviewDialog
          open={fullPreviewOpen}
          onClose={() => setFullPreviewOpen(false)}
          title={preview.designConcept || preview.templateName}
          pages={preview.pages.map(page => ({
            slug: page.slug,
            title: page.title,
            blocks: page.blocks,
            siteStyles: page.siteStyles ?? null
          }))}
          initialPageSlug={previewPageSlug}
        />
      ) : null}
    </Dialog>
  )
}
