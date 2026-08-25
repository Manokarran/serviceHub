'use client'

import Box from '@mui/material/Box'

import { SHOWCASE_MAX_ITEMS } from '../../../constants/showcaseLayout'
import { useBuilder } from '../../../context/BuilderContext'
import type { Block, ShowcaseBlockProps, ShowcaseItem } from '../../../types'
import { createBlockId } from '../../../utils/blockFactory'
import { createShowcaseItem, getShowcaseVisibleCount, updateShowcaseItem } from '../../../utils/showcaseBlockHelpers'
import { ShowcaseLayoutControls } from '../../ShowcaseLayoutControls'
import { ShowcaseStyleControls } from '../../ShowcaseStyleControls'
import { useSiteStyles } from '../../SiteStylesScope'
import { PropertyAddButton, PropertyRemoveButton } from '../PropertyActionButton'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields } from '../PropertyPanelUi'
import { ShowcaseItemFields } from './ShowcaseItemFields'

type Props = {
  block: Block<'showcase'>
  activeTab: PropertyPanelTab
}

export function ShowcaseBlockProperties({ block, activeTab }: Props) {
  const { updateBlock, selectedNestedItemId, selectNestedItem } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as ShowcaseBlockProps
  const update = (changes: Partial<ShowcaseBlockProps>) => updateBlock(block.id, changes)
  const visibleCount = getShowcaseVisibleCount(props)
  const items = props.items.slice(0, Math.max(visibleCount, props.items.length))
  const selectedItem = items.find(item => item.id === selectedNestedItemId) ?? items[0] ?? null

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <ShowcaseLayoutControls props={props} onUpdate={update} />
      </PropertyFields>
    )
  }

  if (activeTab === 'style') {
    return (
      <PropertyFields>
        <ShowcaseStyleControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
      </PropertyFields>
    )
  }

  const updateItem = (itemId: string, changes: Partial<ShowcaseItem>) => {
    update({ items: updateShowcaseItem(props.items, itemId, changes) })
  }

  const addItem = () => {
    if (props.items.length >= SHOWCASE_MAX_ITEMS) {
      return
    }

    const item = createShowcaseItem(createBlockId(), props.items.length)

    update({
      items: [...props.items, item],
      layout: 'cards',
      columns: Math.min(SHOWCASE_MAX_ITEMS, props.items.length + 1) as 1 | 2 | 3
    })
    selectNestedItem(item.id)
  }

  const removeItem = (itemId: string) => {
    if (props.items.length <= 1) {
      return
    }

    const itemsAfterRemove = props.items.filter(entry => entry.id !== itemId)
    const columns = Math.min(3, Math.max(1, itemsAfterRemove.length)) as 1 | 2 | 3

    update({
      items: itemsAfterRemove,
      columns,
      layout: itemsAfterRemove.length === 1 ? props.layout : 'cards'
    })
    selectNestedItem(itemsAfterRemove[0]?.id ?? null)
  }

  return (
    <PropertyFields>
      {items.length > 1 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {items.map((item, index) => {
            const selected = selectedItem?.id === item.id

            return (
              <Box
                key={item.id}
                component='button'
                type='button'
                onClick={() => selectNestedItem(item.id)}
                sx={{
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                  backgroundColor: selected ? 'action.selected' : 'transparent',
                  color: selected ? 'primary.main' : 'text.secondary',
                  borderRadius: 999,
                  px: 1.1,
                  py: 0.4,
                  cursor: 'pointer',
                  fontSize: '0.6875rem',
                  fontWeight: 600
                }}
              >
                Panel {index + 1}
              </Box>
            )
          })}
        </Box>
      )}
      {selectedItem && (
        <>
          <ShowcaseItemFields
            item={selectedItem}
            accentColor={siteStyles.colors.accent}
            onChange={changes => updateItem(selectedItem.id, changes)}
          />
          {props.items.length > 1 && (
            <PropertyRemoveButton label='Remove panel' onClick={() => removeItem(selectedItem.id)} />
          )}
        </>
      )}
      {props.items.length < SHOWCASE_MAX_ITEMS && (
        <PropertyAddButton label='Add panel' onClick={addItem} />
      )}
    </PropertyFields>
  )
}
