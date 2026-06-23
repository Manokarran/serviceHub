'use client'

import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'

type Props = {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function PropertyToggleRow({ label, description, checked, onChange, disabled = false }: Props) {
  const theme = useTheme()

  return (
    <Box
      component='label'
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 1.25,
        py: description ? 0.875 : 0.625,
        borderRadius: 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.7),
        backgroundColor: checked
          ? alpha(theme.palette.primary.main, 0.04)
          : alpha(theme.palette.background.paper, 0.5),
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': disabled
          ? {}
          : {
              borderColor: alpha(theme.palette.primary.main, 0.3),
              backgroundColor: checked
                ? alpha(theme.palette.primary.main, 0.06)
                : alpha(theme.palette.text.primary, 0.03)
            }
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component='span'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            color: disabled ? 'text.disabled' : 'text.primary',
            display: 'block',
            fontWeight: 500
          }}
        >
          {label}
        </Typography>
        {description && (
          <Typography
            component='span'
            sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'text.disabled', display: 'block', mt: 0.125 }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <Switch
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        size='small'
        sx={{ flexShrink: 0, ml: 'auto' }}
      />
    </Box>
  )
}
