'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

type Props = {
  label: string
  emphasized?: boolean
}

/** Floating cue shown only on the active drop target while dragging. */
export function DropTargetCue({ label, emphasized = false }: Props) {
  const theme = useTheme()

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        pointerEvents: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: emphasized
          ? theme.palette.primary.main
          : alpha(theme.palette.background.paper, 0.96),
        color: emphasized ? theme.palette.primary.contrastText : 'primary.main',
        boxShadow: emphasized
          ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`
          : `0 2px 10px ${alpha(theme.palette.common.black, 0.08)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, emphasized ? 0 : 0.22)}`
      }}
    >
      <i className='ri-focus-3-line' style={{ fontSize: '0.75rem' }} />
      <Typography component='span' sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.01em', lineHeight: 1 }}>
        {label}
      </Typography>
    </Box>
  )
}
