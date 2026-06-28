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
import { BackgroundOpacityField } from '../BackgroundOpacityField'
import { PropertyTextField } from '../PropertyTextField'
import { PropertyColorField } from '../PropertyColorField'
import { PropertySliderField } from '../PropertySliderField'
import { AlignmentControl } from '../AlignmentControl'
import { TextTypographyControls } from '../TextTypographyControls'
import { useSiteStyles } from '../../SiteStylesScope'

const FIELD_STYLE_OPTIONS: { value: ContactFormFieldStyle; label: string; icon: string }[] = [
  { value: 'theme', label: 'Site styles', icon: 'ri-palette-line' },
  { value: 'square', label: 'Square', icon: 'ri-square-line' },
  { value: 'rounded', label: 'Rounded', icon: 'ri-rounded-corner' },
  { value: 'pill', label: 'Pill', icon: 'ri-checkbox-blank-circle-line' }
]

const SUBMIT_VARIANT_OPTIONS: { value: ContactFormSubmitVariant; label: string; icon: string }[] = [
  { value: 'theme', label: 'Site styles', icon: 'ri-palette-line' },
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
  const fieldRadiusSliderMax = 32
  const submitRadiusSliderMax = 48
  const usesSiteFieldStyle = !props.fieldStyle || props.fieldStyle === 'theme'
  const usesSiteSubmitStyle = !props.submitVariant || props.submitVariant === 'theme'

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

  const formBackgroundColor = props.backgroundColor ?? '#ffffff'
  const formBackgroundOpacity = props.backgroundOpacity ?? 0

  return (
    <PropertyFields>
      <PropertySection title='Form background' collapsible defaultOpen>
        <PropertyColorField
          label='Background color'
          value={formBackgroundColor}
          onChange={backgroundColor => update({ backgroundColor })}
          siteDefault='#ffffff'
        />
        <BackgroundOpacityField
          label='Background opacity'
          value={formBackgroundOpacity}
          onChange={backgroundOpacity => update({ backgroundOpacity })}
        />
        <PropertyBodyText>
          {formBackgroundOpacity === 0
            ? 'Transparent — the section or page background shows through.'
            : 'Adjust opacity to blend the form panel with the page background.'}
        </PropertyBodyText>
      </PropertySection>

      <PropertySection title='Form fields' collapsible defaultOpen>
        <PropertyFieldLabel>Field shape</PropertyFieldLabel>
        <LayoutOptionGroup
          value={props.fieldStyle ?? 'theme'}
          options={FIELD_STYLE_OPTIONS}
          onChange={fieldStyle =>
            update(
              fieldStyle === 'theme'
                ? { fieldStyle, fieldBorderRadius: undefined, fieldBorderWidth: undefined }
                : { fieldStyle, fieldBorderRadius: undefined }
            )
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={props.transparentFieldBackground !== false}
              onChange={event => update({ transparentFieldBackground: event.target.checked })}
            />
          }
          label='Transparent field backgrounds'
        />
        <PropertyBodyText>
          {props.transparentFieldBackground !== false
            ? 'Input fields show only their border — the section background shows through.'
            : 'Input fields use the fill color from Site Styles → Forms.'}
        </PropertyBodyText>
        <PropertyBodyText>
          {usesSiteFieldStyle
            ? 'Uses form field styles from Site Styles. Multiline fields use a subtler corner radius automatically.'
            : 'Custom field shape. Radius and border width below override Site Styles.'}
        </PropertyBodyText>
        <PropertySliderField
          label='Field corner radius'
          value={props.fieldBorderRadius ?? siteFieldRadius}
          min={0}
          max={fieldRadiusSliderMax}
          step={1}
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
          marks
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
          onChange={submitVariant =>
            update(
              submitVariant === 'theme'
                ? { submitVariant, submitColor: undefined, submitBorderRadius: undefined }
                : { submitVariant }
            )
          }
        />
        <PropertyBodyText>
          {usesSiteSubmitStyle
            ? 'Uses your primary button from Site Styles — style, color, shape, and padding.'
            : 'Custom button style. Color and corner radius below override Site Styles.'}
        </PropertyBodyText>
        {!usesSiteSubmitStyle ? (
          <>
            <PropertyColorField
              label='Button color'
              value={props.submitColor ?? siteStyles.colors.accent}
              onChange={submitColor => update({ submitColor })}
              siteDefault={siteStyles.colors.accent}
              onUseSiteDefault={
                props.submitColor !== undefined ? () => update({ submitColor: undefined }) : undefined
              }
            />
            <PropertySliderField
              label='Button corner radius'
              value={props.submitBorderRadius ?? siteSubmitRadius}
              min={0}
              max={submitRadiusSliderMax}
              step={1}
              unit='px'
              onChange={submitBorderRadius => update({ submitBorderRadius })}
              siteDefault={siteSubmitRadius}
              onUseSiteDefault={
                props.submitBorderRadius !== undefined ? () => update({ submitBorderRadius: undefined }) : undefined
              }
            />
          </>
        ) : null}
      </PropertySection>

      <TextTypographyControls
        role='formTitle'
        sectionTitle='Title typography'
        fonts={siteStyles.fonts}
        typography={props.titleTypography}
        onChange={titleTypography => update({ titleTypography })}
      />
      <TextTypographyControls
        role='formBody'
        sectionTitle='Subtitle typography'
        fonts={siteStyles.fonts}
        typography={props.bodyTypography}
        onChange={bodyTypography => update({ bodyTypography })}
      />
      <TextTypographyControls
        role='formField'
        sectionTitle='Field typography'
        fonts={siteStyles.fonts}
        forms={siteStyles.forms}
        typography={props.fieldTypography}
        onChange={fieldTypography => update({ fieldTypography })}
      />
    </PropertyFields>
  )
}
