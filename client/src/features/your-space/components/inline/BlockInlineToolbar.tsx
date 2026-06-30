'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import { alpha, useTheme } from '@mui/material/styles'

import { useBuilder } from '../../context/BuilderContext'
import { useBuilderShell } from '../../context/BuilderShellContext'
import type {
  Block,
  ButtonBlockProps,
  FooterBlockProps,
  HeaderBlockProps,
  HeadingBlockProps,
  HeroBlockProps,
  ImageBlockProps,
  IconBlockProps,
  LogoBlockProps,
  ShapeBlockProps,
  SectionBlockProps,
  TextBlockProps,
  VideoBlockProps
} from '../../types'
import { findParentSectionId } from '../../utils/blockTreeUtils'
import { MediaSourceField } from '../property/MediaSourceField'
import type { PropertyPanelTab } from '../property/PropertyPanelUi'
import { AlignmentToggleGroup } from './AlignmentToggleGroup'
import {
  InlineToolbarButton,
  InlineToolbarDivider,
  InlineToolbarLabel,
  InlineToolbarPopover,
  InlineToolbarShell
} from './InlineToolbarUi'
import {
  SectionBackgroundPopover,
  SectionBorderPopover,
  SectionSpacingPopover
} from './SectionInlinePopovers'
import { HeroBackgroundPopover, HeroLayoutPopover, HeroSpacingPopover } from './HeroInlinePopovers'
import { SectionLayoutPopover } from './SectionLayoutPopover'
import { HERO_LAYOUT_OPTIONS } from '../../constants/heroLayout'
import { SECTION_LAYOUT_OPTIONS } from '../../constants/sectionLayout'
import { ARTISTIC_LINE_STYLE_OPTIONS, CLASSIC_LINE_STYLE_OPTIONS, SHAPE_VARIANT_OPTIONS } from '../../constants/shapeBlock'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  block: Block
  nested?: boolean
  toolbarPlacement?: 'above' | 'below'
  onDelete: () => void
  dragHandleProps?: Record<string, unknown>
}

const BUTTON_VARIANTS: { value: ButtonBlockProps['variant']; icon: string; label: string }[] = [
  { value: 'contained', icon: 'ri-checkbox-blank-fill', label: 'Filled button' },
  { value: 'outlined', icon: 'ri-checkbox-blank-line', label: 'Outlined button' },
  { value: 'text', icon: 'ri-text-snippet', label: 'Text button' }
]

function InlineToolbarTextButton({
  label,
  active,
  onClick
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  const theme = useTheme()

  return (
    <Box
      component='button'
      type='button'
      onClick={onClick}
      sx={{
        minWidth: 28,
        height: 28,
        px: 0.75,
        border: 'none',
        borderRadius: 0.75,
        cursor: 'pointer',
        fontSize: '0.7rem',
        fontWeight: 600,
        color: active ? 'primary.main' : 'text.secondary',
        backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        '&:hover': {
          color: active ? 'primary.main' : 'text.primary',
          backgroundColor: active
            ? alpha(theme.palette.primary.main, 0.14)
            : alpha(theme.palette.text.primary, 0.06)
        }
      }}
    >
      {label}
    </Box>
  )
}

export function BlockInlineToolbar({ block, nested = false, toolbarPlacement = 'above', onDelete, dragHandleProps }: Props) {
  const { blocks, updateBlock, selectBlock, copyBlock, pasteBlock, copiedBlock } = useBuilder()
  const shell = useBuilderShell()
  const siteStyles = useSiteStyles()
  const [mediaAnchor, setMediaAnchor] = useState<HTMLElement | null>(null)
  const [linkAnchor, setLinkAnchor] = useState<HTMLElement | null>(null)
  const [backgroundAnchor, setBackgroundAnchor] = useState<HTMLElement | null>(null)
  const [spacingAnchor, setSpacingAnchor] = useState<HTMLElement | null>(null)
  const [borderAnchor, setBorderAnchor] = useState<HTMLElement | null>(null)
  const [heroLayoutAnchor, setHeroLayoutAnchor] = useState<HTMLElement | null>(null)
  const [heroBackgroundAnchor, setHeroBackgroundAnchor] = useState<HTMLElement | null>(null)
  const [heroSpacingAnchor, setHeroSpacingAnchor] = useState<HTMLElement | null>(null)
  const [sectionLayoutAnchor, setSectionLayoutAnchor] = useState<HTMLElement | null>(null)

  const parentSectionId = nested ? findParentSectionId(blocks, block.id) : null

  const update = (changes: Partial<Block['props']>) => updateBlock(block.id, changes)

  const openPanel = (tab?: PropertyPanelTab) => {
    shell?.openPropertyPanel(tab)
  }

  const renderQuickActions = () => {
    switch (block.type) {
      case 'heading': {
        const props = block.props as HeadingBlockProps

        return (
          <>
            <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
            <InlineToolbarDivider />
            <InlineToolbarTextButton
              label='H1'
              active={props.level === 1}
              onClick={() => update({ level: 1 })}
            />
            <InlineToolbarTextButton
              label='H2'
              active={props.level === 2}
              onClick={() => update({ level: 2 })}
            />
            <InlineToolbarTextButton
              label='H3'
              active={props.level === 3}
              onClick={() => update({ level: 3 })}
            />
          </>
        )
      }
      case 'text': {
        const props = block.props as TextBlockProps

        return (
          <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
        )
      }
      case 'button': {
        const props = block.props as ButtonBlockProps

        return (
          <>
            <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
            <InlineToolbarDivider />
            {BUTTON_VARIANTS.map(variant => (
              <InlineToolbarButton
                key={variant.value}
                icon={variant.icon}
                label={variant.label}
                active={props.variant === variant.value}
                onClick={() => update({ variant: variant.value })}
              />
            ))}
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-link'
              label='Edit link'
              onClick={e => setLinkAnchor(e.currentTarget as HTMLElement)}
            />
          </>
        )
      }
      case 'image': {
        const props = block.props as ImageBlockProps

        return (
          <>
            <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-image-edit-line'
              label='Replace image'
              onClick={e => setMediaAnchor(e.currentTarget as HTMLElement)}
            />
          </>
        )
      }
      case 'video': {
        const props = block.props as VideoBlockProps

        return (
          <>
            <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-play-circle-line'
              label='Autoplay'
              active={props.autoplay}
              onClick={() =>
                update({
                  autoplay: !props.autoplay,
                  ...(props.autoplay ? {} : { muted: true })
                })
              }
            />
            <InlineToolbarButton
              icon='ri-settings-3-line'
              label='Show controls'
              active={props.controls}
              onClick={() => update({ controls: !props.controls })}
            />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-film-line'
              label='Replace video'
              onClick={e => setMediaAnchor(e.currentTarget as HTMLElement)}
            />
          </>
        )
      }
      case 'logo': {
        const props = block.props as LogoBlockProps

        return (
          <>
            <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-image-edit-line'
              label='Replace logo'
              onClick={e => setMediaAnchor(e.currentTarget as HTMLElement)}
            />
          </>
        )
      }
      case 'icon': {
        const props = block.props as IconBlockProps

        return (
          <>
            <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-contrast-drop-2-line'
              label={props.showIconBackground ? 'Hide icon background' : 'Show icon background'}
              active={props.showIconBackground}
              onClick={() => update({ showIconBackground: !props.showIconBackground })}
            />
          </>
        )
      }
      case 'shape': {
        const props = block.props as ShapeBlockProps

        if (props.variant === 'line') {
          return (
            <>
              <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
              <InlineToolbarDivider />
              {CLASSIC_LINE_STYLE_OPTIONS.slice(0, 3).map(option => (
                <InlineToolbarButton
                  key={option.value}
                  icon={option.icon}
                  label={option.label}
                  active={(props.lineStyle ?? 'solid') === option.value}
                  onClick={() => update({ lineStyle: option.value })}
                />
              ))}
              {ARTISTIC_LINE_STYLE_OPTIONS.slice(0, 3).map(option => (
                <InlineToolbarButton
                  key={option.value}
                  icon={option.icon}
                  label={option.label}
                  active={(props.lineStyle ?? 'solid') === option.value}
                  onClick={() => update({ lineStyle: option.value })}
                />
              ))}
              <InlineToolbarDivider />
              <InlineToolbarButton
                icon='ri-contrast-2-line'
                label='Gradient fill'
                active={props.fillType === 'gradient'}
                onClick={() => update({ fillType: props.fillType === 'gradient' ? 'solid' : 'gradient' })}
              />
            </>
          )
        }

        return (
          <>
            <AlignmentToggleGroup value={props.alignment} onChange={alignment => update({ alignment })} />
            <InlineToolbarDivider />
            {SHAPE_VARIANT_OPTIONS.filter(option => option.value !== 'line').slice(0, 4).map(option => (
              <InlineToolbarButton
                key={option.value}
                icon={option.icon}
                label={option.label}
                active={props.variant === option.value}
                onClick={() => update({ variant: option.value, ...(option.value === 'circle' ? { height: props.width } : {}) })}
              />
            ))}
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-contrast-2-line'
              label='Gradient fill'
              active={props.fillType === 'gradient'}
              onClick={() => update({ fillType: props.fillType === 'gradient' ? 'solid' : 'gradient' })}
            />
          </>
        )
      }
      case 'hero': {
        const props = block.props as HeroBlockProps

        return (
          <>
            {HERO_LAYOUT_OPTIONS.map(layout => (
              <InlineToolbarButton
                key={layout.value}
                icon={layout.icon}
                label={layout.label}
                active={props.layout === layout.value}
                onClick={() => update({ layout: layout.value })}
              />
            ))}
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-price-tag-3-line'
              label={props.eyebrow?.trim() ? 'Remove eyebrow' : 'Add eyebrow'}
              active={Boolean(props.eyebrow?.trim())}
              onClick={() => update({ eyebrow: props.eyebrow?.trim() ? '' : 'Now live' })}
            />
            <InlineToolbarButton
              icon='ri-add-circle-line'
              label={props.buttonText?.trim() ? 'Remove primary CTA' : 'Add primary CTA'}
              active={Boolean(props.buttonText?.trim())}
              onClick={() =>
                update(
                  props.buttonText?.trim()
                    ? { buttonText: '', buttonLink: '#' }
                    : { buttonText: 'Get started', buttonLink: '#' }
                )
              }
            />
            <InlineToolbarButton
              icon='ri-checkbox-blank-circle-line'
              label={props.secondaryButtonText?.trim() ? 'Remove secondary CTA' : 'Add secondary CTA'}
              active={Boolean(props.secondaryButtonText?.trim())}
              onClick={() =>
                update(
                  props.secondaryButtonText?.trim()
                    ? { secondaryButtonText: '', secondaryButtonLink: '#' }
                    : { secondaryButtonText: 'Learn more', secondaryButtonLink: '#' }
                )
              }
            />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-palette-line'
              label='Background'
              onClick={e => setHeroBackgroundAnchor(e.currentTarget as HTMLElement)}
            />
            <InlineToolbarButton
              icon='ri-expand-left-right-line'
              label='Spacing'
              onClick={e => setHeroSpacingAnchor(e.currentTarget as HTMLElement)}
            />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-layout-line'
              label='Layout controls'
              onClick={e => setHeroLayoutAnchor(e.currentTarget as HTMLElement)}
            />
          </>
        )
      }
      case 'header': {
        const props = block.props as HeaderBlockProps

        return (
          <InlineToolbarButton
            icon='ri-pushpin-line'
            label='Pin to top'
            active={props.fixed}
            onClick={() => update({ fixed: !props.fixed })}
          />
        )
      }
      case 'footer': {
        const props = block.props as FooterBlockProps

        return (
          <InlineToolbarButton
            icon='ri-pushpin-line'
            label='Pin to bottom'
            active={props.fixed}
            onClick={() => update({ fixed: !props.fixed })}
          />
        )
      }
      case 'section': {
        const props = block.props as SectionBlockProps

        return (
          <>
            {SECTION_LAYOUT_OPTIONS.map(layout => (
              <InlineToolbarButton
                key={layout.value}
                icon={layout.icon}
                label={layout.label}
                active={props.layout === layout.value}
                onClick={() => update({ layout: layout.value })}
              />
            ))}
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-palette-line'
              label='Background'
              onClick={e => setBackgroundAnchor(e.currentTarget as HTMLElement)}
            />
            <InlineToolbarButton
              icon='ri-expand-left-right-line'
              label='Spacing & width'
              onClick={e => setSpacingAnchor(e.currentTarget as HTMLElement)}
            />
            <InlineToolbarButton
              icon='ri-square-line'
              label='Frame style'
              active={props.borderStyle !== 'none'}
              onClick={e => setBorderAnchor(e.currentTarget as HTMLElement)}
            />
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-layout-line'
              label='Layout controls'
              onClick={e => setSectionLayoutAnchor(e.currentTarget as HTMLElement)}
            />
            <InlineToolbarButton
              icon='ri-sparkling-2-line'
              label='Split panel style'
              onClick={e => setSectionLayoutAnchor(e.currentTarget as HTMLElement)}
            />
          </>
        )
      }
      default:
        return null
    }
  }

  const mediaPopoverContent = () => {
    if (block.type === 'image') {
      const props = block.props as ImageBlockProps

      return (
        <MediaSourceField
          label='Image'
          value={props.src}
          enableUnsplash
          unsplashDefaultQuery='professional photography'
          onChange={(src, meta) => {
            update({
              src,
              ...(meta
                ? { naturalWidth: meta.width, naturalHeight: meta.height }
                : {}),
              ...(meta?.alt && !props.alt ? { alt: meta.alt } : {}),
              crop: null,
              adjustments: null
            })
            setMediaAnchor(null)
          }}
        />
      )
    }

    if (block.type === 'video') {
      const props = block.props as VideoBlockProps

      return (
        <MediaSourceField
          label='Video'
          value={props.src}
          onChange={src => {
            update({ src })
            setMediaAnchor(null)
          }}
          acceptVideo
          urlPlaceholder='Upload, paste a file URL, or YouTube/Vimeo link'
        />
      )
    }

    if (block.type === 'logo') {
      const props = block.props as LogoBlockProps

      return (
        <MediaSourceField
          label='Logo'
          value={props.src}
          onChange={src => {
            update({ src })
            setMediaAnchor(null)
          }}
          clearLabel='Remove logo'
        />
      )
    }

    return null
  }

  const linkPopoverContent = () => {
    if (block.type !== 'button') {
      return null
    }

    const props = block.props as ButtonBlockProps

    return (
      <TextField
        label='Link URL'
        size='small'
        fullWidth
        value={props.link}
        onChange={e => update({ link: e.target.value })}
        placeholder='https://…'
        sx={{ '& .MuiInputBase-root': { borderRadius: 1 } }}
      />
    )
  }

  return (
    <>
      <InlineToolbarShell placement={toolbarPlacement}>
        <Box
          {...dragHandleProps}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            px: 0.5,
            cursor: 'grab',
            touchAction: 'none',
            color: 'text.secondary',
            flexShrink: 0
          }}
        >
          <i className='ri-draggable' style={{ fontSize: '0.85rem' }} />
        </Box>
        {!nested && <InlineToolbarDivider />}
        <InlineToolbarLabel>{getInlineBlockLabel(block.type)}</InlineToolbarLabel>
        {parentSectionId && (
          <>
            <InlineToolbarDivider />
            <InlineToolbarButton
              icon='ri-layout-row-line'
              label='Edit section'
              onClick={() => selectBlock(parentSectionId)}
            />
          </>
        )}
        <InlineToolbarDivider />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            minWidth: 0,
            flex: '1 1 auto',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {renderQuickActions()}
        </Box>
        <InlineToolbarDivider />
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <InlineToolbarButton
            icon='ri-settings-3-line'
            label='More settings'
            onClick={() => openPanel(block.type === 'section' ? 'style' : undefined)}
          />
          <InlineToolbarButton
            icon='ri-file-copy-line'
            label='Copy block'
            onClick={() => copyBlock(block)}
          />
          {copiedBlock && (
            <InlineToolbarButton
              icon='ri-clipboard-line'
              label={`Paste "${getInlineBlockLabel(copiedBlock.type)}" after this block`}
              onClick={() => pasteBlock(block.id)}
            />
          )}
          <InlineToolbarButton icon='ri-delete-bin-line' label='Delete block' onClick={onDelete} />
        </Box>
      </InlineToolbarShell>

      <InlineToolbarPopover
        open={Boolean(mediaAnchor)}
        anchorEl={mediaAnchor}
        onClose={() => setMediaAnchor(null)}
        title={
          block.type === 'video'
            ? 'Replace video'
            : block.type === 'logo'
              ? 'Replace logo'
              : 'Replace image'
        }
        width={300}
      >
        {mediaPopoverContent()}
      </InlineToolbarPopover>

      <InlineToolbarPopover
        open={Boolean(linkAnchor)}
        anchorEl={linkAnchor}
        onClose={() => setLinkAnchor(null)}
        title='Button link'
        width={280}
      >
        {linkPopoverContent()}
      </InlineToolbarPopover>

      {block.type === 'section' && (
        <>
          <InlineToolbarPopover
            open={Boolean(backgroundAnchor)}
            anchorEl={backgroundAnchor}
            onClose={() => setBackgroundAnchor(null)}
            title='Section background'
            width={380}
          >
            <SectionBackgroundPopover block={block as Block<'section'>} onUpdate={update} />
          </InlineToolbarPopover>
          <InlineToolbarPopover
            open={Boolean(spacingAnchor)}
            anchorEl={spacingAnchor}
            onClose={() => setSpacingAnchor(null)}
            title='Spacing & width'
            width={300}
          >
            <SectionSpacingPopover props={block.props as SectionBlockProps} onUpdate={update} />
          </InlineToolbarPopover>
          <InlineToolbarPopover
            open={Boolean(borderAnchor)}
            anchorEl={borderAnchor}
            onClose={() => setBorderAnchor(null)}
            title='Frame style'
            width={280}
          >
            <SectionBorderPopover props={block.props as SectionBlockProps} onUpdate={update} />
          </InlineToolbarPopover>
        </>
      )}

      {block.type === 'section' && (
        <InlineToolbarPopover
          open={Boolean(sectionLayoutAnchor)}
          anchorEl={sectionLayoutAnchor}
          onClose={() => setSectionLayoutAnchor(null)}
          title='Layout controls'
          width={360}
        >
          <SectionLayoutPopover props={block.props as SectionBlockProps} onUpdate={update} />
        </InlineToolbarPopover>
      )}

      {block.type === 'hero' && (
        <>
          <InlineToolbarPopover
            open={Boolean(heroBackgroundAnchor)}
            anchorEl={heroBackgroundAnchor}
            onClose={() => setHeroBackgroundAnchor(null)}
            title='Hero background'
            width={380}
          >
            <HeroBackgroundPopover props={block.props as HeroBlockProps} onUpdate={update} />
          </InlineToolbarPopover>
          <InlineToolbarPopover
            open={Boolean(heroSpacingAnchor)}
            anchorEl={heroSpacingAnchor}
            onClose={() => setHeroSpacingAnchor(null)}
            title='Hero spacing'
            width={300}
          >
            <HeroSpacingPopover props={block.props as HeroBlockProps} onUpdate={update} />
          </InlineToolbarPopover>
          <InlineToolbarPopover
            open={Boolean(heroLayoutAnchor)}
            anchorEl={heroLayoutAnchor}
            onClose={() => setHeroLayoutAnchor(null)}
            title='Layout controls'
            width={360}
          >
            <HeroLayoutPopover props={block.props as HeroBlockProps} onUpdate={update} />
          </InlineToolbarPopover>
        </>
      )}
    </>
  )
}

function getInlineBlockLabel(type: Block['type']): string {
  const labels: Record<Block['type'], string> = {
    section: 'Section',
    carousel: 'Carousel',
    tabs: 'Tabs',
    header: 'Header',
    footer: 'Footer',
    hero: 'Hero',
    heading: 'Heading',
    text: 'Text',
    button: 'Button',
    image: 'Image',
    video: 'Video',
    logo: 'Logo',
    shape: 'Shape',
    icon: 'Icon',
    contactForm: 'Contact Form'
  }

  return labels[type]
}
