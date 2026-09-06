'use client'

import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { useTheme } from '@mui/material/styles'

import type { CarouselBlockProps } from '../types'
import { BlockBackgroundModePanel } from './BlockBackgroundModePanel'
import { BackgroundOpacityField } from './property/BackgroundOpacityField'
import { PropertyColorField } from './property/PropertyColorField'
import { PropertyBodyText, PropertySection } from './property/PropertyPanelUi'

type Props = {
  props: CarouselBlockProps
  accentColor: string
  onUpdate: (changes: Partial<CarouselBlockProps>) => void
}

export function CarouselStyleControls({ props, accentColor, onUpdate }: Props) {
  const theme = useTheme()
  const surfaceDefault = theme.palette.background.paper

  return (
    <>
      <PropertySection title='Slide panels' collapsible defaultOpen>
        <PropertyBodyText>
          Each slide sits in a panel. Lower opacity lets the carousel background show through instead of a solid card.
        </PropertyBodyText>
        <PropertyColorField
          label='Panel color'
          value={props.slidePanelColor?.trim() || surfaceDefault}
          siteDefault={surfaceDefault}
          onUseSiteDefault={() => onUpdate({ slidePanelColor: '' })}
          onChange={slidePanelColor => onUpdate({ slidePanelColor })}
        />
        <BackgroundOpacityField
          label='Panel opacity'
          value={props.slidePanelOpacity ?? 60}
          onChange={slidePanelOpacity => onUpdate({ slidePanelOpacity })}
        />
        <FormControlLabel
          control={
            <Switch
              size='small'
              checked={props.showSlidePanelBorder ?? true}
              onChange={event => onUpdate({ showSlidePanelBorder: event.target.checked })}
            />
          }
          label='Show panel border'
        />
      </PropertySection>

      <PropertySection title='Carousel background' collapsible defaultOpen>
        <PropertyBodyText>
          Use a static fill (color, pattern, gradient, or photo) or an animated background — not both at once.
        </PropertyBodyText>
        <BlockBackgroundModePanel
          props={props}
          accentColor={accentColor}
          sectionType='carousel'
          fallbackColor='#ffffff'
          onUpdate={onUpdate}
        />
      </PropertySection>
    </>
  )
}
