'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { PALETTE_ITEMS } from '../constants'
import { HeroLayoutControls } from './HeroLayoutControls'
import { SectionLayoutControls } from './SectionLayoutControls'
import { HERO_LAYOUT_OPTIONS } from '../constants/heroLayout'
import { BUILDER_PROPERTY_PANEL_SX, BUILDER_PROPERTY_PANEL_WIDTH, BUILDER_TYPOGRAPHY } from '../constants/builderLayout'
import { builderFormOutlineSx, builderSidePanelSx, builderSoftCardSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import { useSiteStyles } from './SiteStylesScope'
import { BackgroundOpacityField } from './property/BackgroundOpacityField'
import {
  CompactButton,
  CornerRadiusField,
  LayoutOptionGroup,
  PropertyBodyText,
  PropertyFieldLabel,
  PropertyFields,
  PropertyPanelHeader,
  PropertyPanelTabs,
  PropertySection,
  type PropertyPanelTab
} from './property/PropertyPanelUi'
import type {
  Block,
  ButtonBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeaderLayout,
  HeadingBlockProps,
  HeroBlockProps,
  ImageBlockProps,
  ImageHoverEffect,
  LogoBlockProps,
  LogoPosition,
  NavLinkItem,
  SectionBlockProps,
  SectionBorderStyle,
  SectionSplitStyle,
  SectionLayout,
  TextAlign,
  TextBlockProps,
  VideoBlockProps
} from '../types'
import { getBlockLabel } from './blocks/BlockRenderer'
import BackgroundPicker from '@/components/builder/BackgroundPicker'
import { MediaSourceField } from './property/MediaSourceField'
import { SECTION_BORDER_OPTIONS, SECTION_SPLIT_STYLE_OPTIONS } from '../utils/sectionStyleHelpers'
import { getBlockBackground } from '../utils/sectionStyleHelpers'
import { getButtonBorderRadius, mapBlockVariantToButtonRole } from '../utils/siteStylesHelpers'
import { getVideoSourceLabel, isEmbedVideoUrl, parseVideoUrl } from '../utils/videoUrlHelpers'

const FIELD_SX = {
  '& .MuiInputBase-root': { borderRadius: 1 }
}

function getBlockIcon(type: Block['type']): string {
  return PALETTE_ITEMS.find(item => item.type === type)?.icon ?? 'ri-layout-grid-line'
}

function getBlockTabs(type: Block['type']): PropertyPanelTab[] {
  if (type === 'heading' || type === 'text' || type === 'button') {
    return ['design', 'style']
  }

  if (type === 'image' || type === 'video' || type === 'logo') {
    return ['design', 'layout', 'style']
  }

  if (type === 'section') {
    return ['layout', 'style']
  }

  return ['design', 'layout', 'style']
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <TextField
        label={label}
        size='small'
        fullWidth
        value={value}
        onChange={e => onChange(e.target.value)}
        sx={FIELD_SX}
      />
      <Box
        component='input'
        type='color'
        value={value}
        onChange={e => onChange(e.target.value)}
        sx={{
          width: 32,
          height: 32,
          border: 'none',
          borderRadius: 0.75,
          cursor: 'pointer',
          flexShrink: 0,
          p: 0,
          boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`
        }}
      />
    </Box>
  )
}

function AlignSelect({ value, onChange }: { value: TextAlign; onChange: (v: TextAlign) => void }) {
  return (
    <FormControl size='small' fullWidth>
      <InputLabel>Alignment</InputLabel>
      <Select label='Alignment' value={value} onChange={e => onChange(e.target.value as TextAlign)}>
        <MenuItem value='left'>Left</MenuItem>
        <MenuItem value='center'>Center</MenuItem>
        <MenuItem value='right'>Right</MenuItem>
      </Select>
    </FormControl>
  )
}

type LayoutOption<T extends string> = {
  value: T
  label: string
  icon: string
}

function NavLinksEditor({ links, onChange }: { links: NavLinkItem[]; onChange: (links: NavLinkItem[]) => void }) {
  const theme = useTheme()
  const updateLink = (index: number, changes: Partial<NavLinkItem>) => {
    onChange(links.map((link, i) => (i === index ? { ...link, ...changes } : link)))
  }

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index))
  }

  const addLink = () => {
    onChange([...links, { label: 'New link', href: '#' }])
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0.5 }}>
      {links.map((link, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            p: 1.75,
            ...builderSoftCardSx(theme)
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
            <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
              Link {index + 1}
            </Typography>
            <IconButton
              size='small'
              onClick={() => removeLink(index)}
              aria-label='Remove link'
              disabled={links.length <= 1}
              sx={{ width: 28, height: 28, color: 'text.secondary' }}
            >
              <i className='ri-delete-bin-line' style={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Box>
          <TextField
            label='Label'
            size='small'
            fullWidth
            value={link.label}
            onChange={e => updateLink(index, { label: e.target.value })}
            sx={FIELD_SX}
          />
          <TextField
            label='URL'
            size='small'
            fullWidth
            value={link.href}
            placeholder='/page or #section'
            onChange={e => updateLink(index, { href: e.target.value })}
            sx={FIELD_SX}
          />
        </Box>
      ))}
      <CompactButton startIcon={<i className='ri-add-line' style={{ fontSize: '0.875rem' }} />} onClick={addLink}>
        Add link
      </CompactButton>
    </Box>
  )
}

const HEADER_LAYOUT_OPTIONS: LayoutOption<HeaderLayout>[] = [
  { value: 'horizontal', label: 'Horizontal', icon: 'ri-layout-top-line' },
  { value: 'vertical', label: 'Vertical', icon: 'ri-layout-column-line' }
]

const LOGO_POSITION_OPTIONS: LayoutOption<LogoPosition>[] = [
  { value: 'left', label: 'Left', icon: 'ri-align-left' },
  { value: 'center', label: 'Center', icon: 'ri-align-center' },
  { value: 'right', label: 'Right', icon: 'ri-align-right' }
]

const IMAGE_HOVER_OPTIONS: LayoutOption<ImageHoverEffect>[] = [
  { value: 'none', label: 'None', icon: 'ri-forbid-line' },
  { value: 'zoom', label: 'Zoom', icon: 'ri-zoom-in-line' },
  { value: 'fade', label: 'Fade', icon: 'ri-contrast-drop-2-line' }
]

const SECTION_SPLIT_STYLE_OPTIONS_TYPED: LayoutOption<SectionSplitStyle>[] = SECTION_SPLIT_STYLE_OPTIONS

const SECTION_BORDER_OPTIONS_TYPED: LayoutOption<SectionBorderStyle>[] = SECTION_BORDER_OPTIONS

function FixedToggle({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <FormControlLabel
      control={<Switch checked={checked} onChange={event => onChange(event.target.checked)} size='small' />}
      label={label}
      sx={{ mx: 0, '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' } }}
    />
  )
}

function ChromeBlockDesignFields({
  logoText,
  logoUrl,
  navLinks,
  onUpdate
}: {
  logoText: string
  logoUrl: string
  navLinks: NavLinkItem[]
  onUpdate: (changes: { logoText?: string; logoUrl?: string; navLinks?: NavLinkItem[] }) => void
}) {
  return (
    <PropertyFields>
      <TextField
        label='Company name'
        size='small'
        fullWidth
        value={logoText}
        onChange={e => onUpdate({ logoText: e.target.value })}
        helperText='Shown on its own or alongside your logo image'
        sx={FIELD_SX}
      />
      <MediaSourceField
        label='Logo image'
        value={logoUrl}
        onChange={url => onUpdate({ logoUrl: url })}
        clearLabel='Remove logo'
      />
      <NavLinksEditor links={navLinks} onChange={navLinks => onUpdate({ navLinks })} />
    </PropertyFields>
  )
}

function ChromeBlockLayoutFields({
  layout,
  logoPosition,
  fixed,
  fixedLabel,
  onUpdate
}: {
  layout: HeaderLayout
  logoPosition: LogoPosition
  fixed: boolean
  fixedLabel: string
  onUpdate: (changes: { layout?: HeaderLayout; logoPosition?: LogoPosition; fixed?: boolean }) => void
}) {
  return (
    <PropertyFields>
      <LayoutOptionGroup value={layout ?? 'horizontal'} options={HEADER_LAYOUT_OPTIONS} onChange={layout => onUpdate({ layout })} />
      <PropertySection title='Logo position' collapsible defaultOpen>
        <LayoutOptionGroup value={logoPosition ?? 'left'} options={LOGO_POSITION_OPTIONS} onChange={logoPosition => onUpdate({ logoPosition })} />
      </PropertySection>
      <FixedToggle label={fixedLabel} checked={fixed} onChange={fixed => onUpdate({ fixed })} />
    </PropertyFields>
  )
}

function BlockProperties({ block, activeTab }: { block: Block; activeTab: PropertyPanelTab }) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()

  switch (block.type) {
    case 'header': {
      const props = block.props as HeaderBlockProps
      const update = (changes: Partial<HeaderBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <ChromeBlockDesignFields
            logoText={props.logoText}
            logoUrl={props.logoUrl ?? ''}
            navLinks={props.navLinks}
            onUpdate={update}
          />
        )
      }

      if (activeTab === 'layout') {
        return (
          <ChromeBlockLayoutFields
            layout={props.layout}
            logoPosition={props.logoPosition ?? 'left'}
            fixed={props.fixed ?? false}
            fixedLabel='Fix header to top while scrolling'
            onUpdate={update}
          />
        )
      }

      return (
        <PropertyFields>
          <ColorField label='Background' value={props.backgroundColor} onChange={v => update({ backgroundColor: v })} />
          <BackgroundOpacityField
            value={props.backgroundOpacity ?? 0}
            onChange={backgroundOpacity => update({ backgroundOpacity })}
          />
          <ColorField label='Text color' value={props.textColor} onChange={v => update({ textColor: v })} />
          <CornerRadiusField
            value={props.borderRadius}
            onChange={borderRadius => update({ borderRadius: borderRadius ?? 0 })}
            max={32}
          />
        </PropertyFields>
      )
    }
    case 'footer': {
      const props = block.props as FooterBlockProps
      const update = (changes: Partial<FooterBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <>
            <ChromeBlockDesignFields
              logoText={props.logoText}
              logoUrl={props.logoUrl ?? ''}
              navLinks={props.navLinks}
              onUpdate={update}
            />
            <PropertyFields>
              <TextField
                label='Copyright text'
                size='small'
                fullWidth
                multiline
                rows={2}
                value={props.copyrightText}
                onChange={e => update({ copyrightText: e.target.value })}
                sx={FIELD_SX}
              />
            </PropertyFields>
          </>
        )
      }

      if (activeTab === 'layout') {
        return (
          <ChromeBlockLayoutFields
            layout={props.layout}
            logoPosition={props.logoPosition ?? 'left'}
            fixed={props.fixed ?? false}
            fixedLabel='Fix footer to bottom while scrolling'
            onUpdate={update}
          />
        )
      }

      return (
        <PropertyFields>
          <ColorField label='Background' value={props.backgroundColor} onChange={v => update({ backgroundColor: v })} />
          <BackgroundOpacityField
            value={props.backgroundOpacity ?? 100}
            onChange={backgroundOpacity => update({ backgroundOpacity })}
          />
          <ColorField label='Text color' value={props.textColor} onChange={v => update({ textColor: v })} />
          <CornerRadiusField
            value={props.borderRadius}
            onChange={borderRadius => update({ borderRadius: borderRadius ?? 0 })}
            max={32}
          />
        </PropertyFields>
      )
    }
    case 'hero': {
      const props = block.props as HeroBlockProps
      const update = (changes: Partial<HeroBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <PropertyFields>
            <TextField label='Title' size='small' fullWidth value={props.title} onChange={e => update({ title: e.target.value })} sx={FIELD_SX} />
            <TextField
              label='Subtitle'
              size='small'
              fullWidth
              multiline
              rows={2}
              value={props.subtitle}
              onChange={e => update({ subtitle: e.target.value })}
              sx={FIELD_SX}
            />
            <TextField label='Button text' size='small' fullWidth value={props.buttonText} onChange={e => update({ buttonText: e.target.value })} sx={FIELD_SX} />
            <TextField label='Button link' size='small' fullWidth value={props.buttonLink} onChange={e => update({ buttonLink: e.target.value })} sx={FIELD_SX} />
          </PropertyFields>
        )
      }

      if (activeTab === 'layout') {
        return (
          <PropertyFields>
            <HeroLayoutControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <BackgroundPicker
            value={getBlockBackground(props, '#6366f1')}
            backgroundType={props.backgroundType ?? 'color'}
            sectionType={block.type}
            photoOpacity={props.backgroundPhotoOpacity ?? 100}
            photoAnimation={props.backgroundPhotoAnimation}
            defaultPhotoAnimation={siteStyles.misc.imageHoverEffect}
            onStyleChange={(key, nextValue) => {
              if (key === 'backgroundType') {
                update({ backgroundType: nextValue as HeroBlockProps['backgroundType'] })
              } else if (key === 'background') {
                update({ background: nextValue })
              } else if (key === 'backgroundPhotoOpacity') {
                update({ backgroundPhotoOpacity: Number(nextValue) })
              } else if (key === 'backgroundPhotoAnimation') {
                update({ backgroundPhotoAnimation: nextValue as HeroBlockProps['backgroundPhotoAnimation'] })
              }
            }}
          />
          <BackgroundOpacityField
            value={props.backgroundOpacity ?? 0}
            onChange={backgroundOpacity => update({ backgroundOpacity })}
          />
          <ColorField label='Text color' value={props.textColor} onChange={v => update({ textColor: v })} />
        </PropertyFields>
      )
    }
    case 'section': {
      const props = block.props as SectionBlockProps
      const update = (changes: Partial<SectionBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'layout') {
        return (
          <PropertyFields>
            <SectionLayoutControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <BackgroundPicker
            value={getBlockBackground(props)}
            backgroundType={props.backgroundType ?? 'color'}
            sectionType={block.type}
            photoOpacity={props.backgroundPhotoOpacity ?? 100}
            photoAnimation={props.backgroundPhotoAnimation}
            defaultPhotoAnimation={siteStyles.misc.imageHoverEffect}
            onStyleChange={(key, nextValue) => {
              if (key === 'backgroundType') {
                update({ backgroundType: nextValue as SectionBlockProps['backgroundType'] })
              } else if (key === 'background') {
                update({ background: nextValue })
              } else if (key === 'backgroundPhotoOpacity') {
                update({ backgroundPhotoOpacity: Number(nextValue) })
              } else if (key === 'backgroundPhotoAnimation') {
                update({ backgroundPhotoAnimation: nextValue as SectionBlockProps['backgroundPhotoAnimation'] })
              }
            }}
          />
          <BackgroundOpacityField
            value={props.backgroundOpacity ?? 100}
            onChange={backgroundOpacity => update({ backgroundOpacity })}
          />
          <CornerRadiusField
            value={props.borderRadius}
            onChange={borderRadius => update({ borderRadius: borderRadius ?? 0 })}
            max={48}
          />
          <PropertySection title='Border & frame' collapsible defaultOpen={false}>
            <LayoutOptionGroup
              value={props.borderStyle ?? 'none'}
              options={SECTION_BORDER_OPTIONS_TYPED}
              onChange={borderStyle => update({ borderStyle })}
            />
            {(props.borderStyle === 'outline' || props.borderStyle === 'subtle' || props.borderStyle === 'elevated' || props.borderStyle === 'inset') && (
              <>
                {props.borderStyle === 'outline' && (
                  <>
                    <Box>
                      <PropertyFieldLabel>Border width: {props.borderWidth ?? 1}px</PropertyFieldLabel>
                      <Slider value={props.borderWidth ?? 1} min={1} max={4} step={1} onChange={(_, v) => update({ borderWidth: v as number })} />
                    </Box>
                    <ColorField label='Border color' value={props.borderColor ?? '#e2e8f0'} onChange={v => update({ borderColor: v })} />
                  </>
                )}
              </>
            )}
          </PropertySection>
        </PropertyFields>
      )
    }
    case 'heading': {
      const props = block.props as HeadingBlockProps
      const update = (changes: Partial<HeadingBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <PropertyFields>
            <TextField label='Text' size='small' fullWidth value={props.text} onChange={e => update({ text: e.target.value })} sx={FIELD_SX} />
            <FormControl size='small' fullWidth>
              <InputLabel>Level</InputLabel>
              <Select label='Level' value={props.level} onChange={e => update({ level: e.target.value as 1 | 2 | 3 })}>
                <MenuItem value={1}>H1 — Large</MenuItem>
                <MenuItem value={2}>H2 — Medium</MenuItem>
                <MenuItem value={3}>H3 — Small</MenuItem>
              </Select>
            </FormControl>
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <AlignSelect value={props.alignment} onChange={v => update({ alignment: v })} />
          <ColorField label='Color' value={props.color} onChange={v => update({ color: v })} />
        </PropertyFields>
      )
    }
    case 'text': {
      const props = block.props as TextBlockProps
      const update = (changes: Partial<TextBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <PropertyFields>
            <TextField
              label='Content'
              size='small'
              fullWidth
              multiline
              rows={4}
              value={props.text}
              onChange={e => update({ text: e.target.value })}
              sx={FIELD_SX}
            />
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <AlignSelect value={props.alignment} onChange={v => update({ alignment: v })} />
          <ColorField label='Color' value={props.color} onChange={v => update({ color: v })} />
        </PropertyFields>
      )
    }
    case 'button': {
      const props = block.props as ButtonBlockProps
      const update = (changes: Partial<ButtonBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <PropertyFields>
            <TextField label='Text' size='small' fullWidth value={props.text} onChange={e => update({ text: e.target.value })} sx={FIELD_SX} />
            <TextField label='Link' size='small' fullWidth value={props.link} onChange={e => update({ link: e.target.value })} sx={FIELD_SX} />
            <FormControl size='small' fullWidth>
              <InputLabel>Style</InputLabel>
              <Select label='Style' value={props.variant} onChange={e => update({ variant: e.target.value as ButtonBlockProps['variant'] })}>
                <MenuItem value='contained'>Filled</MenuItem>
                <MenuItem value='outlined'>Outlined</MenuItem>
                <MenuItem value='text'>Text only</MenuItem>
              </Select>
            </FormControl>
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <AlignSelect value={props.alignment} onChange={v => update({ alignment: v })} />
          <ColorField label='Color' value={props.color} onChange={v => update({ color: v })} />
          <CornerRadiusField
            value={props.borderRadius}
            siteDefault={getButtonBorderRadius(siteStyles.buttons[mapBlockVariantToButtonRole(props.variant)].shape) as number}
            onChange={borderRadius => update({ borderRadius })}
            onUseSiteDefault={() => update({ borderRadius: undefined })}
            max={48}
          />
        </PropertyFields>
      )
    }
    case 'image': {
      const props = block.props as ImageBlockProps
      const update = (changes: Partial<ImageBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <PropertyFields>
            <MediaSourceField label='Image' value={props.src} onChange={src => update({ src })} />
            <TextField label='Alt text' size='small' fullWidth value={props.alt} onChange={e => update({ alt: e.target.value })} sx={FIELD_SX} />
          </PropertyFields>
        )
      }

      if (activeTab === 'layout') {
        return (
          <PropertyFields>
            <AlignSelect value={props.alignment} onChange={v => update({ alignment: v })} />
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <PropertyFieldLabel>Hover effect</PropertyFieldLabel>
          <LayoutOptionGroup
            value={props.hoverEffect ?? siteStyles.misc.imageHoverEffect}
            options={IMAGE_HOVER_OPTIONS}
            onChange={hoverEffect => update({ hoverEffect })}
          />
          <CornerRadiusField
            value={props.borderRadius}
            siteDefault={siteStyles.misc.imageCornerRadius}
            onChange={borderRadius => update({ borderRadius })}
            onUseSiteDefault={() => update({ borderRadius: undefined })}
          />
        </PropertyFields>
      )
    }
    case 'video': {
      const props = block.props as VideoBlockProps
      const update = (changes: Partial<VideoBlockProps>) => updateBlock(block.id, changes)
      const parsedVideo = parseVideoUrl(props.src)
      const embedLabel = getVideoSourceLabel(parsedVideo.type)
      const isEmbed = isEmbedVideoUrl(props.src)

      if (activeTab === 'design') {
        return (
          <PropertyFields>
            <MediaSourceField
              label='Video'
              value={props.src}
              onChange={src => update({ src })}
              acceptVideo
              urlPlaceholder='Upload, paste a file URL, or YouTube/Vimeo link'
            />
            {embedLabel && (
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary' }}>
                {embedLabel} embed detected
              </Typography>
            )}
            <FixedToggle label='Show controls' checked={props.controls} onChange={controls => update({ controls })} />
            <FixedToggle
              label='Autoplay'
              checked={props.autoplay}
              onChange={autoplay => update({ autoplay, ...(autoplay ? { muted: true } : {}) })}
            />
            {!isEmbed || !props.autoplay ? (
              <FixedToggle label='Muted' checked={props.muted} onChange={muted => update({ muted })} />
            ) : (
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary' }}>
                Muted is required when autoplay is enabled for embeds.
              </Typography>
            )}
            <FixedToggle label='Loop' checked={props.loop} onChange={loop => update({ loop })} />
          </PropertyFields>
        )
      }

      if (activeTab === 'layout') {
        return (
          <PropertyFields>
            <AlignSelect value={props.alignment} onChange={v => update({ alignment: v })} />
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <CornerRadiusField
            value={props.borderRadius}
            siteDefault={siteStyles.misc.imageCornerRadius}
            onChange={borderRadius => update({ borderRadius })}
            onUseSiteDefault={() => update({ borderRadius: undefined })}
          />
        </PropertyFields>
      )
    }
    case 'logo': {
      const props = block.props as LogoBlockProps
      const update = (changes: Partial<LogoBlockProps>) => updateBlock(block.id, changes)

      if (activeTab === 'design') {
        return (
          <PropertyFields>
            <MediaSourceField label='Logo image' value={props.src} onChange={src => update({ src })} />
            <TextField label='Alt text' size='small' fullWidth value={props.alt} onChange={e => update({ alt: e.target.value })} sx={FIELD_SX} />
            <TextField label='Link URL' size='small' fullWidth value={props.link} onChange={e => update({ link: e.target.value })} sx={FIELD_SX} />
          </PropertyFields>
        )
      }

      if (activeTab === 'layout') {
        return (
          <PropertyFields>
            <AlignSelect value={props.alignment} onChange={v => update({ alignment: v })} />
            <Box>
              <PropertyFieldLabel>Max height: {props.maxHeight}px</PropertyFieldLabel>
              <Slider value={props.maxHeight} min={24} max={120} step={4} onChange={(_, v) => update({ maxHeight: v as number })} />
            </Box>
          </PropertyFields>
        )
      }

      return (
        <PropertyFields>
          <PropertyBodyText>Logo sizing uses max height; width scales automatically.</PropertyBodyText>
        </PropertyFields>
      )
    }
    default:
      return null
  }
}

function EmptyState() {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, p: 2.5, textAlign: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.text.primary, 0.04),
          color: 'text.secondary'
        }}
      >
        <i className='ri-cursor-line' style={{ fontSize: '1.1rem' }} />
      </Box>
      <PropertyBodyText>Select a block on the canvas to edit its properties.</PropertyBodyText>
    </Box>
  )
}

type PropertyContentProps = {
  onClose?: () => void
  focusTab?: PropertyPanelTab | null
  onFocusTabConsumed?: () => void
}

export function PropertyPanelContent({ onClose, focusTab, onFocusTabConsumed }: PropertyContentProps) {
  const theme = useTheme()
  const { selectedBlock, mode } = useBuilder()
  const [activeTab, setActiveTab] = useState<PropertyPanelTab>('design')

  const availableTabs = useMemo(
    () => (selectedBlock ? getBlockTabs(selectedBlock.type) : []),
    [selectedBlock]
  )

  const tabItems = useMemo(
    () =>
      availableTabs.map(id => ({
        id,
        label: id === 'design' ? 'Design' : id === 'layout' ? 'Layout' : 'Style'
      })),
    [availableTabs]
  )

  useEffect(() => {
    if (availableTabs.length > 0) {
      setActiveTab(current => (availableTabs.includes(current) ? current : availableTabs[0]))
    }
  }, [selectedBlock?.id, availableTabs])

  useEffect(() => {
    if (!focusTab || !availableTabs.includes(focusTab)) {
      return
    }

    setActiveTab(focusTab)
    onFocusTabConsumed?.()
  }, [focusTab, availableTabs, onFocusTabConsumed])

  if (mode === 'preview') {
    return (
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <PropertyBodyText>Switch to Edit mode to customize blocks</PropertyBodyText>
      </Box>
    )
  }

  return (
    <>
      <PropertyPanelHeader
        title={selectedBlock ? getBlockLabel(selectedBlock.type) : 'Properties'}
        subtitle={selectedBlock ? 'Block settings' : 'Nothing selected'}
        icon={selectedBlock ? getBlockIcon(selectedBlock.type) : undefined}
        onClose={onClose}
      />
      {selectedBlock && tabItems.length > 0 && (
        <PropertyPanelTabs value={activeTab} onChange={setActiveTab} tabs={tabItems} />
      )}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          pb: 2.5,
          display: 'flex',
          flexDirection: 'column',
          ...BUILDER_PROPERTY_PANEL_SX,
          ...builderFormOutlineSx(theme)
        }}
      >
        {selectedBlock ? <BlockProperties block={selectedBlock} activeTab={activeTab} /> : <EmptyState />}
      </Box>
    </>
  )
}

type Props = {
  open: boolean
  onClose: () => void
  onOpen: () => void
  focusTab?: PropertyPanelTab | null
  onFocusTabConsumed?: () => void
}

export function PropertyPanel({ open, onClose, onOpen, focusTab, onFocusTabConsumed }: Props) {
  const theme = useTheme()
  const { mode } = useBuilder()

  if (!open) {
    return (
      <Box
        sx={{
          width: 40,
          flexShrink: 0,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          pt: 1.5,
          ...builderSidePanelSx(theme, 'left')
        }}
      >
        <Tooltip title='Block properties' placement='left'>
          <IconButton
            size='small'
            onClick={onOpen}
            aria-label='Open block properties'
            sx={{ width: 32, height: 32, color: 'text.secondary' }}
          >
            <i className='ri-settings-3-line' style={{ fontSize: '1rem' }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: BUILDER_PROPERTY_PANEL_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        overflow: 'hidden',
        ...builderSidePanelSx(theme, 'left')
      }}
    >
      {mode === 'preview' ? (
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <PropertyBodyText>Switch to Edit mode to customize blocks</PropertyBodyText>
        </Box>
      ) : (
        <PropertyPanelContent
          onClose={onClose}
          focusTab={focusTab}
          onFocusTabConsumed={onFocusTabConsumed}
        />
      )}
    </Box>
  )
}
