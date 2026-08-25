'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { BRAND_VOICE_META } from '@/lib/ai-site-wizard/design-catalog'
import {
  AI_BRAND_VOICE_LABELS,
  AI_BRAND_VOICES,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'

import { FieldGroup, OptionCard, OptionGrid, StepIntro } from './WizardControls'

type Props = {
  profile: AiSiteWizardProfile
  update: <K extends keyof AiSiteWizardProfile>(key: K, value: AiSiteWizardProfile[K]) => void
  isLibraryMode: boolean
  uploadingLogo: boolean
  onUploadLogo: (file: File) => void
}

export function BrandStep({ profile, update, isLibraryMode, uploadingLogo, onUploadLogo }: Props) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <StepIntro
        title='Tell us about the business'
        description={
          isLibraryMode
            ? 'These details restyle your designed Home, About, and Contact pages into a branded website you can save to the library.'
            : 'The more specific you are here, the less generic your website will read. Everything below feeds the copywriter.'
        }
      />

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        <TextField
          label='Company or brand name'
          value={profile.companyName}
          onChange={event => update('companyName', event.target.value)}
          required
          fullWidth
          autoFocus
        />
        <TextField
          label='Website title'
          value={profile.siteTitle}
          onChange={event => update('siteTitle', event.target.value)}
          fullWidth
          placeholder='Only if different from the company name'
        />
      </Box>

      <TextField
        label='Tagline or slogan'
        value={profile.slogan}
        onChange={event => update('slogan', event.target.value)}
        fullWidth
        placeholder='e.g. Fresh coffee, crafted daily'
      />

      <TextField
        label='About the business'
        value={profile.description}
        onChange={event => update('description', event.target.value)}
        fullWidth
        multiline
        minRows={4}
        placeholder='Who you serve, what you offer, and what makes you different. This is the main source for every headline we write.'
      />

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        <TextField
          label='Who is it for?'
          value={profile.audience}
          onChange={event => update('audience', event.target.value)}
          fullWidth
          placeholder='e.g. Busy parents in inner-west Sydney'
          helperText='The copy will speak directly to these people'
        />
        <TextField
          label='Main products or services'
          value={profile.keyOfferings}
          onChange={event => update('keyOfferings', event.target.value)}
          fullWidth
          placeholder='e.g. Bridal styling, colour correction, extensions'
          helperText='Separate a few with commas'
        />
      </Box>

      <TextField
        label='What makes you different?'
        value={profile.differentiators}
        onChange={event => update('differentiators', event.target.value)}
        fullWidth
        placeholder='e.g. Only studio in the area open on Sundays, 15 years in the trade'
        helperText='Used as proof points instead of invented claims'
      />

      <FieldGroup label='Brand voice' hint='How the writing should sound'>
        <OptionGrid minWidth={196}>
          {AI_BRAND_VOICES.map(item => (
            <OptionCard
              key={item}
              selected={profile.brandVoice === item}
              onSelect={() => update('brandVoice', item)}
              icon={BRAND_VOICE_META[item].icon}
              title={AI_BRAND_VOICE_LABELS[item]}
              subtitle={BRAND_VOICE_META[item].blurb}
            />
          ))}
        </OptionGrid>
      </FieldGroup>

      <FieldGroup label='Logo' hint='Optional — dropped into the header and footer'>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {profile.logoUrl ? (
            <Box
              component='img'
              src={profile.logoUrl}
              alt='Logo preview'
              sx={{
                width: 56,
                height: 56,
                objectFit: 'contain',
                borderRadius: 1.5,
                p: 0.5,
                border: `1px solid ${theme.palette.divider}`
              }}
            />
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px dashed ${theme.palette.divider}`,
                color: 'text.disabled'
              }}
            >
              <i className='ri-image-line' />
            </Box>
          )}
          <Button
            component='label'
            variant='outlined'
            disabled={uploadingLogo}
            startIcon={<i className='ri-upload-2-line' />}
          >
            {uploadingLogo ? 'Uploading…' : 'Upload logo'}
            <input
              hidden
              type='file'
              accept='image/*'
              onChange={event => {
                const file = event.target.files?.[0]

                if (file) {
                  onUploadLogo(file)
                }

                event.target.value = ''
              }}
            />
          </Button>
          {profile.logoUrl ? (
            <Button size='small' color='inherit' onClick={() => update('logoUrl', '')}>
              Remove
            </Button>
          ) : null}
          <Typography variant='caption' color='text.secondary'>
            or paste a URL
          </Typography>
          <TextField
            size='small'
            value={profile.logoUrl}
            onChange={event => update('logoUrl', event.target.value)}
            placeholder='https://…'
            sx={{ flex: 1, minWidth: 200 }}
          />
        </Box>
      </FieldGroup>
    </Box>
  )
}
