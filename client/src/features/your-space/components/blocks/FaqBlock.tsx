'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import type { FaqBlockProps, FaqItem } from '../../types'
import { getHeroTitleGradientSx } from '../../utils/heroBlockHelpers'
import {
  ensureFaqItems,
  FAQ_MAX_WIDTH_MAP,
  getFaqCardSurfaceSx,
  getFaqExpandIcon,
  resolveFaqCardFill,
  updateFaqItem
} from '../../utils/faqBlockHelpers'
import { getHeroTitleFontSize, normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { siteCanvasAbove, siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { useSiteStyles } from '../SiteStylesScope'
import { ChromeBlockBackground } from './ChromeBlockBackground'

type Props = {
  props: FaqBlockProps
}

const FAQ_KEYFRAMES = {
  '@keyframes faqFadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  '@keyframes faqSlideUp': {
    from: { opacity: 0, transform: 'translateY(18px)' },
    to: { opacity: 1, transform: 'translateY(0)' }
  }
}

export function FaqBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const items = ensureFaqItems(props.items)
  const accent = props.accentColor?.trim() || siteStyles.colors.accent
  const textColor = props.textColor || siteStyles.colors.text
  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const maxWidth = FAQ_MAX_WIDTH_MAP[props.maxWidth ?? 'md']
  const isSplit = props.layout === 'split-header'

  const [openIds, setOpenIds] = useState<string[]>(() =>
    props.defaultOpenFirst && items[0] ? [items[0].id] : []
  )

  useEffect(() => {
    if (!props.defaultOpenFirst || items.length === 0) {
      return
    }

    setOpenIds(current => (current.length === 0 ? [items[0].id] : current))
  }, [props.defaultOpenFirst, items])

  const toggleItem = (id: string) => {
    setOpenIds(current => {
      const isOpen = current.includes(id)

      if (props.expandMode === 'single') {
        return isOpen ? [] : [id]
      }

      return isOpen ? current.filter(entry => entry !== id) : [...current, id]
    })
  }

  const updateItem = (itemId: string, changes: Partial<FaqItem>) => {
    editContext?.updateProps({ items: updateFaqItem(items, itemId, changes) })
  }

  const titleSx = {
    fontFamily: siteStyles.fonts.headingFamily,
    fontWeight: siteStyles.fonts.headingWeight,
    letterSpacing: siteStyles.fonts.headingLetterSpacing,
    fontSize: {
      xs: Math.round(getHeroTitleFontSize(siteStyles.fonts, 'mobile') * 0.68),
      md: Math.round(getHeroTitleFontSize(siteStyles.fonts, 'desktop') * 0.72)
    },
    lineHeight: 1.15,
    color: textColor,
    textAlign: isSplit ? 'left' : props.alignment,
    m: 0,
    ...getHeroTitleGradientSx(props.titleStyle, textColor, accent)
  }

  const header = (
    <Box
      sx={{
        width: '100%',
        maxWidth: isSplit ? 360 : 720,
        textAlign: isSplit ? 'left' : props.alignment,
        ...siteCanvasBelow({ maxWidth: '100%', textAlign: props.alignment })
      }}
    >
      {Boolean(props.eyebrow?.trim()) && (
        <Typography
          sx={{
            fontFamily: siteStyles.fonts.bodyFamily,
            fontSize: Math.round(fonts.bodySize * 0.78),
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
            mb: 1,
            textAlign: 'inherit'
          }}
        >
          <InlineEditableText
            value={props.eyebrow}
            placeholder='FAQ'
            onCommit={eyebrow => editContext?.updateProps({ eyebrow })}
          />
        </Typography>
      )}
      <Typography variant='h2' sx={titleSx}>
        <InlineEditableText
          value={props.title}
          placeholder='Frequently Asked Questions'
          onCommit={title => editContext?.updateProps({ title })}
          sx={titleSx}
        />
      </Typography>
      {Boolean(props.subtitle?.trim()) && (
        <Typography
          sx={{
            mt: 1.5,
            fontFamily: siteStyles.fonts.bodyFamily,
            fontSize: { xs: fonts.bodySize, md: Math.round(fonts.bodySize * 1.02) },
            lineHeight: 1.7,
            color: textColor,
            opacity: 0.74,
            textAlign: 'inherit'
          }}
        >
          <InlineEditableText
            value={props.subtitle}
            placeholder='Supporting copy'
            multiline
            onCommit={subtitle => editContext?.updateProps({ subtitle })}
          />
        </Typography>
      )}
    </Box>
  )

  const list = (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: `${props.gap}px`,
        flex: 1,
        minWidth: 0
      }}
    >
      {items.map((item, index) => (
        <FaqRow
          key={item.id}
          item={item}
          index={index}
          open={openIds.includes(item.id)}
          props={props}
          accent={accent}
          textColor={textColor}
          onToggle={() => toggleItem(item.id)}
          onUpdateItem={updateItem}
        />
      ))}
    </Box>
  )

  return (
    <ChromeBlockBackground
      props={props}
      fallbackColor='#ffffff'
      component='section'
      sx={{
        ...FAQ_KEYFRAMES,
        py: `${props.paddingY}px`,
        px: `${props.paddingX}px`,
        color: textColor,
        ...siteCanvasBelow({
          ...(props.paddingX > 20 ? { px: `${Math.min(props.paddingX, 20)}px` } : {}),
          ...(props.paddingY > 56 ? { py: `${Math.min(props.paddingY, 56)}px` } : {})
        })
      }}
      contentSx={{
        width: '100%',
        maxWidth,
        mx: props.maxWidth === 'full' ? 0 : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: props.alignment === 'left' ? 'flex-start' : props.alignment === 'right' ? 'flex-end' : 'center',
        gap: 3,
        ...(isSplit
          ? {
              ...siteCanvasAbove({
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 5,
                maxWidth: FAQ_MAX_WIDTH_MAP.lg
              }),
              ...siteCanvasBelow({
                flexDirection: 'column',
                alignItems: props.alignment === 'left' ? 'flex-start' : props.alignment === 'right' ? 'flex-end' : 'center'
              })
            }
          : {})
      }}
    >
      {header}
      {list}
    </ChromeBlockBackground>
  )
}

function FaqRow({
  item,
  index,
  open,
  props,
  accent,
  textColor,
  onToggle,
  onUpdateItem
}: {
  item: FaqItem
  index: number
  open: boolean
  props: FaqBlockProps
  accent: string
  textColor: string
  onToggle: () => void
  onUpdateItem: (itemId: string, changes: Partial<FaqItem>) => void
}) {
  const surface = getFaqCardSurfaceSx({
    cardStyle: props.cardStyle,
    fill: resolveFaqCardFill(props),
    accent,
    textColor,
    borderColor: props.cardBorderColor,
    borderWidth: props.cardBorderWidth ?? 1,
    shadow: props.cardShadow ?? 'soft'
  })

  const icon = getFaqExpandIcon(props.iconStyle, open)
  const rotateIcon = props.iconStyle !== 'plus'

  return (
    <Box
      sx={{
        borderRadius: `${props.cardRadius}px`,
        overflow: 'hidden',
        ...surface,
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        animation: getEntranceAnimation(props.entranceAnimation, index)
      }}
    >
      <Box
        component='button'
        type='button'
        aria-expanded={open}
        onClick={event => {
          const target = event.target as HTMLElement

          if (target.closest('input, textarea, [data-inline-editing]')) {
            return
          }

          onToggle()
        }}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          border: 'none',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          textAlign: 'left',
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.75, sm: 2 },
          minHeight: 56,
          '&:hover': {
            backgroundColor: alpha(accent, 0.06)
          },
          '&:focus-visible': {
            outline: `2px solid ${alpha(accent, 0.55)}`,
            outlineOffset: -2
          }
        }}
      >
        <Typography
          component='span'
          sx={{
            fontWeight: 600,
            fontSize: { xs: 15, sm: 16 },
            lineHeight: 1.4,
            color: textColor,
            flex: 1,
            minWidth: 0
          }}
        >
          <InlineEditableText
            value={item.question}
            placeholder='Question'
            onCommit={question => onUpdateItem(item.id, { question })}
            sx={{ font: 'inherit', color: 'inherit', fontWeight: 'inherit' }}
          />
        </Typography>
        <Box
          component='i'
          className={icon}
          aria-hidden
          sx={{
            flexShrink: 0,
            fontSize: 20,
            color: accent,
            opacity: 0.9,
            transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
            transform: rotateIcon && open ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </Box>
      <Collapse in={open} timeout={240} unmountOnExit={false}>
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            pb: { xs: 2, sm: 2.25 },
            pt: 0
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 15 },
              lineHeight: 1.7,
              color: textColor,
              opacity: 0.78,
              pr: { sm: 4 }
            }}
          >
            <InlineEditableText
              value={item.answer}
              placeholder='Answer'
              multiline
              onCommit={answer => onUpdateItem(item.id, { answer })}
              sx={{ font: 'inherit', color: 'inherit' }}
            />
          </Typography>
        </Box>
      </Collapse>
    </Box>
  )
}

function getEntranceAnimation(kind: FaqBlockProps['entranceAnimation'], index: number) {
  if (kind === 'none') {
    return 'none'
  }

  const name = kind === 'fade-in' ? 'faqFadeIn' : 'faqSlideUp'

  return `${name} 0.5s ease ${index * 0.06}s both`
}
