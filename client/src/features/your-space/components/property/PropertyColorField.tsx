'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
  siteDefault?: string
  onUseSiteDefault?: () => void
}

export function PropertyColorField({ label, value, onChange, siteDefault, onUseSiteDefault }: Props) {
  const theme = useTheme()
  const [hexInput, setHexInput] = useState(value)
  const isOverriding = siteDefault !== undefined && value !== siteDefault

  const commitHex = (raw: string) => {
    const normalized = raw.startsWith('#') ? raw : `#${raw}`

    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
      onChange(normalized)
    }
  }

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value

    setHexInput(v)
    onChange(v)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHexInput(e.target.value)
  }

  const handleHexBlur = () => {
    commitHex(hexInput)
    setHexInput(value)
  }

  const currentDisplayValue = hexInput !== value ? hexInput : value

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.625 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          component='label'
          sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', userSelect: 'none' }}
        >
          {label}
        </Typography>
        {onUseSiteDefault && isOverriding && (
          <Typography
            component='button'
            type='button'
            onClick={onUseSiteDefault}
            sx={{
              ...BUILDER_TYPOGRAPHY.label,
              color: 'primary.main',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              p: 0,
              m: 0,
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Reset
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Color swatch / native picker */}
        <Tooltip title='Pick a color' placement='top'>
          <Box
            sx={{
              position: 'relative',
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: 0.875,
              overflow: 'hidden',
              boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.common.black, 0.12)}, inset 0 0 0 2px ${alpha(theme.palette.background.paper, 0.9)}`
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 2,
                borderRadius: 0.5,
                backgroundColor: value,
                pointerEvents: 'none'
              }}
            />
            <Box
              component='input'
              type='color'
              value={value}
              onChange={handleNativeColorChange}
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
            />
          </Box>
        </Tooltip>

        {/* Hex text input */}
        <InputBase
          value={currentDisplayValue}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          inputProps={{ spellCheck: false }}
          sx={{
            flex: 1,
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
              fontFamily: 'monospace',
              letterSpacing: '0.02em'
            }
          }}
        />
      </Box>
    </Box>
  )
}
