'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY, BUILDER_PROPERTY_PANEL_SX, builderPanelHeaderSx } from '../../constants/builderLayout'

type Props = {
  label: string
  onClick: () => void
  children: React.ReactNode
}

export function StyleSectionCard({ label, onClick, children }: Props) {
  const theme = useTheme()

  return (
    <Box
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      sx={{
        display: 'flex',
        cursor: 'pointer',
        borderRadius: 1,
        overflow: 'hidden',
        outline: 'none',
        '&:hover .style-card-preview': {
          backgroundColor: alpha(theme.palette.text.primary, 0.06)
        },
        '&:hover .style-card-chevron': {
          backgroundColor: alpha(theme.palette.text.primary, 0.1)
        }
      }}
    >
      <Box
        className='style-card-preview'
        sx={{
          flex: 1,
          minWidth: 0,
          p: 1.75,
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          transition: 'background-color 0.15s'
        }}
      >
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.25, ...BUILDER_TYPOGRAPHY.label }}>
          {label}
        </Typography>
        {children}
      </Box>
      <Box
        className='style-card-chevron'
        sx={{
          width: 36,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.text.primary, 0.06),
          color: 'text.secondary',
          transition: 'background-color 0.15s'
        }}
      >
        <i className='ri-arrow-right-s-line' />
      </Box>
    </Box>
  )
}

export function StylePanelHeader({
  title,
  onBack,
  onClose
}: {
  title: string
  onBack?: () => void
  onClose?: () => void
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        ...builderPanelHeaderSx(theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.75
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: 1 }}>
        {onBack && (
          <Box
            component='button'
            type='button'
            onClick={onBack}
            aria-label='Go back'
            sx={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              p: 0.375,
              display: 'flex',
              color: 'text.secondary',
              borderRadius: 0.75,
              flexShrink: 0,
              '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) }
            }}
          >
            <i className='ri-arrow-left-s-line' style={{ fontSize: '1rem' }} />
          </Box>
        )}
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.title, m: 0 }} noWrap>
          {title}
        </Typography>
      </Box>
      {onClose && (
        <IconButton
          size='small'
          onClick={onClose}
          aria-label='Close panel'
          sx={{ flexShrink: 0, width: 28, height: 28, color: 'text.secondary' }}
        >
          <i className='ri-close-line' style={{ fontSize: '0.95rem' }} />
        </IconButton>
      )}
    </Box>
  )
}

export function StylePanelBody({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, ...BUILDER_PROPERTY_PANEL_SX }}>
      {children}
    </Box>
  )
}

export function StyleNavRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:hover': { opacity: 0.8 }
      }}
    >
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, m: 0 }}>
        {label}
      </Typography>
      <i className='ri-arrow-right-s-line' style={{ opacity: 0.45 }} />
    </Box>
  )
}

export function ColorSwatchRow({ colors }: { colors: string[] }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {colors.map((color, index) => (
        <Box
          key={index}
          sx={{
            flex: 1,
            height: 28,
            backgroundColor: color,
            border: '1px solid',
            borderColor: alpha('#000', 0.08)
          }}
        />
      ))}
    </Box>
  )
}

export function StyleCustomizeFooter({ onClick }: { onClick: () => void }) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        flexShrink: 0,
        p: 2,
        borderTop: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.8),
        backgroundColor: 'background.paper'
      }}
    >
      <Box
        component='button'
        type='button'
        onClick={onClick}
        sx={{
          width: '100%',
          py: 1.25,
          border: '1px solid',
          borderColor: alpha(theme.palette.text.primary, 0.85),
          borderRadius: 0.5,
          backgroundColor: 'background.paper',
          cursor: 'pointer',
          ...BUILDER_TYPOGRAPHY.label,
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: 'text.primary',
          transition: 'background-color 0.15s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.04)
          }
        }}
      >
        CUSTOMIZE
      </Box>
    </Box>
  )
}

export function StylePackGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 1.25
      }}
    >
      {children}
    </Box>
  )
}

type StylePackCardProps = {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}

export function StylePackCard({ selected, onClick, children }: StylePackCardProps) {
  const theme = useTheme()

  return (
    <Box
      onClick={onClick}
      role='button'
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      sx={{
        p: 1.5,
        minHeight: 88,
        borderRadius: 0.5,
        border: '2px solid',
        borderColor: selected ? theme.palette.text.primary : alpha(theme.palette.divider, 0.9),
        backgroundColor: 'background.paper',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&:hover': {
          borderColor: selected ? theme.palette.text.primary : alpha(theme.palette.text.primary, 0.35)
        }
      }}
    >
      {children}
    </Box>
  )
}

export function FontPackPreview({ fonts }: { fonts: import('../../types/siteStyles').SiteFonts }) {
  return (
    <>
      <Typography
        sx={{
          fontFamily: fonts.headingFamily,
          fontWeight: fonts.headingWeight,
          fontSize: '0.95rem',
          lineHeight: 1.2,
          letterSpacing: fonts.headingLetterSpacing,
          mb: 0.5
        }}
      >
        Heading
      </Typography>
      <Typography
        sx={{
          fontFamily: fonts.bodyFamily,
          fontWeight: fonts.bodyWeight,
          fontSize: '0.65rem',
          color: 'text.secondary',
          lineHeight: 1.35
        }}
      >
        This is your paragraph.
      </Typography>
    </>
  )
}

export function ButtonPackPreview({
  buttons,
  accent
}: {
  buttons: import('../../types/siteStyles').SiteStyles['buttons']
  accent: string
}) {
  const primary = buttons.primary

  const borderRadius = primary.shape === 'pill' ? 999 : primary.shape === 'rounded' ? 8 : 0
  const isOutline = primary.style === 'outline'
  const isGhost = primary.style === 'ghost'

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 0.5 }}>
      <Box
        sx={{
          px: 2,
          py: 0.65,
          borderRadius,
          backgroundColor: isOutline || isGhost ? 'transparent' : accent,
          color: isOutline || isGhost ? accent : '#fff',
          border: isOutline ? `1px solid ${accent}` : 'none',
          ...BUILDER_TYPOGRAPHY.label,
          letterSpacing: '0.08em'
        }}
      >
        BUTTON
      </Box>
    </Box>
  )
}

export function FormPackPreview({
  forms,
  accent
}: {
  forms: import('../../types/siteStyles').SiteForms
  accent: string
}) {
  const borderRadius = forms.fieldShape === 'pill' ? 999 : forms.fieldShape === 'rounded' ? 8 : 0

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.25 }}>
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          border: forms.fieldBorderWidth ? `${forms.fieldBorderWidth}px solid ${forms.fieldBorderColor}` : 'none',
          borderRadius,
          backgroundColor: forms.fieldBackground,
          fontSize: '0.65rem',
          color: 'text.secondary',
          minWidth: 56,
          textAlign: 'center'
        }}
      >
        Text
      </Box>
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: forms.fieldShape === 'square' ? 0 : 0.5,
          backgroundColor: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '0.55rem',
          flexShrink: 0
        }}
      >
        <i className='ri-check-line' />
      </Box>
    </Box>
  )
}

export function PreviewButton({ label, colors }: { label: string; colors: { bg: string; text: string } }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
      <Box
        sx={{
          px: 2.5,
          py: 0.75,
          borderRadius: 999,
          backgroundColor: colors.bg,
          color: colors.text,
          ...BUILDER_TYPOGRAPHY.label,
          letterSpacing: '0.08em'
        }}
      >
        {label}
      </Box>
    </Box>
  )
}
