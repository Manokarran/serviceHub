'use client'

import { IconPicker, type IconPickerStyle } from '@/components/IconPicker'

import { useBuilder } from '../../../context/BuilderContext'
import { DEFAULT_ICON_BLOCK_PROPS } from '../../../constants/iconBlock'
import type { Block, IconBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields } from '../PropertyPanelUi'
import { AlignmentControl } from '../AlignmentControl'

type Props = {
  block: Block<'icon'>
  activeTab: PropertyPanelTab
}

function toIconStyle(props: IconBlockProps): IconPickerStyle {
  return {
    color: props.iconColor,
    size: props.iconSize,
    showBackground: props.showIconBackground,
    backgroundColor: props.iconBackgroundColor,
    borderRadius: props.iconBorderRadius
  }
}

function fromIconStyle(style: IconPickerStyle): Partial<IconBlockProps> {
  return {
    iconColor: style.color,
    iconSize: style.size,
    showIconBackground: style.showBackground,
    iconBackgroundColor: style.backgroundColor,
    iconBorderRadius: style.borderRadius
  }
}

export function IconBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const props = block.props as IconBlockProps
  const update = (changes: Partial<IconBlockProps>) => updateBlock(block.id, changes)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <IconPicker
          label='Icon'
          value={props.iconName}
          showStyleControls
          style={toIconStyle(props)}
          onChange={iconName => update({ iconName: iconName ?? DEFAULT_ICON_BLOCK_PROPS.iconName })}
          onStyleChange={style => update(fromIconStyle(style))}
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

  return null
}
