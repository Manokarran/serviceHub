'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import { IconPicker } from '@/components/IconPicker'
import { DEFAULT_LOGO_ICON_STYLE, type IconPickerStyle } from '@/components/iconPickerStyle'
import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { builderSoftCardSx } from '../../../constants/builderChrome'
import type { HeaderLayout, LogoPosition, NavLinkItem } from '../../../types'
import { normalizeNavLinks } from '../../../utils/blockMigration'
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
  const safeLinks = normalizeNavLinks(links)

  const updateLink = (index: number, changes: Partial<NavLinkItem>) => {
    onChange(safeLinks.map((link, i) => (i === index ? { ...link, ...changes } : link)))
  }

  const removeLink = (index: number) => onChange(safeLinks.filter((_, i) => i !== index))
  const addLink = () => onChange([...safeLinks, { label: 'New link', href: '#' }])
  const addChildLink = (index: number) =>
    onChange(
      safeLinks.map((link, i) =>
        i === index
          ? {
              ...link,
              children: [...(link.children ?? []), { label: 'New child link', href: '#' }]
            }
          : link
      )
    )
  const updateChildLink = (index: number, childIndex: number, changes: Partial<NavLinkItem>) =>
    onChange(
      safeLinks.map((link, i) =>
        i === index
          ? {
              ...link,
              children: (link.children ?? []).map((child, ci) => (ci === childIndex ? { ...child, ...changes } : child))
            }
          : link
      )
    )
  const removeChildLink = (index: number, childIndex: number) =>
    onChange(
      safeLinks.map((link, i) =>
        i === index
          ? {
              ...link,
              children: (link.children ?? []).filter((_, ci) => ci !== childIndex)
            }
          : link
      )
    )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {safeLinks.map((link, index) => (
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
                disabled={safeLinks.length <= 1}
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
              value={link.href ?? ''}
              onChange={href => updateLink(index, { href })}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 1 }}>
              <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
                Child items
              </Typography>
              {(link.children ?? []).map((child, childIndex) => (
                <Box
                  key={`${index}-child-${childIndex}`}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    p: 1,
                    borderRadius: 1,
                    border: `1px dashed ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
                      Child {childIndex + 1}
                    </Typography>
                    <IconButton
                      size='small'
                      onClick={() => removeChildLink(index, childIndex)}
                      aria-label='Remove child link'
                      sx={{ width: 22, height: 22, color: 'text.secondary' }}
                    >
                      <i className='ri-close-line' style={{ fontSize: '0.75rem' }} />
                    </IconButton>
                  </Box>
                  <PropertyTextField
                    label='Label'
                    value={child.label}
                    onChange={label => updateChildLink(index, childIndex, { label })}
                    placeholder='Sub item'
                  />
                  <PageLinkField
                    label='Link'
                    value={child.href ?? ''}
                    onChange={href => updateChildLink(index, childIndex, { href })}
                  />
                </Box>
              ))}
              <CompactButton
                startIcon={<i className='ri-add-line' style={{ fontSize: '0.8rem' }} />}
                onClick={() => addChildLink(index)}
              >
                Add child item
              </CompactButton>
            </Box>
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
  logoIcon?: string
  logoIconColor?: string
  logoIconSize?: number
  logoIconShowBackground?: boolean
  logoIconBackgroundColor?: string
  logoIconBorderRadius?: number
  navLinks: NavLinkItem[]
  onUpdate: (changes: {
    logoText?: string
    logoUrl?: string
    logoIcon?: string
    logoIconColor?: string
    logoIconSize?: number
    logoIconShowBackground?: boolean
    logoIconBackgroundColor?: string
    logoIconBorderRadius?: number
    navLinks?: NavLinkItem[]
  }) => void
}

function toLogoIconStyle(props: BrandingProps): IconPickerStyle {
  return {
    color: props.logoIconColor ?? DEFAULT_LOGO_ICON_STYLE.color,
    size: props.logoIconSize ?? DEFAULT_LOGO_ICON_STYLE.size,
    showBackground: props.logoIconShowBackground ?? DEFAULT_LOGO_ICON_STYLE.showBackground,
    backgroundColor: props.logoIconBackgroundColor ?? DEFAULT_LOGO_ICON_STYLE.backgroundColor,
    borderRadius: props.logoIconBorderRadius ?? DEFAULT_LOGO_ICON_STYLE.borderRadius
  }
}

function fromLogoIconStyle(style: IconPickerStyle): Pick<
  BrandingProps,
  'logoIconColor' | 'logoIconSize' | 'logoIconShowBackground' | 'logoIconBackgroundColor' | 'logoIconBorderRadius'
> {
  return {
    logoIconColor: style.color,
    logoIconSize: style.size,
    logoIconShowBackground: style.showBackground,
    logoIconBackgroundColor: style.backgroundColor,
    logoIconBorderRadius: style.borderRadius
  }
}

export function ChromeBlockBrandingFields({
  logoText,
  logoUrl,
  logoIcon,
  logoIconColor,
  logoIconSize,
  logoIconShowBackground,
  logoIconBackgroundColor,
  logoIconBorderRadius,
  navLinks,
  onUpdate
}: BrandingProps) {
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
        <IconPicker
          label='Logo icon'
          value={logoIcon ?? null}
          allowClear
          showStyleControls
          style={toLogoIconStyle({
            logoText,
            logoUrl,
            logoIcon,
            logoIconColor,
            logoIconSize,
            logoIconShowBackground,
            logoIconBackgroundColor,
            logoIconBorderRadius,
            navLinks,
            onUpdate
          })}
          onChange={icon => onUpdate({ logoIcon: icon ?? '' })}
          onStyleChange={style => onUpdate(fromLogoIconStyle(style))}
        />
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'text.disabled', m: 0, mt: -0.5 }}>
          Used when no logo image is uploaded. Image takes priority when both are set.
        </Typography>
      </PropertySection>
      <PropertySection title='Navigation' collapsible defaultOpen>
        <NavLinksEditor links={navLinks ?? []} onChange={navLinks => onUpdate({ navLinks })} />
      </PropertySection>
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
