'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { builderSoftCardSx } from '../../../constants/builderChrome'
import type { HeaderLayout, LogoPosition, NavLinkItem } from '../../../types'
import { CompactButton, LayoutOptionGroup, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PageLinkField } from '../PageLinkField'
import { MediaSourceField } from '../MediaSourceField'

// ─── Layout options ───────────────────────────────────────────────────────────

type LayoutOption<T extends string> = { value: T; label: string; icon: string }

const HEADER_LAYOUT_OPTIONS: LayoutOption<HeaderLayout>[] = [
  { value: 'horizontal', label: 'Horizontal', icon: 'ri-layout-top-line' },
  { value: 'vertical', label: 'Vertical', icon: 'ri-layout-column-line' }
]

const LOGO_POSITION_OPTIONS: LayoutOption<LogoPosition>[] = [
  { value: 'left', label: 'Left', icon: 'ri-align-left' },
  { value: 'center', label: 'Center', icon: 'ri-align-center' },
  { value: 'right', label: 'Right', icon: 'ri-align-right' }
]

// ─── Nav links editor ─────────────────────────────────────────────────────────

function NavLinksEditor({
  links,
  onChange
}: {
  links: NavLinkItem[]
  onChange: (links: NavLinkItem[]) => void
}) {
  const theme = useTheme()

  const updateLink = (index: number, changes: Partial<NavLinkItem>) => {
    onChange(links.map((link, i) => (i === index ? { ...link, ...changes } : link)))
  }

  const removeLink = (index: number) => onChange(links.filter((_, i) => i !== index))
  const addLink = () => onChange([...links, { label: 'New link', href: '#' }])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
        Navigation links
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {links.map((link, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.875,
              p: 1.25,
              borderRadius: 1,
              ...builderSoftCardSx(theme)
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
                Link {index + 1}
              </Typography>
              <IconButton
                size='small'
                onClick={() => removeLink(index)}
                aria-label='Remove link'
                disabled={links.length <= 1}
                sx={{ width: 24, height: 24, color: 'text.secondary' }}
              >
                <i className='ri-close-line' style={{ fontSize: '0.8125rem' }} />
              </IconButton>
            </Box>
            <PropertyTextField
              label='Label'
              value={link.label}
              onChange={label => updateLink(index, { label })}
              placeholder='About'
            />
            <PageLinkField
              label='Link'
              value={link.href}
              onChange={href => updateLink(index, { href })}
            />
          </Box>
        ))}
      </Box>
      <CompactButton
        startIcon={<i className='ri-add-line' style={{ fontSize: '0.875rem' }} />}
        onClick={addLink}
      >
        Add link
      </CompactButton>
    </Box>
  )
}

// ─── Branding fields (logo image + company name + nav links) ─────────────────

type BrandingProps = {
  logoText: string
  logoUrl: string
  navLinks: NavLinkItem[]
  onUpdate: (changes: { logoText?: string; logoUrl?: string; navLinks?: NavLinkItem[] }) => void
}

export function ChromeBlockBrandingFields({ logoText, logoUrl, navLinks, onUpdate }: BrandingProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Branding' collapsible defaultOpen>
        <PropertyTextField
          label='Company name'
          value={logoText}
          onChange={logoText => onUpdate({ logoText })}
          placeholder='Acme Inc.'
          helperText='Shown on its own or alongside your logo'
        />
        <MediaSourceField
          label='Logo image'
          value={logoUrl}
          onChange={logoUrl => onUpdate({ logoUrl })}
          clearLabel='Remove logo'
        />
      </PropertySection>
      <NavLinksEditor links={navLinks} onChange={navLinks => onUpdate({ navLinks })} />
    </Box>
  )
}

// ─── Structure fields (layout + logo position) ────────────────────────────────

type StructureProps = {
  layout: HeaderLayout
  logoPosition: LogoPosition
  onUpdate: (changes: { layout?: HeaderLayout; logoPosition?: LogoPosition }) => void
}

export function ChromeBlockStructureFields({ layout, logoPosition, onUpdate }: StructureProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Orientation' collapsible defaultOpen>
        <LayoutOptionGroup
          value={layout ?? 'horizontal'}
          options={HEADER_LAYOUT_OPTIONS}
          onChange={layout => onUpdate({ layout })}
        />
      </PropertySection>
      <PropertySection title='Logo position' collapsible defaultOpen>
        <LayoutOptionGroup
          value={logoPosition ?? 'left'}
          options={LOGO_POSITION_OPTIONS}
          onChange={logoPosition => onUpdate({ logoPosition })}
        />
      </PropertySection>
    </Box>
  )
}
