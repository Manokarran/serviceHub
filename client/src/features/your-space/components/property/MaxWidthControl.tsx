'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'

type MaxWidth = 'sm' | 'md' | 'lg' | 'full'

const OPTIONS: { value: MaxWidth; label: string; sublabel: string; icon: string }[] = [
  { value: 'sm', label: 'S', sublabel: '640px', icon: 'ri-contract-left-right-line' },
  { value: 'md', label: 'M', sublabel: '768px', icon: 'ri-expand-left-right-line' },
  { value: 'lg', label: 'L', sublabel: '1024px', icon: 'ri-fullscreen-line' },
  { value: 'full', label: 'Full', sublabel: '100%', icon: 'ri-layout-fill' }
]

type Props = {
  value: MaxWidth
  onChange: (v: MaxWidth) => void
}

export function MaxWidthControl({ value, onChange }: Props) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.625 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
        Max width
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5 }}>
        {OPTIONS.map(opt => {
          const active = value === opt.value

          return (
            <Tooltip key={opt.value} title={opt.sublabel} placement='top'>
              <Box
                component='button'
                type='button'
                aria-label={`${opt.label} — ${opt.sublabel}`}
                aria-pressed={active}
                onClick={() => onChange(opt.value)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.25,
                  py: 0.75,
                  px: 0.25,
                  border: 'none',
                  borderRadius: 1,
                  cursor: 'pointer',
                  ...builderSoftCardSx(theme, active),
                  color: active ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.12s'
                }}
              >
                <Typography
                  component='span'
                  sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'inherit', fontWeight: 600, lineHeight: 1 }}
                >
                  {opt.label}
                </Typography>
                <Typography
                  component='span'
                  sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'inherit', opacity: 0.7, lineHeight: 1, fontSize: '0.6rem' }}
                >
                  {opt.sublabel}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}
