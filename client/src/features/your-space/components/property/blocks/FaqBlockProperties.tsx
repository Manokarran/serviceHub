'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { FAQ_LAYOUT_OPTIONS, FAQ_MAX_ITEMS } from '../../../constants/faqLayout'
import { useBuilder } from '../../../context/BuilderContext'
import type { Block, FaqBlockProps, FaqItem } from '../../../types'
import { createBlockId } from '../../../utils/blockFactory'
import { canAddFaqItem, createFaqItem, updateFaqItem } from '../../../utils/faqBlockHelpers'
import { FaqLayoutControls, FaqStyleControls } from '../../FaqControls'
import { useSiteStyles } from '../../SiteStylesScope'
import { PropertyAddButton, PropertyRemoveButton } from '../PropertyActionButton'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { LayoutOptionGroup, PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'

type Props = {
  block: Block<'faq'>
  activeTab: PropertyPanelTab
}

export function FaqBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props
  const update = (changes: Partial<FaqBlockProps>) => updateBlock(block.id, changes)
  const items = Array.isArray(props.items) ? props.items : []

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <FaqLayoutControls props={props} onUpdate={update} />
      </PropertyFields>
    )
  }

  if (activeTab === 'style') {
    return (
      <PropertyFields>
        <FaqStyleControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
      </PropertyFields>
    )
  }

  const updateItem = (itemId: string, changes: Partial<FaqItem>) => {
    update({ items: updateFaqItem(items, itemId, changes) })
  }

  const addItem = () => {
    if (!canAddFaqItem(items)) {
      return
    }

    update({ items: [...items, createFaqItem(createBlockId(), items.length)] })
  }

  const removeItem = (itemId: string) => {
    if (items.length <= 1) {
      return
    }

    update({ items: items.filter(item => item.id !== itemId) })
  }

  const moveItem = (itemId: string, direction: -1 | 1) => {
    const index = items.findIndex(item => item.id === itemId)

    if (index < 0) {
      return
    }

    const nextIndex = index + direction

    if (nextIndex < 0 || nextIndex >= items.length) {
      return
    }

    const next = [...items]
    const [entry] = next.splice(index, 1)
    next.splice(nextIndex, 0, entry)
    update({ items: next })
  }

  return (
    <PropertyFields>
      <PropertySection title='Structure' collapsible defaultOpen>
        <LayoutOptionGroup
          value={props.layout}
          options={FAQ_LAYOUT_OPTIONS}
          onChange={layout => update({ layout })}
        />
      </PropertySection>

      <PropertySection title='Section copy' collapsible defaultOpen>
        <PropertyTextField
          label='Eyebrow'
          value={props.eyebrow}
          onChange={eyebrow => update({ eyebrow })}
          placeholder='FAQ'
        />
        <PropertyTextField
          label='Title'
          value={props.title}
          onChange={title => update({ title })}
          placeholder='Frequently Asked Questions'
        />
        <PropertyTextField
          label='Subtitle'
          value={props.subtitle}
          onChange={subtitle => update({ subtitle })}
          placeholder='Everything you need to know…'
          multiline
        />
      </PropertySection>

      <PropertySection title='Questions' collapsible defaultOpen>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 700 }}>Q{index + 1}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    component='button'
                    type='button'
                    disabled={index === 0}
                    onClick={() => moveItem(item.id, -1)}
                    aria-label='Move up'
                    sx={{
                      border: 'none',
                      background: 'none',
                      cursor: index === 0 ? 'default' : 'pointer',
                      opacity: index === 0 ? 0.35 : 1,
                      p: 0.25,
                      color: 'text.secondary'
                    }}
                  >
                    <i className='ri-arrow-up-s-line' />
                  </Box>
                  <Box
                    component='button'
                    type='button'
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(item.id, 1)}
                    aria-label='Move down'
                    sx={{
                      border: 'none',
                      background: 'none',
                      cursor: index === items.length - 1 ? 'default' : 'pointer',
                      opacity: index === items.length - 1 ? 0.35 : 1,
                      p: 0.25,
                      color: 'text.secondary'
                    }}
                  >
                    <i className='ri-arrow-down-s-line' />
                  </Box>
                  {items.length > 1 && (
                    <PropertyRemoveButton label='Remove' onClick={() => removeItem(item.id)} />
                  )}
                </Box>
              </Box>
              <PropertyTextField
                label='Question'
                value={item.question}
                onChange={question => updateItem(item.id, { question })}
                placeholder='What should we answer?'
              />
              <PropertyTextField
                label='Answer'
                value={item.answer}
                onChange={answer => updateItem(item.id, { answer })}
                placeholder='A clear, helpful answer…'
                multiline
                rows={3}
              />
            </Box>
          ))}
          {items.length < FAQ_MAX_ITEMS && (
            <PropertyAddButton label='Add question' onClick={addItem} />
          )}
        </Box>
      </PropertySection>
    </PropertyFields>
  )
}
