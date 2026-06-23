'use client'

import { useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY, builderSegmentedControlSx } from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'
import { useBuilder } from '../../context/BuilderContext'
import {
  buildPageLink,
  getPageLinkLabel,
  getPagePathLabel,
  parseLinkTarget,
  type LinkTargetType
} from '../../utils/pageLinkHelpers'
import { PropertyTextField } from './PropertyTextField'

type Props = {
  label: string
  value: string
  onChange: (href: string) => void
  placeholder?: string
}

const LINK_TYPE_OPTIONS: { value: LinkTargetType; label: string; icon: string }[] = [
  { value: 'page', label: 'Page', icon: 'ri-pages-line' },
  { value: 'url', label: 'URL', icon: 'ri-link' },
  { value: 'anchor', label: 'Section', icon: 'ri-hashtag' }
]

export function PageLinkField({ label, value, onChange, placeholder }: Props) {
  const theme = useTheme()
  const { tenantSlug, pages } = useBuilder()
  const parsed = useMemo(() => parseLinkTarget(value, pages, tenantSlug), [value, pages, tenantSlug])
  const [linkType, setLinkType] = useState<LinkTargetType>(parsed.type)

  const activeType = linkType

  const handleTypeChange = (type: LinkTargetType) => {
    setLinkType(type)

    if (type === 'page' && pages.length > 0) {
      const home = pages.find(page => page.isHome) ?? pages[0]

      onChange(buildPageLink(tenantSlug, home.slug))
    } else if (type === 'anchor') {
      onChange('#')
    } else if (type === 'url') {
      onChange(value.startsWith('http') ? value : 'https://')
    }
  }

  const previewPath =
    activeType === 'page' && parsed.pageSlug
      ? getPagePathLabel(tenantSlug, parsed.pageSlug)
      : activeType === 'anchor'
        ? 'Same page section'
        : value || 'External link'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
        {label}
      </Typography>

      <Box sx={builderSegmentedControlSx(theme)}>
        <Box sx={{ display: 'flex', width: '100%' }}>
          {LINK_TYPE_OPTIONS.map(option => {
            const active = activeType === option.value

            return (
              <Box
                key={option.value}
                component='button'
                type='button'
                onClick={() => handleTypeChange(option.value)}
                sx={{
                  flex: 1,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  py: 0.5,
                  px: 0.75,
                  borderRadius: 0.75,
                  backgroundColor: active ? 'background.paper' : 'transparent',
                  color: active ? 'text.primary' : 'text.secondary',
                  boxShadow: active
                    ? `0 1px 2px ${alpha(theme.palette.common.black, 0.06)}, 0 0 0 1px ${alpha(theme.palette.common.black, 0.04)}`
                    : 'none',
                  ...BUILDER_TYPOGRAPHY.label,
                  transition: 'all 0.12s',
                  '&:hover': {
                    backgroundColor: active ? 'background.paper' : alpha(theme.palette.text.primary, 0.04)
                  }
                }}
              >
                <i className={option.icon} style={{ fontSize: '0.75rem' }} />
                {option.label}
              </Box>
            )
          })}
        </Box>
      </Box>

      {activeType === 'page' && (
        <Select
          size='small'
          fullWidth
          value={parsed.pageSlug ?? pages[0]?.slug ?? ''}
          onChange={event => onChange(buildPageLink(tenantSlug, event.target.value))}
          displayEmpty
          sx={{ ...BUILDER_TYPOGRAPHY.input, '& .MuiSelect-select': { py: 1 } }}
        >
          {pages.map(page => (
            <MenuItem key={page.slug} value={page.slug} sx={BUILDER_TYPOGRAPHY.input}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i
                  className={page.isHome ? 'ri-home-4-line' : 'ri-file-line'}
                  style={{ fontSize: '0.875rem', opacity: 0.7 }}
                />
                {getPageLinkLabel(page)}
              </Box>
            </MenuItem>
          ))}
        </Select>
      )}

      {activeType === 'url' && (
        <PropertyTextField
          label='URL'
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? 'https://example.com'}
        />
      )}

      {activeType === 'anchor' && (
        <PropertyTextField
          label='Section ID'
          value={value.startsWith('#') ? value.slice(1) : value}
          onChange={sectionId => onChange(sectionId ? `#${sectionId.replace(/^#/, '')}` : '#')}
          placeholder='about'
          helperText='Links to a section on the current page'
        />
      )}

      <Box
        sx={{
          px: 1,
          py: 0.625,
          borderRadius: 1,
          ...builderSoftCardSx(theme),
          display: 'flex',
          alignItems: 'center',
          gap: 0.75
        }}
      >
        <i className='ri-arrow-right-up-line' style={{ fontSize: '0.75rem', opacity: 0.5 }} />
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', m: 0 }} noWrap>
          {previewPath}
        </Typography>
      </Box>
    </Box>
  )
}
