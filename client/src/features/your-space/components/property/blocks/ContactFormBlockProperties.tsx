'use client'

import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

import { useBuilder } from '../../../context/BuilderContext'
import type { Block, ContactFormBlockProps, ContactFormFieldStyle, ContactFormSubmitVariant } from '../../../types'
import { getButtonBorderRadius } from '../../../utils/siteStylesHelpers'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import {
  LayoutOptionGroup,
  PropertyBodyText,
  PropertyFieldLabel,
  PropertyFields,
  PropertySection
} from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PropertyColorField } from '../PropertyColorField'
import { PropertySliderField } from '../PropertySliderField'
import { AlignmentControl } from '../AlignmentControl'
import { useSiteStyles } from '../../SiteStylesScope'

const FIELD_STYLE_OPTIONS: { value: ContactFormFieldStyle; label: string; icon: string }[] = [
  { value: 'theme', label: 'Theme', icon: 'ri-palette-line' },
  { value: 'square', label: 'Square', icon: 'ri-square-line' },
  { value: 'rounded', label: 'Rounded', icon: 'ri-rounded-corner' },
  { value: 'pill', label: 'Pill', icon: 'ri-checkbox-blank-circle-line' }
]

const SUBMIT_VARIANT_OPTIONS: { value: ContactFormSubmitVariant; label: string; icon: string }[] = [
  { value: 'theme', label: 'Theme', icon: 'ri-palette-line' },
  { value: 'contained', label: 'Filled', icon: 'ri-checkbox-blank-fill' },
  { value: 'outlined', label: 'Outlined', icon: 'ri-checkbox-blank-line' },
  { value: 'text', label: 'Text', icon: 'ri-text-snippet' }
]

type Props = {
  block: Block<'contactForm'>
  activeTab: PropertyPanelTab
}

export function ContactFormBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props
  const update = (changes: Partial<ContactFormBlockProps>) => updateBlock(block.id, changes)

  const resolvedFieldShape =
    props.fieldStyle && props.fieldStyle !== 'theme' ? props.fieldStyle : siteStyles.forms.fieldShape
  const siteFieldRadius = getButtonBorderRadius(resolvedFieldShape) as number
  const siteFieldBorderWidth = siteStyles.forms.fieldBorderWidth
  const siteSubmitRadius = getButtonBorderRadius(siteStyles.buttons.primary.shape) as number
  const radiusSliderMax = 999

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertyTextField
          label='Title'
          value={props.title}
          onChange={title => update({ title })}
          placeholder='Get in touch'
        />
        <PropertyTextField
          label='Subtitle'
          value={props.subtitle ?? ''}
          onChange={subtitle => update({ subtitle })}
          placeholder='Optional intro text…'
          multiline
        />
        <PropertyTextField
          label='Submit button label'
          value={props.submitLabel}
          onChange={submitLabel => update({ submitLabel })}
        />
        <PropertyTextField
          label='Success message'
          value={props.successMessage}
          onChange={successMessage => update({ successMessage })}
          multiline
        />
        <PropertyTextField
          label='Signup checkbox label'
          value={props.signupLabel}
          onChange={signupLabel => update({ signupLabel })}
        />
        <FormControlLabel
          control={
            <Switch
              checked={props.showSignupOption}
              onChange={event => update({ showSignupOption: event.target.checked })}
            />
          }
          label='Show signup option'
        />
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <PropertySection title='Form fields' collapsible defaultOpen>
        <PropertyFieldLabel>Field shape</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.fieldStyle ?? 'theme'}
          options={FIELD_STYLE_OPTIONS}
          onChange={fieldStyle => update({ fieldStyle })}
        />
        <PropertyBodyText>
          Theme uses your site form styles. Multiline fields use a subtler corner radius automatically.
        </PropertyBodyText>
        <PropertySliderField
          label='Field corner radius'
          value={props.fieldBorderRadius ?? siteFieldRadius}
          min={0}
          max={radiusSliderMax}
          step={2}
          unit='px'
          onChange={fieldBorderRadius => update({ fieldBorderRadius })}
          siteDefault={siteFieldRadius}
          onUseSiteDefault={
            props.fieldBorderRadius !== undefined ? () => update({ fieldBorderRadius: undefined }) : undefined
          }
        />
        <PropertySliderField
          label='Field border width'
          value={props.fieldBorderWidth ?? siteFieldBorderWidth}
          min={0}
          max={4}
          step={1}
          unit='px'
          onChange={fieldBorderWidth => update({ fieldBorderWidth })}
          siteDefault={siteFieldBorderWidth}
          onUseSiteDefault={
            props.fieldBorderWidth !== undefined ? () => update({ fieldBorderWidth: undefined }) : undefined
          }
        />
      </PropertySection>

      <PropertySection title='Submit button' collapsible defaultOpen>
        <PropertyFieldLabel>Button style</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.submitVariant ?? 'theme'}
          options={SUBMIT_VARIANT_OPTIONS}
          onChange={submitVariant => update({ submitVariant })}
        />
        <PropertyBodyText>Theme uses your site primary button style.</PropertyBodyText>
        <PropertyColorField
          label='Button color'
          value={props.submitColor ?? siteStyles.colors.accent}
          onChange={submitColor => update({ submitColor })}
        />
        <PropertySliderField
          label='Button corner radius'
          value={props.submitBorderRadius ?? siteSubmitRadius}
          min={0}
          max={radiusSliderMax}
          step={2}
          unit='px'
          onChange={submitBorderRadius => update({ submitBorderRadius })}
          siteDefault={siteSubmitRadius}
          onUseSiteDefault={
            props.submitBorderRadius !== undefined ? () => update({ submitBorderRadius: undefined }) : undefined
          }
        />
      </PropertySection>
    </PropertyFields>
  )
}
