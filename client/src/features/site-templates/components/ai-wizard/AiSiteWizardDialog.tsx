'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  applyAiGeneratedSiteAction,
  generateAiSitePreviewAction
} from '@/app/actions/ai-site-wizard.actions'
import {
  SITE_TEMPLATE_CATEGORIES,
  SITE_TEMPLATE_CATEGORY_LABELS,
  type SiteTemplateCategory
} from '@/lib/constants/site-template'
import {
  AI_ANIMATION_LEVEL_LABELS,
  AI_ANIMATION_LEVELS,
  AI_COLOR_MOOD_LABELS,
  AI_COLOR_MOODS,
  AI_INDUSTRY_LABELS,
  AI_INDUSTRY_OPTIONS,
  AI_SITE_PURPOSE_LABELS,
  AI_SITE_PURPOSES,
  AI_STYLE_PERSONALITY_LABELS,
  AI_STYLE_PERSONALITIES,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'
import type { AiSiteGenerationPreview } from '@/lib/ai-site-wizard/types'
import type { SiteTemplateSummary } from '@/models/site-template'

import { TemplateLivePreview } from '../TemplateLivePreview'

const STEPS = ['Your brand', 'Business goals', 'Look & feel', 'Your website'] as const

const DEFAULT_PROFILE: AiSiteWizardProfile = {
  companyName: '',
  slogan: '',
  description: '',
  category: 'business',
  industry: 'technology',
  purpose: 'get_leads',
  stylePersonality: 'professional',
  colorMood: 'ai_pick',
  animationLevel: 'moderate'
}

type Props = {
  open: boolean
  templates: SiteTemplateSummary[]
  onClose: () => void
  onCreated?: () => void
}

export function AiSiteWizardDialog({ open, templates: _templates, onClose, onCreated }: Props) {
  const theme = useTheme()
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<AiSiteWizardProfile>(DEFAULT_PROFILE)
  const [preview, setPreview] = useState<AiSiteGenerationPreview | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const homePreview = useMemo(() => {
    if (!preview) {
      return null
    }

    const homePage = preview.pages.find(page => page.slug === 'home') ?? preview.pages[0]

    if (!homePage) {
      return null
    }

    return {
      blocks: homePage.blocks,
      siteStyles: homePage.siteStyles
    }
  }, [preview])

  const reset = () => {
    setStep(0)
    setProfile(DEFAULT_PROFILE)
    setPreview(null)
    setBusy(null)
    setError(null)
  }

  const handleClose = () => {
    if (busy) {
      return
    }

    reset()
    onClose()
  }

  const updateProfile = <K extends keyof AiSiteWizardProfile>(key: K, value: AiSiteWizardProfile[K]) => {
    setProfile(current => ({ ...current, [key]: value }))
    setError(null)
  }

  const canContinue = () => {
    if (step === 0) {
      return profile.companyName.trim().length > 0
    }

    return true
  }

  const generatePreview = async () => {
    setBusy('generate')
    setError(null)
    setStep(3)

    const result = await generateAiSitePreviewAction(profile)

    if (!result.success) {
      setError(result.error)
      setBusy(null)
      setStep(2)

      return
    }

    setPreview(result.preview)
    setBusy(null)
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

  const renderBrandStep = () => (
    <Box className='flex flex-col gap-4'>
      <Typography color='text.secondary'>
        Tell us about your brand — like Wix ADI or Squarespace Blueprint, we&apos;ll tailor your site copy and style.
      </Typography>
      <TextField
        label='Company or brand name'
        value={profile.companyName}
        onChange={event => updateProfile('companyName', event.target.value)}
        required
        fullWidth
        autoFocus
      />
      <TextField
        label='Tagline or slogan (optional)'
        value={profile.slogan}
        onChange={event => updateProfile('slogan', event.target.value)}
        fullWidth
        placeholder='e.g. Fresh coffee, crafted daily'
      />
      <TextField
        label='Short description (optional)'
        value={profile.description}
        onChange={event => updateProfile('description', event.target.value)}
        fullWidth
        multiline
        minRows={3}
        placeholder='What do you do, and who do you serve?'
      />
    </Box>
  )

  const renderBusinessStep = () => (
    <Box className='flex flex-col gap-4'>
      <FormControl fullWidth>
        <InputLabel>Website type</InputLabel>
        <Select
          label='Website type'
          value={profile.category}
          onChange={event => updateProfile('category', event.target.value as SiteTemplateCategory)}
        >
          {SITE_TEMPLATE_CATEGORIES.map(item => (
            <MenuItem key={item} value={item}>
              {SITE_TEMPLATE_CATEGORY_LABELS[item]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Industry</InputLabel>
        <Select
          label='Industry'
          value={profile.industry}
          onChange={event => updateProfile('industry', event.target.value as AiSiteWizardProfile['industry'])}
        >
          {AI_INDUSTRY_OPTIONS.map(item => (
            <MenuItem key={item} value={item}>
              {AI_INDUSTRY_LABELS[item]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Primary goal</InputLabel>
        <Select
          label='Primary goal'
          value={profile.purpose}
          onChange={event => updateProfile('purpose', event.target.value as AiSiteWizardProfile['purpose'])}
        >
          {AI_SITE_PURPOSES.map(item => (
            <MenuItem key={item} value={item}>
              {AI_SITE_PURPOSE_LABELS[item]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )

  const renderStyleStep = () => (
    <Box className='flex flex-col gap-4'>
      <FormControl fullWidth>
        <InputLabel>Style personality</InputLabel>
        <Select
          label='Style personality'
          value={profile.stylePersonality}
          onChange={event =>
            updateProfile('stylePersonality', event.target.value as AiSiteWizardProfile['stylePersonality'])
          }
        >
          {AI_STYLE_PERSONALITIES.map(item => (
            <MenuItem key={item} value={item}>
              {AI_STYLE_PERSONALITY_LABELS[item]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Color mood</InputLabel>
        <Select
          label='Color mood'
          value={profile.colorMood}
          onChange={event => updateProfile('colorMood', event.target.value as AiSiteWizardProfile['colorMood'])}
        >
          {AI_COLOR_MOODS.map(item => (
            <MenuItem key={item} value={item}>
              {AI_COLOR_MOOD_LABELS[item]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Animation level</InputLabel>
        <Select
          label='Animation level'
          value={profile.animationLevel}
          onChange={event =>
            updateProfile('animationLevel', event.target.value as AiSiteWizardProfile['animationLevel'])
          }
        >
          {AI_ANIMATION_LEVELS.map(item => (
            <MenuItem key={item} value={item}>
              {AI_ANIMATION_LEVEL_LABELS[item]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Alert severity='info' variant='outlined'>
        We&apos;ll pick the best layout automatically and apply fonts, colors, and animations from your choices — no
        extra steps needed.
      </Alert>
    </Box>
  )

  const renderBuildStep = () => (
    <Box className='flex flex-col gap-4'>
      {busy === 'generate' ? (
        <Box className='flex flex-col items-center gap-3 py-16'>
          <i className='ri-magic-line text-4xl text-primary animate-pulse' />
          <Typography variant='h6'>Building your website…</Typography>
          <Typography color='text.secondary' className='text-center max-is-[420px]'>
            Picking the best layout, applying your style, and writing copy for {profile.companyName}.
          </Typography>
        </Box>
      ) : preview && homePreview ? (
        <>
          <Alert severity='success' variant='outlined'>
            Your draft is ready. We auto-selected <strong>{preview.templateName}</strong> ({preview.layoutMatchScore}%
            match) — {preview.layoutReason}
          </Alert>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
            <TemplateLivePreview blocks={homePreview.blocks} siteStyles={homePreview.siteStyles} height={360} />
          </Box>
          <Box className='flex flex-wrap gap-2'>
            <Chip label={preview.templateName} size='small' color='primary' variant='tonal' />
            <Chip
              label={`${preview.pages.length} page${preview.pages.length === 1 ? '' : 's'}`}
              size='small'
              variant='outlined'
            />
            {preview.usedOpenAi ? (
              <Chip label='AI copy applied' size='small' color='secondary' variant='tonal' />
            ) : (
              <Chip label='Style applied locally' size='small' variant='outlined' />
            )}
            <Chip label={`Theme: ${preview.styleThemeId}`} size='small' variant='outlined' />
            <Chip label={`Bg: ${preview.stylePageAnimation}`} size='small' variant='outlined' />
          </Box>
        </>
      ) : null}
    </Box>
  )

  const stepContent = [renderBrandStep, renderBusinessStep, renderStyleStep, renderBuildStep][step]()

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth='md'
      scroll='paper'
      slotProps={{
        paper: {
          sx: { borderRadius: 3, overflow: 'hidden', maxHeight: 'min(92vh, 900px)' }
        }
      }}
    >
      <Box
        sx={{
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 3.5 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.14)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative'
        }}
      >
        <IconButton aria-label='Close' onClick={handleClose} disabled={Boolean(busy)} sx={{ position: 'absolute', top: 12, right: 12 }}>
          <i className='ri-close-line' />
        </IconButton>
        <Box className='flex items-start gap-3'>
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
            <i className='ri-magic-line' style={{ fontSize: '1.5rem' }} />
          </Box>
          <div>
            <Typography variant='h5' className='font-semibold mbe-1'>
              Start with AI
            </Typography>
            <Typography color='text.secondary'>
              Answer a few questions — we&apos;ll choose the best layout, style your site, and write your copy.
            </Typography>
          </div>
        </Box>
      </Box>

      <DialogContent sx={{ px: { xs: 3, sm: 4 }, py: 3 }}>
        <Stepper activeStep={step} alternativeLabel className='mbe-6'>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error ? (
          <Alert severity='error' className='mbe-4'>
            {error}
          </Alert>
        ) : null}

        {stepContent}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 3, sm: 4 }, py: 2.5, borderTop: `1px solid ${theme.palette.divider}`, gap: 1.5 }}>
        <Button onClick={handleClose} disabled={Boolean(busy)}>
          Cancel
        </Button>
        <Box sx={{ flex: 1 }} />
        {step > 0 && step < 3 ? (
          <Button onClick={handleBack} disabled={Boolean(busy)}>
            Back
          </Button>
        ) : null}
        {step < 3 ? (
          <Button
            variant='contained'
            disabled={!canContinue() || Boolean(busy)}
            onClick={() => void handleNext()}
            endIcon={busy ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-arrow-right-line' />}
          >
            {step === 2 ? 'Build my website' : 'Continue'}
          </Button>
        ) : preview ? (
          <Button
            variant='contained'
            color='success'
            disabled={Boolean(busy)}
            onClick={() => void applySite()}
            startIcon={busy === 'apply' ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-rocket-line' />}
          >
            {busy === 'apply' ? 'Creating…' : 'Create my website'}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
