'use client'

import Box from '@mui/material/Box'

import {
  PRICING_COLUMN_OPTIONS,
  PRICING_INTERVAL_OPTIONS,
  PRICING_LAYOUT_OPTIONS
} from '../constants/pricingLayout'
import type { PricingBlockProps, PricingColumns, PricingLayout } from '../types'
import { AlignmentControl } from './property/AlignmentControl'
import { MaxWidthControl } from './property/MaxWidthControl'
import { LayoutOptionGroup, PropertyBodyText, PropertySection } from './property/PropertyPanelUi'
import { PropertySliderField } from './property/PropertySliderField'
import { PropertyToggleRow } from './property/PropertyToggleRow'

type Props = {
  props: PricingBlockProps
  onUpdate: (changes: Partial<PricingBlockProps>) => void
}

export function PricingLayoutControls({ props, onUpdate }: Props) {
  const applyLayout = (layout: PricingLayout) => {
    onUpdate({
      layout,
      columns: layout === 'stack' ? 2 : props.columns,
      showIntervalToggle: layout === 'stack' ? props.showIntervalToggle : props.showIntervalToggle
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PropertySection title='Structure' collapsible defaultOpen>
        <PropertyBodyText>
          Cards is the classic SaaS row. Compare is a feature matrix. Stack is a compact two-plan layout for mobile-first pages.
        </PropertyBodyText>
        <LayoutOptionGroup value={props.layout} options={PRICING_LAYOUT_OPTIONS} onChange={applyLayout} />
      </PropertySection>

      {props.layout !== 'stack' && (
        <PropertySection title='Columns' collapsible defaultOpen>
          <PropertyBodyText>How many plan columns to show on desktop. Extra plans wrap on smaller screens.</PropertyBodyText>
          <LayoutOptionGroup
            value={String(props.columns) as `${PricingColumns}`}
            options={PRICING_COLUMN_OPTIONS}
            onChange={value => onUpdate({ columns: Number(value) as PricingColumns })}
          />
        </PropertySection>
      )}

      <PropertySection title='Billing toggle' collapsible defaultOpen>
        <PropertyToggleRow
          label='Show monthly / annual toggle'
          description='Visitors can switch billing without you duplicating plans.'
          checked={props.showIntervalToggle}
          onChange={showIntervalToggle => onUpdate({ showIntervalToggle })}
        />
        <PropertyBodyText>Default interval visitors see first.</PropertyBodyText>
        <LayoutOptionGroup
          value={props.defaultInterval}
          options={PRICING_INTERVAL_OPTIONS}
          onChange={defaultInterval => onUpdate({ defaultInterval })}
        />
        <PropertyToggleRow
          label='Show yearly total'
          description='When annual is selected, also show the billed yearly amount.'
          checked={props.showYearlyTotal}
          onChange={showYearlyTotal => onUpdate({ showYearlyTotal })}
        />
      </PropertySection>

      <PropertySection title='Alignment' collapsible defaultOpen={false}>
        <AlignmentControl value={props.alignment} onChange={alignment => onUpdate({ alignment })} />
      </PropertySection>

      <PropertySection title='Size' collapsible defaultOpen>
        <PropertySliderField
          label='Corner radius'
          value={props.cardRadius}
          min={0}
          max={36}
          step={2}
          unit='px'
          onChange={cardRadius => onUpdate({ cardRadius })}
        />
        <PropertySliderField
          label='Gap'
          value={props.gap}
          min={8}
          max={48}
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
