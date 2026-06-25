'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'

type Props = {
  label: string
  onClick: () => void
}

export function PropertyAddButton({ label, onClick }: Props) {
  const theme = useTheme()

  return (
    <Box
      component='button'
      type='button'
      onClick={onClick}
      sx={{
        width: '100%',
        border: '1px dashed',
        borderColor: alpha(theme.palette.primary.main, 0.28),
        borderRadius: 1,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        color: 'primary.main',
        cursor: 'pointer',
        py: 1,
        px: 1.25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        ...BUILDER_TYPOGRAPHY.label,
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          borderColor: alpha(theme.palette.primary.main, 0.42)
        }
      }}
    >
      <i className='ri-add-line' style={{ fontSize: '0.9rem' }} />
      {label}
    </Box>
  )
}

export function PropertyRemoveButton({ label, onClick }: Props) {
  const theme = useTheme()

  return (
    <Box
      component='button'
      type='button'
      onClick={onClick}
      sx={{
        alignSelf: 'flex-start',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        p: 0,
        m: 0,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        color: 'text.secondary',
        ...BUILDER_TYPOGRAPHY.label,
        '&:hover': { color: 'error.main' }
      }}
    >
      <i className='ri-delete-bin-line' style={{ fontSize: '0.8rem', color: theme.palette.error.main }} />
      <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'inherit' }}>
        {label}
      </Typography>
    </Box>
  )
}
