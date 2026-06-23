'use client'

import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  helperText?: string
}

export function PropertyTextField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
  helperText
}: Props) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.625 }}>
      <Typography
        component='label'
        sx={{
          ...BUILDER_TYPOGRAPHY.label,
          color: 'text.secondary',
          display: 'block',
          userSelect: 'none'
        }}
      >
        {label}
      </Typography>
      <InputBase
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        sx={{
          ...BUILDER_TYPOGRAPHY.input,
          color: 'text.primary',
          px: 1.25,
          py: 0.875,
          borderRadius: 1,
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.8),
          backgroundColor: alpha(theme.palette.background.paper, 0.6),
          transition: 'border-color 0.15s, box-shadow 0.15s',
          '&.Mui-focused': {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.12)}`
          },
          '& .MuiInputBase-input': {
            p: 0,
            ...BUILDER_TYPOGRAPHY.input,
            color: 'text.primary',
            '&::placeholder': {
              color: 'text.disabled',
              opacity: 1
            }
          },
          '& .MuiInputBase-inputMultiline': {
            resize: 'none'
          }
        }}
      />
      {helperText && (
        <Typography
          component='p'
          sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'text.disabled', m: 0 }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  )
}
