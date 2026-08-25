'use client'

import Box from '@mui/material/Box'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { PRICING_MAX_FEATURES, PRICING_MAX_PLANS } from '../../../constants/pricingLayout'
import { useBuilder } from '../../../context/BuilderContext'
import type { Block, PricingBlockProps, PricingFeature, PricingFeatureState, PricingPlan } from '../../../types'
import { createBlockId } from '../../../utils/blockFactory'
import {
  addPlanFeature,
  canAddPricingPlan,
  createPricingFeature,
  createPricingPlan,
  removePlanFeature,
  updatePlanFeature,
  updatePricingPlan
} from '../../../utils/pricingBlockHelpers'
import { PricingLayoutControls } from '../../PricingLayoutControls'
import { PricingStyleControls } from '../../PricingStyleControls'
import { useSiteStyles } from '../../SiteStylesScope'
import { PageLinkField } from '../PageLinkField'
import { PropertyAddButton, PropertyRemoveButton } from '../PropertyActionButton'
import { PropertyColorField } from '../PropertyColorField'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { LayoutOptionGroup, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PropertyToggleRow } from '../PropertyToggleRow'

type Props = {
  block: Block<'pricing'>
  activeTab: PropertyPanelTab
}

const FEATURE_STATE_OPTIONS: { value: PricingFeatureState; label: string; icon: string }[] = [
  { value: 'included', label: 'Included', icon: 'ri-check-line' },
  { value: 'limited', label: 'Limited', icon: 'ri-subtract-line' },
  { value: 'excluded', label: 'Excluded', icon: 'ri-close-line' }
]

export function PricingBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props
  const update = (changes: Partial<PricingBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <PricingLayoutControls props={props} onUpdate={update} />
      </PropertyFields>
    )
  }

  if (activeTab === 'style') {
    return (
      <PropertyFields>
        <PricingStyleControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
      </PropertyFields>
    )
  }

  const updatePlan = (planId: string, changes: Partial<PricingPlan>) => {
    update({ plans: updatePricingPlan(props.plans, planId, changes) })
  }

  const addPlan = () => {
    if (!canAddPricingPlan(props.plans)) {
      return
    }

    update({
      plans: [...props.plans, createPricingPlan(createBlockId(), props.plans.length, createBlockId)]
    })
  }

  const removePlan = (planId: string) => {
    if (props.plans.length <= 1) {
      return
    }

    update({ plans: props.plans.filter(plan => plan.id !== planId) })
  }

  return (
    <PropertyFields>
      <PropertySection title='Section copy' collapsible defaultOpen>
        <PropertyTextField
          label='Eyebrow'
          value={props.eyebrow}
          onChange={eyebrow => update({ eyebrow })}
          placeholder='Pricing'
        />
        <PropertyTextField
          label='Title'
          value={props.title}
          onChange={title => update({ title })}
          placeholder='Plans that grow with you'
        />
        <PropertyTextField
          label='Subtitle'
          value={props.subtitle}
          onChange={subtitle => update({ subtitle })}
          placeholder='Start simple, then upgrade…'
          multiline
        />
        <PropertyTextField
          label='Monthly label'
          value={props.monthlyLabel}
          onChange={monthlyLabel => update({ monthlyLabel })}
        />
        <PropertyTextField
          label='Annual label'
          value={props.annualLabel}
          onChange={annualLabel => update({ annualLabel })}
        />
        <PropertyTextField
          label='Annual badge'
          value={props.annualBadge}
          onChange={annualBadge => update({ annualBadge })}
          placeholder='2 months free'
        />
        <PropertyTextField
          label='Currency symbol'
          value={props.currency}
          onChange={currency => update({ currency })}
          placeholder='$'
        />
      </PropertySection>

      {props.plans.map((plan, index) => (
        <PropertySection key={plan.id} title={plan.name || `Plan ${index + 1}`} collapsible defaultOpen={index === 0}>
          <PlanFields
            plan={plan}
            sectionAccent={props.accentColor || siteStyles.colors.accent}
            sectionCardBackground={props.cardBackground || '#ffffff'}
            onChange={changes => updatePlan(plan.id, changes)}
            onAddFeature={() =>
              update({
                plans: addPlanFeature(props.plans, plan.id, createPricingFeature(createBlockId(), plan.features.length))
              })
            }
            onUpdateFeature={(featureId, changes) =>
              update({ plans: updatePlanFeature(props.plans, plan.id, featureId, changes) })
            }
            onRemoveFeature={featureId => update({ plans: removePlanFeature(props.plans, plan.id, featureId) })}
          />
          {props.plans.length > 1 && <PropertyRemoveButton label='Remove plan' onClick={() => removePlan(plan.id)} />}
        </PropertySection>
      ))}

      {props.plans.length < PRICING_MAX_PLANS && <PropertyAddButton label='Add plan' onClick={addPlan} />}
    </PropertyFields>
  )
}

function PlanFields({
  plan,
  sectionAccent,
  sectionCardBackground,
  onChange,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature
}: {
  plan: PricingPlan
  sectionAccent: string
  sectionCardBackground: string
  onChange: (changes: Partial<PricingPlan>) => void
  onAddFeature: () => void
  onUpdateFeature: (featureId: string, changes: Partial<PricingFeature>) => void
  onRemoveFeature: (featureId: string) => void
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PropertyTextField label='Name' value={plan.name} onChange={name => onChange({ name })} />
      <PropertyTextField
        label='Description'
        value={plan.description}
        onChange={description => onChange({ description })}
        multiline
      />
      <PropertyTextField
        label='Badge'
        value={plan.badge}
        onChange={badge => onChange({ badge })}
        placeholder='Most popular'
      />
      <PropertyToggleRow
        label='Recommended'
        description='Highlights this plan. Only one plan can be recommended.'
        checked={plan.recommended}
        onChange={recommended => onChange({ recommended })}
      />
      <PropertyColorField
        label='Card background'
        value={plan.cardBackground?.trim() || sectionCardBackground}
        siteDefault={sectionCardBackground}
        onUseSiteDefault={() => onChange({ cardBackground: '' })}
        onChange={cardBackground => onChange({ cardBackground })}
      />
      <PropertyColorField
        label='Accent color'
        value={plan.accentColor?.trim() || sectionAccent}
        siteDefault={sectionAccent}
        onUseSiteDefault={() => onChange({ accentColor: '' })}
        onChange={accentColor => onChange({ accentColor })}
      />
      <PropertyTextField
        label='Custom price label'
        value={plan.customPriceLabel}
        onChange={customPriceLabel => onChange({ customPriceLabel })}
        placeholder="Let's talk"
      />
      <PropertyTextField
        label='Monthly price'
        value={String(plan.monthlyPrice)}
        onChange={value => onChange({ monthlyPrice: Number.parseFloat(value) || 0 })}
      />
      <PropertyTextField
        label='Annual price / month'
        value={String(plan.annualMonthlyPrice)}
        onChange={value => onChange({ annualMonthlyPrice: Number.parseFloat(value) || 0 })}
      />
      <PropertyTextField
        label='Discount %'
        value={String(plan.discountPercent)}
        onChange={value => onChange({ discountPercent: Number.parseFloat(value) || 0 })}
      />
      <PropertyTextField
        label='Discount label'
        value={plan.discountLabel}
        onChange={discountLabel => onChange({ discountLabel })}
        placeholder='Save 20%'
      />
      <PropertyTextField label='CTA label' value={plan.ctaText} onChange={ctaText => onChange({ ctaText })} />
      <PageLinkField label='CTA link' value={plan.ctaLink} onChange={ctaLink => onChange({ ctaLink })} />

      {plan.features.map((feature, featureIndex) => (
        <Box
          key={feature.id}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary' }}>Feature {featureIndex + 1}</Box>
          <PropertyTextField
            label='Text'
            value={feature.text}
            onChange={text => onUpdateFeature(feature.id, { text })}
          />
          <LayoutOptionGroup
            value={feature.state}
            options={FEATURE_STATE_OPTIONS}
            onChange={state => onUpdateFeature(feature.id, { state })}
          />
          {feature.state === 'limited' && (
            <PropertyTextField
              label='Hint'
              value={feature.hint ?? ''}
              onChange={hint => onUpdateFeature(feature.id, { hint })}
              placeholder='Up to 5 users'
            />
          )}
          {plan.features.length > 1 && (
            <PropertyRemoveButton label='Remove feature' onClick={() => onRemoveFeature(feature.id)} />
          )}
        </Box>
      ))}

      {plan.features.length < PRICING_MAX_FEATURES && (
        <PropertyAddButton label='Add feature' onClick={onAddFeature} />
      )}
    </Box>
  )
}
