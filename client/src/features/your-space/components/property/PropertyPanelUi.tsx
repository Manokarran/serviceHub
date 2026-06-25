'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Slider from '@mui/material/Slider'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  BUILDER_TYPOGRAPHY,
  builderPanelHeaderSx,
  builderSegmentedControlSx
} from '../../constants/builderLayout'
import { builderHairlineHorizontal, builderSoftCardSx } from '../../constants/builderChrome'

export type PropertyPanelTab = 'design' | 'layout' | 'style'

const PROPERTY_TABS: { id: PropertyPanelTab; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'layout', label: 'Layout' },
  { id: 'style', label: 'Style' }
]

export function PropertyPanelHeader({
  title,
  subtitle,
  icon,
  onClose,
  onDelete,
  deleteLabel = 'Delete block'
}: {
  title: string
  subtitle?: string
  icon?: string
  onClose?: () => void
  onDelete?: () => void
  deleteLabel?: string
}) {
  const theme = useTheme()

  return (
    <Box sx={{ ...builderPanelHeaderSx(theme) }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.primary.main, 0.07)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                color: 'primary.main',
                boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <i className={icon} style={{ fontSize: '0.875rem' }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.title, m: 0 }} noWrap>
              {title}
            </Typography>
            {subtitle && <PropertyPanelSubtitle>{subtitle}</PropertyPanelSubtitle>}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0, mt: -0.25 }}>
          {onDelete && (
            <Tooltip title={deleteLabel} placement='left'>
              <IconButton
                size='small'
                onClick={onDelete}
                aria-label={deleteLabel}
                sx={{ width: 28, height: 28, color: 'text.secondary' }}
              >
                <i className='ri-delete-bin-line' style={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Tooltip>
          )}
          {onClose && (
            <IconButton
              size='small'
              onClick={onClose}
              aria-label='Close panel'
              sx={{ width: 28, height: 28, color: 'text.secondary' }}
            >
              <i className='ri-close-line' style={{ fontSize: '0.95rem' }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export function PropertyPanelTabs({
  value,
  onChange,
  tabs = PROPERTY_TABS
}: {
  value: PropertyPanelTab
  onChange: (tab: PropertyPanelTab) => void
  tabs?: { id: PropertyPanelTab; label: string }[]
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 0,
        px: 2,
        py: 0.875,
        borderBottom: 'none',
        position: 'relative',
        backgroundColor: alpha(theme.palette.primary.main, 0.012),
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: builderHairlineHorizontal(theme),
          pointerEvents: 'none'
        }
      }}
    >
      <Box sx={{ display: 'flex', width: '100%', ...builderSegmentedControlSx(theme) }}>
        {tabs.map(tab => (
          <Box
            key={tab.id}
            component='button'
            type='button'
            onClick={() => onChange(tab.id)}
            sx={{
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              py: 0.5,
              px: 0.875,
              borderRadius: '5px',
              ...BUILDER_TYPOGRAPHY.tab,
              color: value === tab.id ? 'text.primary' : 'text.secondary',
              backgroundColor: value === tab.id ? 'background.paper' : 'transparent',
              boxShadow: value === tab.id
                ? `0 1px 3px ${alpha(theme.palette.common.black, 0.08)}, 0 0 0 1px ${alpha(theme.palette.common.black, 0.05)}`
                : 'none',
              transition: 'background-color 0.15s, color 0.15s, box-shadow 0.15s',
              '&:hover': {
                color: 'text.primary',
                backgroundColor:
                  value === tab.id
                    ? 'background.paper'
                    : alpha(theme.palette.text.primary, 0.05)
              }
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function PropertyFields({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {children}
    </Box>
  )
}

export function PropertySection({
  title,
  children,
  collapsible = false,
  defaultOpen = true
}: {
  title?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}) {
  const theme = useTheme()
  const [open, setOpen] = useState(defaultOpen)

  if (!title) {
    return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>{children}</Box>
  }

  const header = (
    <Box
      component={collapsible ? 'button' : 'div'}
      type={collapsible ? 'button' : undefined}
      onClick={collapsible ? () => setOpen(v => !v) : undefined}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        background: 'none',
        border: 'none',
        p: 0,
        cursor: collapsible ? 'pointer' : 'default',
        userSelect: collapsible ? 'none' : 'auto',
        width: '100%',
        textAlign: 'left'
      }}
    >
      {collapsible && (
        <Box
          component='span'
          sx={{
            display: 'inline-flex',
            flexShrink: 0,
            color: 'text.disabled',
            transition: 'transform 0.15s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)'
          }}
        >
          <i className='ri-arrow-right-s-line' style={{ fontSize: '0.75rem' }} />
        </Box>
      )}
      <Typography
        component='span'
        sx={{
          ...BUILDER_TYPOGRAPHY.sectionLabel,
          color: 'text.disabled',
          m: 0
        }}
      >
        {title}
      </Typography>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
      {header}
      {(!collapsible || open) && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.75,
            ...(collapsible && {
              pl: 0.5,
              borderLeft: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.5),
              ml: 0.25
            })
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  )
}

export function PropertyFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component='p'
      sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0, mb: 0.75 }}
    >
      {children}
    </Typography>
  )
}

export function PropertyPanelSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component='p'
      sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', fontWeight: 400, m: 0, mt: 0.125 }}
    >
      {children}
    </Typography>
  )
}

export function PropertyBodyText({ children }: { children: React.ReactNode }) {
  return (
    <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary', m: 0 }}>
      {children}
    </Typography>
  )
}

type LayoutOption<T extends string> = {
  value: T
  label: string
  icon: string
}

export function LayoutOptionGroup<T extends string>({
  value,
  options,
  onChange
}: {
  value: T
  options: LayoutOption<T>[]
  onChange: (v: T) => void
}) {
  const theme = useTheme()
  const selected = options.find(o => o.value === value)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))',
          gap: 0.5
        }}
      >
        {options.map(option => {
          const isSelected = option.value === value

          return (
            <Tooltip key={option.value} title={option.label} placement='top'>
              <Box
                component='button'
                type='button'
                aria-label={option.label}
                aria-pressed={isSelected}
                onClick={() => onChange(option.value)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.375,
                  py: 0.625,
                  px: 0.5,
                  border: 'none',
                  borderRadius: 1,
                  ...builderSoftCardSx(theme, isSelected),
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  cursor: 'pointer',
                  minWidth: 0
                }}
              >
                <i className={option.icon} style={{ fontSize: '0.95rem' }} />
              </Box>
            </Tooltip>
          )
        })}
      </Box>
      {selected && (
        <Typography
          component='p'
          sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', m: 0, textAlign: 'center' }}
        >
          {selected.label}
        </Typography>
      )}
    </Box>
  )
}

export function CornerRadiusField({
  value,
  onChange,
  max = 48,
  siteDefault,
  onUseSiteDefault
}: {
  value: number | undefined
  onChange: (value: number | undefined) => void
  max?: number
  siteDefault?: number
  onUseSiteDefault?: () => void
}) {
  const effective = value ?? (typeof siteDefault === 'number' && siteDefault > max ? max : siteDefault) ?? 0
  const usingSiteDefault = siteDefault !== undefined && value === undefined

  return (
    <Box>
      <PropertyFieldLabel>
        Corner radius: {effective}px{usingSiteDefault ? ' (site default)' : ''}
      </PropertyFieldLabel>
      <Slider
        value={effective}
        min={0}
        max={max}
        step={2}
        onChange={(_, v) => onChange(v as number)}
      />
      {onUseSiteDefault && value !== undefined && (
        <CompactButton onClick={onUseSiteDefault} variant='text'>
          Use site default
        </CompactButton>
      )}
    </Box>
  )
}

export function CompactButton({
  children,
  onClick,
  startIcon,
  variant = 'outlined'
}: {
  children: React.ReactNode
  onClick?: () => void
  startIcon?: React.ReactNode
  variant?: 'outlined' | 'text'
}) {
  const theme = useTheme()

  return (
    <Box
      component='button'
      type='button'
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        py: 0.5,
        px: 1.125,
        border: 'none',
        borderRadius: 1,
        cursor: 'pointer',
        ...BUILDER_TYPOGRAPHY.action,
        color: 'text.secondary',
        ...(variant === 'outlined' ? builderSoftCardSx(theme) : { backgroundColor: 'transparent' }),
        transition: 'box-shadow 0.12s, color 0.12s',
        '&:hover': {
          color: 'text.primary'
        }
      }}
    >
      {startIcon}
      {children}
    </Box>
  )
}
