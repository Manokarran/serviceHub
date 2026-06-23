'use client'

import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'
import type { TextAlign } from '../../types'

const ALIGN_OPTIONS: { value: TextAlign; icon: string; label: string }[] = [
  { value: 'left', icon: 'ri-align-left', label: 'Left' },
  { value: 'center', icon: 'ri-align-center', label: 'Center' },
  { value: 'right', icon: 'ri-align-right', label: 'Right' }
]

type Props = {
  value: TextAlign
  onChange: (v: TextAlign) => void
}

export function AlignmentControl({ value, onChange }: Props) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.625 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
        Alignment
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.5 }}>
        {ALIGN_OPTIONS.map(opt => {
          const active = value === opt.value

          return (
            <Tooltip key={opt.value} title={opt.label} placement='top'>
              <Box
                component='button'
                type='button'
                aria-label={opt.label}
                aria-pressed={active}
                onClick={() => onChange(opt.value)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  py: 0.75,
                  border: 'none',
                  borderRadius: 1,
                  cursor: 'pointer',
                  ...builderSoftCardSx(theme, active),
                  color: active ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.12s'
                }}
              >
                <i className={opt.icon} style={{ fontSize: '1rem' }} />
                <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'inherit', lineHeight: 1 }}>
                  {opt.label}
                </Typography>
              </Box>
            </Tooltip>
          )
        })}
      </Box>
    </Box>
  )
}
