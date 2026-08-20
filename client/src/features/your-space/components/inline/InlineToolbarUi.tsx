'use client'

import Box from '@mui/material/Box'
import Popover from '@mui/material/Popover'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import type { MouseEvent } from 'react'

import { BUILDER_TYPOGRAPHY, BUILDER_Z_INDEX } from '../../constants/builderLayout'
import { INLINE_TOOLBAR_GAP_PX } from './useSmartInlineToolbarPlacement'

export function InlineToolbarShell({
  children,
  placement = 'above'
}: {
  children: React.ReactNode
  placement?: 'above' | 'below'
}) {
  const theme = useTheme()

  return (
    <Box
      className='block-inline-toolbar'
      onClick={e => e.stopPropagation()}
      sx={{
        position: 'absolute',
        left: '50%',
        ...(placement === 'below'
          ? {
              top: 'auto',
              bottom: -INLINE_TOOLBAR_GAP_PX,
              transform: 'translate(-50%, 100%)'
            }
          : {
              top: -INLINE_TOOLBAR_GAP_PX,
              bottom: 'auto',
              transform: 'translate(-50%, -100%)'
            }),
        zIndex: BUILDER_Z_INDEX.blockToolbar,
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        px: 0.5,
        py: 0.375,
        borderRadius: 1.25,
        backgroundColor: 'background.paper',
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.12)}, 0 0 0 1px ${alpha(theme.palette.divider, 0.6)}`,
        maxWidth: 'min(100%, calc(100vw - 48px))',
        flexWrap: 'wrap',
        justifyContent: 'center',
        rowGap: 0.375,
        pointerEvents: 'auto'
      }}
    >
      {children}
    </Box>
  )
}

export function InlineToolbarDivider() {
  const theme = useTheme()

  return (
    <Box
      sx={{
        width: '1px',
        height: 20,
        mx: 0.25,
        backgroundColor: alpha(theme.palette.divider, 0.8),
        flexShrink: 0
      }}
    />
  )
}

export function InlineToolbarButton({
  icon,
  label,
  active = false,
  onClick,
  disabled = false
}: {
  icon: string
  label: string
  active?: boolean
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}) {
  const theme = useTheme()

  return (
    <Tooltip title={label} placement='top'>
      <Box
        component='button'
        type='button'
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        sx={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: 0.75,
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
          color: active ? 'primary.main' : 'text.secondary',
          backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          opacity: disabled ? 0.45 : 1,
          transition: 'background-color 0.12s, color 0.12s',
          '&:hover': disabled
            ? undefined
            : {
                color: active ? 'primary.main' : 'text.primary',
                backgroundColor: active
                  ? alpha(theme.palette.primary.main, 0.14)
                  : alpha(theme.palette.text.primary, 0.06)
              }
        }}
      >
        <i className={icon} style={{ fontSize: '0.9rem' }} />
      </Box>
    </Tooltip>
  )
}

export function InlineToolbarLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant='caption'
      sx={{
        ...BUILDER_TYPOGRAPHY.label,
        color: 'text.secondary',
        px: 0.75,
        whiteSpace: 'nowrap',
        flexShrink: 0
      }}
    >
      {children}
    </Typography>
  )
}

export function InlineToolbarPopover({
  open,
  anchorEl,
  onClose,
  title,
  children,
  width = 280
}: {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
}) {
  const theme = useTheme()

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            mt: 0.75,
            width,
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: 1.5,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.14)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`
          }
        }
      }}
      onClick={e => e.stopPropagation()}
    >
      <Box sx={{ p: 1.5 }}>
        <Typography
          component='p'
          sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0, mb: 1.25 }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Popover>
  )
}
