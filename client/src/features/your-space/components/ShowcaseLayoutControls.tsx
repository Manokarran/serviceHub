'use client'

import Box from '@mui/material/Box'

import {
  SHOWCASE_CARD_STYLE_OPTIONS,
  SHOWCASE_COLUMN_OPTIONS,
  SHOWCASE_LAYOUT_OPTIONS,
  SHOWCASE_MEDIA_SIDE_OPTIONS
} from '../constants/showcaseLayout'
import type { ShowcaseBlockProps, ShowcaseColumns, ShowcaseLayout } from '../types'
import { createBlockId } from '../utils/blockFactory'
import { ensureShowcaseItems, getShowcaseVisibleCount } from '../utils/showcaseBlockHelpers'
import { AlignmentControl } from './property/AlignmentControl'
import { MaxWidthControl } from './property/MaxWidthControl'
import { LayoutOptionGroup, PropertyBodyText, PropertySection } from './property/PropertyPanelUi'
import { PropertySliderField } from './property/PropertySliderField'

type Props = {
  props: ShowcaseBlockProps
  onUpdate: (changes: Partial<ShowcaseBlockProps>) => void
}

export function ShowcaseLayoutControls({ props, onUpdate }: Props) {
  const isSplit = props.layout === 'split'
  const isCards = props.layout === 'cards'
  const mediaSideHint = isSplit
    ? 'Start places the visual on the left. End places it on the right. Narrow screens always stack.'
    : 'Start places the visual above the copy. End places it below.'

  const applyLayout = (layout: ShowcaseLayout) => {
    const columns: ShowcaseColumns = layout === 'cards' ? props.columns || 3 : 1
    const visibleCount = getShowcaseVisibleCount({ layout, columns })

    onUpdate({
      layout,
      columns,
      items: ensureShowcaseItems(props.items, visibleCount, createBlockId),
      ...(layout === 'cards' || layout === 'stack' ? {} : { cardStyle: props.cardStyle })
    })
  }

  const applyColumns = (value: ShowcaseColumns) => {
    if (value === 1) {
      onUpdate({
        columns: 1,
        layout: props.layout === 'cards' ? 'stack' : props.layout
      })

      return
    }

    onUpdate({
      columns: value,
      layout: 'cards',
      items: ensureShowcaseItems(props.items, value, createBlockId)
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Structure' collapsible defaultOpen>
        <PropertyBodyText>
          Split is the editorial layout — visual on one side, copy on the other. Stack is a single story. Cards are 1–3 tiles.
        </PropertyBodyText>
        <LayoutOptionGroup
          value={props.layout}
          options={SHOWCASE_LAYOUT_OPTIONS}
          onChange={applyLayout}
        />
      </PropertySection>

      <PropertySection title='Columns' collapsible defaultOpen>
        <PropertyBodyText>Use one column for a single story, or two / three tiles for a feature row.</PropertyBodyText>
        <LayoutOptionGroup
          value={String(isCards ? props.columns : 1) as '1' | '2' | '3'}
          options={SHOWCASE_COLUMN_OPTIONS}
          onChange={value => applyColumns(Number(value) as ShowcaseColumns)}
        />
      </PropertySection>

      <PropertySection title='Composition' collapsible defaultOpen>
        <PropertyBodyText>
          Layered keeps a logo on top of the image with copy along the bottom. Stacked shows logo, visual, then text.
        </PropertyBodyText>
        <LayoutOptionGroup
          value={props.cardStyle}
          options={SHOWCASE_CARD_STYLE_OPTIONS}
          onChange={cardStyle => onUpdate({ cardStyle })}
        />
        <LayoutOptionGroup
          value={props.mediaSide}
          options={SHOWCASE_MEDIA_SIDE_OPTIONS}
          onChange={mediaSide => onUpdate({ mediaSide })}
        />
        <PropertyBodyText>{mediaSideHint}</PropertyBodyText>
      </PropertySection>

      {isSplit && (
        <PropertySection title='Split balance' collapsible defaultOpen>
          <PropertySliderField
            label='Copy width'
            value={props.splitRatio}
            min={32}
            max={68}
            step={2}
            unit='%'
            onChange={splitRatio => onUpdate({ splitRatio })}
          />
        </PropertySection>
      )}

      <PropertySection title='Alignment' collapsible defaultOpen={false}>
        <AlignmentControl value={props.alignment} onChange={alignment => updateAlignment(onUpdate, alignment)} />
      </PropertySection>

      <PropertySection title='Size' collapsible defaultOpen>
        <PropertySliderField
          label='Minimum height'
          value={props.minHeight}
          min={280}
          max={720}
          step={20}
          unit='px'
          onChange={minHeight => onUpdate({ minHeight })}
        />
        <PropertySliderField
          label='Corner radius'
          value={props.mediaRadius}
          min={0}
          max={48}
          step={2}
          unit='px'
          onChange={mediaRadius => onUpdate({ mediaRadius })}
        />
        <PropertySliderField
          label='Gap'
          value={props.gap}
          min={8}
          max={64}
          step={4}
          unit='px'
          onChange={gap => onUpdate({ gap })}
        />
      </PropertySection>

      <PropertySection title='Spacing' collapsible defaultOpen={false}>
        <MaxWidthControl value={props.maxWidth} onChange={maxWidth => onUpdate({ maxWidth })} />
        <PropertySliderField
          label='Horizontal padding'
          value={props.paddingX}
          min={8}
          max={96}
          step={4}
          unit='px'
          onChange={paddingX => onUpdate({ paddingX })}
        />
        <PropertySliderField
          label='Vertical padding'
          value={props.paddingY}
          min={24}
          max={160}
          step={8}
          unit='px'
          onChange={paddingY => onUpdate({ paddingY })}
        />
      </PropertySection>
    </Box>
  )
}

function updateAlignment(onUpdate: Props['onUpdate'], alignment: ShowcaseBlockProps['alignment']) {
  onUpdate({ alignment })
}
