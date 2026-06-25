'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputBase from '@mui/material/InputBase'
import Popover from '@mui/material/Popover'
import Slider from '@mui/material/Slider'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import { alpha, useTheme } from '@mui/material/styles'
import { Block, Search } from '@mui/icons-material'

import { BUILDER_TYPOGRAPHY } from '@/features/your-space/constants/builderLayout'
import {
  DEFAULT_ICON_PICKER_STYLE,
  type IconPickerStyle
} from '@/components/iconPickerStyle'
import {
  getItServiceIcon,
  IT_SERVICE_ICONS,
  type ItServiceIconName,
  type ServiceIconCategory
} from '@/components/itServiceIcons'

const ICON_CATEGORY_FILTERS: { id: ServiceIconCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'security', label: 'Security' },
  { id: 'development', label: 'Dev' },
  { id: 'data', label: 'Data' },
  { id: 'network', label: 'Network' },
  { id: 'devices', label: 'Devices' },
  { id: 'business', label: 'Business' },
  { id: 'communication', label: 'Comms' },
  { id: 'ai', label: 'AI' }
]

export type { ItServiceIconName, IconPickerStyle }
export { DEFAULT_ICON_PICKER_STYLE, getItServiceIcon, IT_SERVICE_ICONS }

const PAGE_SIZE = 48

export function isRemixIconClass(icon?: string | null): boolean {
  return Boolean(icon?.startsWith('ri-'))
}

export function ItServiceIcon({ name, ...props }: SvgIconProps & { name: string }) {
  const Icon = getItServiceIcon(name)

  if (!Icon) {
    return null
  }

  return <Icon {...props} />
}

export function ServiceIconGraphic({
  icon,
  fontSize,
  sx,
  color = 'inherit'
}: {
  icon?: string | null
  fontSize?: string | number
  sx?: SvgIconProps['sx']
  color?: string
}) {
  if (!icon) {
    return null
  }

  if (isRemixIconClass(icon)) {
    return (
      <Box
        component='i'
        className={icon}
        sx={{
          fontSize: fontSize ?? '1rem',
          color,
          flexShrink: 0,
          lineHeight: 1,
          display: 'inline-block'
        }}
      />
    )
  }

  return <ItServiceIcon name={icon} sx={{ fontSize: fontSize ?? '1rem', color, flexShrink: 0, ...sx }} />
}

function IconPreviewTile({
  iconName,
  style,
  size = 36
}: {
  iconName: string | null | undefined
  style?: IconPickerStyle
  size?: number
}) {
  const theme = useTheme()
  const Icon = getItServiceIcon(iconName)
  const resolved = style ?? DEFAULT_ICON_PICKER_STYLE
  const iconSize = Math.max(16, Math.round(resolved.size * (size / 44)))

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${resolved.borderRadius}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: resolved.color === 'inherit' ? 'primary.main' : resolved.color,
        backgroundColor: resolved.showBackground
          ? alpha(resolved.backgroundColor === 'inherit' ? theme.palette.primary.main : resolved.backgroundColor, 0.12)
          : alpha(theme.palette.primary.main, 0.08),
        border: resolved.showBackground
          ? `1px solid ${alpha(resolved.backgroundColor === 'inherit' ? theme.palette.primary.main : resolved.backgroundColor, 0.18)}`
          : 'none'
      }}
    >
      {Icon ? <Icon sx={{ fontSize: iconSize }} /> : <Search sx={{ fontSize: iconSize * 0.85, color: 'text.disabled' }} />}
    </Box>
  )
}

function IconPickerStylePanel({
  style,
  onChange,
  mode = 'full'
}: {
  style: IconPickerStyle
  onChange: (style: IconPickerStyle) => void
  mode?: 'full' | 'simple'
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        p: 1.25,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        backgroundColor: alpha(theme.palette.background.default, 0.5)
      }}
    >
      <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>Icon style</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', minWidth: 42 }}>Color</Typography>
        <Box
          component='input'
          type='color'
          value={style.color.startsWith('#') ? style.color : '#6366f1'}
          onChange={e => onChange({ ...style, color: e.target.value })}
          sx={{ width: 32, height: 32, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0, cursor: 'pointer' }}
        />
      </Box>

      <Box>
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', mb: 0.5 }}>
          Size: {style.size}px
        </Typography>
        <Slider
          value={style.size}
          min={mode === 'simple' ? 12 : 20}
          max={mode === 'simple' ? 32 : 72}
          step={mode === 'simple' ? 2 : 4}
          onChange={(_, v) => onChange({ ...style, size: v as number })}
          size='small'
        />
      </Box>

      {mode === 'full' && (
        <>
          <FormControlLabel
            control={
              <Switch
                size='small'
                checked={style.showBackground}
                onChange={e => onChange({ ...style, showBackground: e.target.checked })}
              />
            }
            label={<Typography sx={{ ...BUILDER_TYPOGRAPHY.label }}>Background tile</Typography>}
          />
          {style.showBackground && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', minWidth: 42 }}>Tint</Typography>
                <Box
                  component='input'
                  type='color'
                  value={style.backgroundColor.startsWith('#') ? style.backgroundColor : '#6366f1'}
                  onChange={e => onChange({ ...style, backgroundColor: e.target.value })}
                  sx={{ width: 32, height: 32, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0, cursor: 'pointer' }}
                />
              </Box>
              <Box>
                <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', mb: 0.5 }}>
                  Radius: {style.borderRadius}px
                </Typography>
                <Slider
                  value={style.borderRadius}
                  min={0}
                  max={32}
                  step={2}
                  onChange={(_, v) => onChange({ ...style, borderRadius: v as number })}
                  size='small'
                />
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  )
}

type IconPickerPopoverProps = {
  open: boolean
  anchorEl: HTMLElement | null
  value: string | null | undefined
  allowClear?: boolean
  style?: IconPickerStyle
  onStyleChange?: (style: IconPickerStyle) => void
  showStyleControls?: boolean
  styleMode?: 'full' | 'simple'
  onClose: () => void
  onSelect: (iconName: ItServiceIconName | null) => void
}

function IconPickerPopover({
  open,
  anchorEl,
  value,
  allowClear = false,
  style,
  onStyleChange,
  showStyleControls = false,
  styleMode = 'full',
  onClose,
  onSelect
}: IconPickerPopoverProps) {
  const theme = useTheme()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ServiceIconCategory | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    if (open) {
      setVisibleCount(PAGE_SIZE)
    }
  }, [open, query, category])

  const filteredIcons = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return IT_SERVICE_ICONS.filter(entry => {
      if (category !== 'all' && entry.category !== category) {
        return false
      }

      if (!normalized) {
        return true
      }

      const haystack = [entry.name, ...entry.keywords, entry.category].join(' ').toLowerCase()

      return haystack.includes(normalized)
    })
  }, [query, category])

  const visibleIcons = filteredIcons.slice(0, visibleCount)
  const hasMore = visibleCount < filteredIcons.length

  const handleClose = () => {
    setQuery('')
    setCategory('all')
    onClose()
  }

  const handleSelect = (iconName: ItServiceIconName | null) => {
    onSelect(iconName)
    handleClose()
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            mt: 0.75,
            width: 340,
            maxWidth: 'calc(100vw - 24px)',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.14)}`,
            overflow: 'hidden'
          }
        }
      }}
    >
      <Box sx={{ p: 1.25, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`, display: 'flex', gap: 1, alignItems: 'center' }}>
        <InputBase
          autoFocus
          fullWidth
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder='Search icons…'
          startAdornment={<Search sx={{ fontSize: '1rem', color: 'text.disabled', mr: 1 }} />}
          sx={{
            px: 1,
            py: 0.75,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
            ...BUILDER_TYPOGRAPHY.label,
            '& input': { p: 0 }
          }}
        />
        {allowClear && value && (
          <Box
            component='button'
            type='button'
            onClick={() => handleSelect(null)}
            sx={{
              border: 'none',
              borderRadius: 1,
              px: 1,
              py: 0.5,
              cursor: 'pointer',
              flexShrink: 0,
              ...BUILDER_TYPOGRAPHY.label,
              color: 'text.secondary',
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
              '&:hover': { color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.08) }
            }}
          >
            Clear
          </Box>
        )}
      </Box>

      <Box
        sx={{
          px: 1.25,
          py: 1,
          display: 'flex',
          gap: 0.5,
          overflowX: 'auto',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          '&::-webkit-scrollbar': { height: 4 }
        }}
      >
        {ICON_CATEGORY_FILTERS.map(cat => (
          <Chip
            key={cat.id}
            label={cat.label}
            size='small'
            onClick={() => setCategory(cat.id)}
            sx={{
              flexShrink: 0,
              height: 24,
              ...BUILDER_TYPOGRAPHY.label,
              fontSize: '0.6875rem',
              cursor: 'pointer',
              backgroundColor: category === cat.id ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
              color: category === cat.id ? 'primary.main' : 'text.secondary',
              border: `1px solid ${category === cat.id ? alpha(theme.palette.primary.main, 0.35) : alpha(theme.palette.divider, 0.8)}`
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          p: 1.25,
          maxHeight: 260,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 0.75
        }}
      >
        {visibleIcons.length === 0 ? (
          <Box sx={{ gridColumn: '1 / -1', py: 2, textAlign: 'center' }}>
            <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary' }}>
              No icons match your search
            </Typography>
          </Box>
        ) : (
          visibleIcons.map(entry => {
            const isSelected = entry.name === value
            const { Icon } = entry

            return (
              <Tooltip key={entry.name} title={entry.name} placement='top' arrow>
                <Box
                  component='button'
                  type='button'
                  aria-label={entry.name}
                  aria-pressed={isSelected}
                  onClick={() => handleSelect(entry.name)}
                  sx={{
                    width: '100%',
                    aspectRatio: '1',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    borderRadius: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    p: 0,
                    color: isSelected ? 'primary.main' : 'text.secondary',
                    backgroundColor: isSelected
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.text.primary, 0.03),
                    transition: 'background-color 0.12s, border-color 0.12s, color 0.12s, transform 0.12s',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  <Icon sx={{ fontSize: '1.25rem' }} />
                </Box>
              </Tooltip>
            )
          })
        )}
      </Box>

      {hasMore && (
        <Box sx={{ px: 1.25, pb: 1.25 }}>
          <Box
            component='button'
            type='button'
            onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
            sx={{
              width: '100%',
              py: 0.75,
              border: '1px dashed',
              borderColor: alpha(theme.palette.primary.main, 0.25),
              borderRadius: 1.25,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              ...BUILDER_TYPOGRAPHY.label,
              color: 'primary.main',
              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) }
            }}
          >
            Load more ({filteredIcons.length - visibleCount} remaining)
          </Box>
        </Box>
      )}

      {showStyleControls && style && onStyleChange && (
        <IconPickerStylePanel style={style} onChange={onStyleChange} mode={styleMode} />
      )}
    </Popover>
  )
}

type Props = {
  value: string | null | undefined
  onChange: (iconName: ItServiceIconName | null) => void
  label?: string
  disabled?: boolean
  variant?: 'default' | 'compact'
  allowClear?: boolean
  style?: IconPickerStyle
  onStyleChange?: (style: IconPickerStyle) => void
  showStyleControls?: boolean
  styleMode?: 'full' | 'simple'
}

export function IconPicker({
  value,
  onChange,
  label = 'Icon',
  disabled = false,
  variant = 'default',
  allowClear = false,
  style,
  onStyleChange,
  showStyleControls = false,
  styleMode = 'full'
}: Props) {
  const theme = useTheme()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      return
    }

    setAnchorEl(event.currentTarget)
  }

  const trigger =
    variant === 'compact' ? (
      <Tooltip title={value ? `${value} — click to change` : 'Choose icon'} placement='top' arrow>
        <Box
          component='button'
          type='button'
          disabled={disabled}
          onClick={handleOpen}
          aria-label={value ? `Selected icon: ${value}` : 'Choose icon'}
          aria-haspopup='dialog'
          aria-expanded={open}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            border: '1px dashed',
            borderColor: value ? alpha(theme.palette.primary.main, 0.35) : alpha(theme.palette.divider, 0.5),
            backgroundColor: value ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
            opacity: disabled ? 0.55 : 1,
            overflow: 'hidden',
            p: 0,
            '&:hover': disabled
              ? {}
              : {
                  borderColor: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
          }}
        >
          {value ? (
            (() => {
              const Icon = getItServiceIcon(value)
              const resolved = style ?? DEFAULT_ICON_PICKER_STYLE

              return Icon ? (
                <Icon sx={{ fontSize: resolved.size <= 24 ? resolved.size : 18, color: resolved.color === 'inherit' ? 'primary.main' : resolved.color }} />
              ) : (
                <Block sx={{ fontSize: '0.85rem', color: 'text.disabled' }} />
              )
            })()
          ) : (
            <Block sx={{ fontSize: '0.85rem', color: 'text.disabled' }} />
          )}
        </Box>
      </Tooltip>
    ) : (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary' }}>{label}</Typography>
        <Box
          component='button'
          type='button'
          disabled={disabled}
          onClick={handleOpen}
          aria-label={value ? `Selected icon: ${value}. Click to change.` : 'Choose an icon'}
          aria-haspopup='dialog'
          aria-expanded={open}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            width: '100%',
            px: 1.25,
            py: 1,
            border: '1px solid',
            borderColor: open ? 'primary.main' : alpha(theme.palette.primary.main, 0.14),
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.55 : 1,
            textAlign: 'left',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            boxShadow: open ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}` : 'none',
            '&:hover': disabled
              ? {}
              : {
                  borderColor: alpha(theme.palette.primary.main, 0.24)
                }
          }}
        >
          <IconPreviewTile iconName={value} style={style} size={36} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ ...BUILDER_TYPOGRAPHY.title, m: 0, color: value ? 'text.primary' : 'text.disabled' }} noWrap>
              {value ?? 'Choose icon'}
            </Typography>
            <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, m: 0, color: 'text.disabled', fontWeight: 400 }} noWrap>
              {value ? `${IT_SERVICE_ICONS.length} icons · click to change` : 'Search by name or category'}
            </Typography>
          </Box>

          <i className='ri-arrow-down-s-line' style={{ fontSize: '0.95rem', color: theme.palette.text.secondary, flexShrink: 0 }} />
        </Box>
      </Box>
    )

  return (
    <>
      {trigger as ReactNode}
      <IconPickerPopover
        open={open}
        anchorEl={anchorEl}
        value={value}
        allowClear={allowClear}
        style={style}
        onStyleChange={onStyleChange}
        showStyleControls={showStyleControls}
        styleMode={styleMode}
        onClose={() => setAnchorEl(null)}
        onSelect={onChange}
      />
    </>
  )
}
