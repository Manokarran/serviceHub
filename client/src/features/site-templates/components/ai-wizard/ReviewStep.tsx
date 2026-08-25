'use client'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { getFontPairing } from '@/lib/ai-site-wizard/design-catalog'
import type { AiCustomizedPage, AiSiteGenerationPreview } from '@/lib/ai-site-wizard/types'

import { TemplateLivePreview } from '../TemplateLivePreview'
import { SwatchStrip, useSpecimenFonts } from './WizardControls'

type Props = {
  generating: boolean
  progressMessage: string
  preview: AiSiteGenerationPreview | null
  previewPage: AiCustomizedPage | null
  onSelectPage: (slug: string) => void
  onOpenFullPreview: () => void
  isLibraryMode: boolean
  libraryName: string
  onLibraryNameChange: (value: string) => void
}

export function ReviewStep({
  generating,
  progressMessage,
  preview,
  previewPage,
  onSelectPage,
  onOpenFullPreview,
  isLibraryMode,
  libraryName,
  onLibraryNameChange
}: Props) {
  const theme = useTheme()
  const font = getFontPairing(preview?.designFontId ?? '')

  useSpecimenFonts([font.headingFamily, font.bodyFamily])

  if (generating) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          py: 12
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: '#fff',
            fontSize: '1.75rem',
            animation: 'pulse 1.8s ease-in-out infinite'
          }}
        >
          <i className='ri-sparkling-line' />
        </Box>
        <Typography variant='h6'>Designing your website…</Typography>
        <Typography color='text.secondary' sx={{ textAlign: 'center', maxWidth: 420 }}>
          {progressMessage}
        </Typography>
      </Box>
    )
  }

  if (!preview || !previewPage) {
    return null
  }

  const palette = preview.designPalette

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0, height: '100%' }}>
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            background: `linear-gradient(120deg, ${palette.gradientStart}, ${palette.gradientEnd})`,
            color: '#fff',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { md: 'center' }
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='overline' sx={{ opacity: 0.85, letterSpacing: '0.12em', fontWeight: 700 }}>
              {preview.designByAi ? 'Art direction' : 'Design direction'}
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 700, fontFamily: font.headingFamily, lineHeight: 1.2 }}>
              {preview.designConcept}
            </Typography>
            <Typography variant='body2' sx={{ opacity: 0.92, mt: 0.25 }} noWrap title={preview.designRationale}>
              {preview.designRationale}
            </Typography>
          </Box>
          <Box sx={{ minWidth: { md: 220 } }}>
            <SwatchStrip
              height={22}
              colors={[
                palette.background,
                palette.surface,
                palette.accent,
                palette.gradientStart,
                palette.gradientEnd,
                palette.text
              ]}
            />
            <Typography sx={{ fontFamily: font.headingFamily, fontWeight: 700, fontSize: '0.85rem', mt: 0.75 }}>
              {font.label}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            px: 2,
            py: 1.25,
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Chip size='small' variant='tonal' color='primary' label={`Theme: ${preview.styleThemeId}`} />
          <Chip size='small' variant='outlined' label={`${preview.designColorMode} mode`} />
          <Chip size='small' variant='outlined' label={`${preview.designDensity} spacing`} />
          <Chip size='small' variant='outlined' label={`${preview.designCorners} corners`} />
          <Chip size='small' variant='outlined' label={`${preview.designHeroLayout} hero`} />
          <Chip size='small' variant='outlined' label={preview.stylePageAnimation} />
          <Chip size='small' variant='outlined' label={`${preview.photoCount} photos`} />
          <Chip
            size='small'
            variant='tonal'
            color={preview.usedOpenAi ? 'secondary' : 'default'}
            label={preview.usedOpenAi ? 'AI copy' : 'Template copy'}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0 }}>
        {preview.pages.length > 1 ? (
          <Tabs
            value={previewPage.slug}
            onChange={(_event, value: string) => onSelectPage(value)}
            variant='scrollable'
            allowScrollButtonsMobile
            sx={{ minHeight: 38, '& .MuiTab-root': { minHeight: 38 } }}
          >
            {preview.pages.map(page => (
              <Tab key={page.slug} value={page.slug} label={page.title || page.slug} />
            ))}
          </Tabs>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            Scaled desktop snapshot — scroll inside the frame to review the page.
          </Typography>
        )}
        <Button variant='outlined' size='small' startIcon={<i className='ri-eye-line' />} onClick={onOpenFullPreview}>
          View full website
        </Button>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 360, sm: 480 },
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[4],
          display: 'flex',
          flexDirection: 'column',
          bgcolor: theme.palette.background.paper
        }}
      >
        <TemplateLivePreview
          blocks={previewPage.blocks}
          siteStyles={previewPage.siteStyles}
          height='100%'
          mode='scroll'
        />
      </Box>

      {preview.generationNotes?.length ? (
        <Box
          component='details'
          sx={{
            borderRadius: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            px: 1.75,
            py: 1.25,
            flexShrink: 0,
            backgroundColor: alpha(theme.palette.text.primary, 0.02),
            '& summary': { cursor: 'pointer', fontSize: '0.8125rem', color: theme.palette.text.secondary }
          }}
        >
          <Box component='summary'>What the generator did</Box>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {preview.generationNotes.map(note => (
              <Typography key={note} variant='body2' color='text.secondary'>
                {note}
              </Typography>
            ))}
          </Box>
        </Box>
      ) : null}

      {isLibraryMode ? (
        <TextField
          label='Library name'
          value={libraryName}
          onChange={event => onLibraryNameChange(event.target.value)}
          fullWidth
          helperText='Saved as a draft in the template library. Publish it when you want users to see it.'
          sx={{ flexShrink: 0 }}
        />
      ) : (
        <Alert severity='info' variant='outlined' sx={{ flexShrink: 0 }}>
          Apply this draft to Your Space, then edit any section — copy, photos, colours, and layout.
        </Alert>
      )}
    </Box>
  )
}
