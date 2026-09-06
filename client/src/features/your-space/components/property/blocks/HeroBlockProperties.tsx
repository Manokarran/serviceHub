'use client'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, HeroBlockProps } from '../../../types'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'
import { PageLinkField } from '../PageLinkField'
import { PropertyAddButton, PropertyRemoveButton } from '../PropertyActionButton'
import { PropertyToggleRow } from '../PropertyToggleRow'
import { HeroLayoutControls } from '../../HeroLayoutControls'
import { HeroStyleControls } from '../../HeroStyleControls'
import {
  DEFAULT_HERO_ROTATING_INTERVAL_MS,
  DEFAULT_HERO_ROTATING_WORDS,
  HERO_ROTATE_TOKEN,
  ensureHeroRotateToken,
  normalizeHeroRotatingWords,
  resolveHeroRotatingIntervalMs
} from '../../../utils/heroRotatingWords'

type Props = {
  block: Block<'hero'>
  activeTab: PropertyPanelTab
}

export function HeroBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as HeroBlockProps
  const update = (changes: Partial<HeroBlockProps>) => updateBlock(block.id, changes)
  const hasEyebrow = Boolean(props.eyebrow?.trim())
  const hasPrimaryButton = Boolean(props.buttonText?.trim())
  const hasSecondaryButton = Boolean(props.secondaryButtonText?.trim())
  const rotatingWords = normalizeHeroRotatingWords(props.rotatingWords)
  const rotatingEnabled = Boolean(props.rotatingWordsEnabled)

  const setRotatingEnabled = (enabled: boolean) => {
    if (!enabled) {
      update({ rotatingWordsEnabled: false })

      return
    }

    update({
      rotatingWordsEnabled: true,
      title: ensureHeroRotateToken(props.title),
      rotatingWords: rotatingWords.length > 0 ? rotatingWords : [...DEFAULT_HERO_ROTATING_WORDS],
      rotatingWordIntervalMs: resolveHeroRotatingIntervalMs(props.rotatingWordIntervalMs)
    })
  }

  const updateWordAt = (index: number, value: string) => {
    const next = [...rotatingWords]
    next[index] = value
    update({ rotatingWords: next })
  }

  const removeWordAt = (index: number) => {
    update({ rotatingWords: rotatingWords.filter((_, wordIndex) => wordIndex !== index) })
  }

  const addWord = () => {
    update({ rotatingWords: [...rotatingWords, 'new word'] })
  }

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <PropertySection title='Headline' collapsible defaultOpen>
          {hasEyebrow ? (
            <>
              <PropertyTextField
                label='Eyebrow'
                value={props.eyebrow ?? ''}
                onChange={eyebrow => update({ eyebrow })}
                placeholder='Now live · Limited spots'
              />
              <PropertyRemoveButton label='Remove eyebrow' onClick={() => update({ eyebrow: '' })} />
            </>
          ) : (
            <PropertyAddButton label='Add eyebrow' onClick={() => update({ eyebrow: 'Now live' })} />
          )}
          <PropertyTextField
            label='Title'
            value={props.title}
            onChange={title => update({ title })}
            placeholder={rotatingEnabled ? `Build the website your ${HERO_ROTATE_TOKEN} deserves` : 'Hero headline…'}
            helperText={
              rotatingEnabled
                ? `Place ${HERO_ROTATE_TOKEN} where the sliding word should appear.`
                : undefined
            }
          />
          <PropertyToggleRow
            label='Sliding words'
            description='Cycle words through the title with a slide-up animation.'
            checked={rotatingEnabled}
            onChange={setRotatingEnabled}
          />
          {rotatingEnabled ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                Words in the slide
              </Typography>
              {rotatingWords.map((word, index) => (
                <Box key={`rotate-word-${index}`} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <PropertyTextField
                      label={`Word ${index + 1}`}
                      value={word}
                      onChange={value => updateWordAt(index, value)}
                      placeholder='salon'
                    />
                  </Box>
                  <IconButton
                    size='small'
                    aria-label={`Remove word ${index + 1}`}
                    onClick={() => removeWordAt(index)}
                    disabled={rotatingWords.length <= 1}
                    sx={{ mt: 2.75 }}
                  >
                    <i className='ri-close-line' />
                  </IconButton>
                </Box>
              ))}
              {rotatingWords.length < 24 ? <PropertyAddButton label='Add word' onClick={addWord} /> : null}
              <PropertyTextField
                label='Seconds between words'
                value={String((resolveHeroRotatingIntervalMs(props.rotatingWordIntervalMs) / 1000).toFixed(1))}
                onChange={value => {
                  const seconds = Number(value)

                  update({
                    rotatingWordIntervalMs: Number.isFinite(seconds)
                      ? resolveHeroRotatingIntervalMs(seconds * 1000)
                      : DEFAULT_HERO_ROTATING_INTERVAL_MS
                  })
                }}
                helperText='How long each word stays before sliding to the next.'
              />
            </Box>
          ) : null}
          <PropertyTextField
            label='Subtitle'
            value={props.subtitle}
            onChange={subtitle => update({ subtitle })}
            placeholder='Supporting text…'
            multiline
            rows={3}
          />
        </PropertySection>
        <PropertySection title='Call to action' collapsible defaultOpen>
          {hasPrimaryButton ? (
            <>
              <PropertyTextField
                label='Primary button'
                value={props.buttonText}
                onChange={buttonText => update({ buttonText })}
                placeholder='Get started'
              />
              <PageLinkField
                label='Primary link'
                value={props.buttonLink}
                onChange={buttonLink => update({ buttonLink })}
                placeholder='/page or https://…'
              />
              <PropertyRemoveButton
                label='Remove primary button'
                onClick={() => update({ buttonText: '', buttonLink: '#' })}
              />
            </>
          ) : (
            <PropertyAddButton
              label='Add primary button'
              onClick={() => update({ buttonText: 'Get started', buttonLink: '#' })}
            />
          )}
          {hasSecondaryButton ? (
            <>
              <PropertyTextField
                label='Secondary button'
                value={props.secondaryButtonText ?? ''}
                onChange={secondaryButtonText => update({ secondaryButtonText })}
                placeholder='See how it works'
              />
              <PageLinkField
                label='Secondary link'
                value={props.secondaryButtonLink ?? '#'}
                onChange={secondaryButtonLink => update({ secondaryButtonLink })}
                placeholder='/page or https://…'
              />
              <PropertyRemoveButton
                label='Remove secondary button'
                onClick={() => update({ secondaryButtonText: '', secondaryButtonLink: '#' })}
              />
            </>
          ) : (
            <PropertyAddButton
              label='Add secondary button'
              onClick={() => update({ secondaryButtonText: 'Learn more', secondaryButtonLink: '#' })}
            />
          )}
        </PropertySection>
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <HeroLayoutControls props={props} onUpdate={update} />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <HeroStyleControls props={props} accentColor={siteStyles.colors.accent} onUpdate={update} />
    </PropertyFields>
  )
}
