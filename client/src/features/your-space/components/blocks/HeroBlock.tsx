'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import type { HeroBlockProps } from '../../types'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { useSiteStyles } from '../SiteStylesScope'
import {
  getBlockBackground,
  getBlockBackgroundShellSx,
  getBlockBackgroundType,
  getPhotoAnimation,
  getPhotoOpacity,
  isPhotoBackground,
  isSimpleColor,
  isVideoBackground
} from '../../utils/sectionStyleHelpers'
import { getHeroTitleFontSize, getSiteButtonSx, normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { resolveHeroVisualColors } from '../../utils/heroVisualHelpers'
import { siteCanvasAbove, siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { BlockBackgroundLayers } from './BlockBackgroundLayers'
import { HeroVisualPanel } from './HeroVisualPanel'

type Props = {
  props: HeroBlockProps
}

function shouldShowSplitVisualPanel(props: HeroBlockProps): boolean {
  if (props.layout !== 'split-left' && props.layout !== 'split-right') {
    return false
  }

  return getBlockBackgroundType(props) === 'color' && isSimpleColor(getBlockBackground(props, '#6366f1'))
}

export function HeroBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const showButton = Boolean(props.buttonText) || editContext !== null
  const isSplit = props.layout === 'split-left' || props.layout === 'split-right'
  const contentFirst = props.layout !== 'split-right'
  const showSplitVisual = shouldShowSplitVisualPanel(props)
  const hasPhoto = isPhotoBackground(props)
  const hasVideo = isVideoBackground(props)
  const hasMedia = hasPhoto || hasVideo
  const photoOpacity = getPhotoOpacity(props)
  const photoAnimation = hasMedia ? getPhotoAnimation(props, siteStyles.misc.imageHoverEffect) : 'none'
  const background = getBlockBackground(props, '#6366f1')
  const buttonAccent = isSimpleColor(background) ? background : siteStyles.colors.accent
  const visualColors = resolveHeroVisualColors(props, siteStyles.colors.accent)

  const titleSx = {
    fontFamily: siteStyles.fonts.headingFamily,
    fontWeight: siteStyles.fonts.headingWeight,
    letterSpacing: siteStyles.fonts.headingLetterSpacing,
    fontSize: {
      xs: getHeroTitleFontSize(siteStyles.fonts, 'mobile'),
      md: getHeroTitleFontSize(siteStyles.fonts, 'desktop')
    },
    lineHeight: 1.15,
    color: 'inherit',
    maxWidth: 720,
    display: 'block'
  }

  const subtitleSx = {
    fontFamily: siteStyles.fonts.bodyFamily,
    fontWeight: siteStyles.fonts.bodyWeight,
    fontSize: Math.round(normalizeSiteFonts(siteStyles.fonts).bodySize * 1.125),
    opacity: 0.9,
    color: 'inherit',
    maxWidth: 560,
    lineHeight: 1.6,
    display: 'block'
  }

  const buttonLabelSx = { font: 'inherit', color: 'inherit' }

  const content = (
    <>
      <Typography variant='h2' sx={{ ...titleSx, mb: 2 }}>
        <InlineEditableText value={props.title} field='title' placeholder='Hero title' sx={titleSx} />
      </Typography>
      <Typography variant='h6' component='div' sx={{ ...subtitleSx, mb: 4 }}>
        <InlineEditableText
          value={props.subtitle}
          field='subtitle'
          multiline
          placeholder='Hero subtitle'
          sx={subtitleSx}
        />
      </Typography>
      {(showButton) && (
        <Button
          component='a'
          href={props.buttonLink || '#'}
          variant='contained'
          size='large'
          onClick={e => e.preventDefault()}
          sx={{
            ...getSiteButtonSx('primary', siteStyles, '#ffffff'),
            color: buttonAccent,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.92)', opacity: 1 }
          }}
        >
          <InlineEditableText value={props.buttonText} field='buttonText' placeholder='Button' sx={buttonLabelSx} />
        </Button>
      )}
    </>
  )

  const shellSx = {
    ...getBlockBackgroundShellSx(props, photoAnimation, photoOpacity, '#6366f1'),
    color: props.textColor
  }

  if (!isSplit) {
    return (
      <Box
        component='section'
        sx={{
          ...shellSx,
          display: 'flex',
          flexDirection: 'column',
          alignItems: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start',
          justifyContent: 'center',
          textAlign: props.alignment,
          minHeight: props.minHeight,
          px: 4,
          py: 8
        }}
      >
        <BlockBackgroundLayers props={props} photoOpacity={photoOpacity} fallbackColor='#6366f1' />
        <Box sx={{ position: 'relative', zIndex: 1 }}>{content}</Box>
      </Box>
    )
  }

  const splitRowDirection = contentFirst ? 'row' : 'row-reverse'
  const splitStackSx = {
    flexDirection: { xs: 'column', sm: splitRowDirection },
    ...siteCanvasBelow({ flexDirection: 'column' }),
    ...siteCanvasAbove({ flexDirection: splitRowDirection })
  } as const

  return (
    <Box
      component='section'
      sx={{
        ...shellSx,
        display: 'flex',
        ...splitStackSx,
        minHeight: props.minHeight
      }}
    >
      <BlockBackgroundLayers props={props} photoOpacity={photoOpacity} fallbackColor='#6366f1' />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          ...splitStackSx,
          flex: 1,
          minWidth: 0
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            textAlign: 'left',
            flex: 1,
            px: { xs: 2, sm: 4 },
            py: { xs: 4, sm: 8 },
            minWidth: 0
          }}
        >
          {content}
        </Box>
        {showSplitVisual && (
          <HeroVisualPanel
            animation={props.splitVisualAnimation}
            colorStart={visualColors.start}
            colorEnd={visualColors.end}
          />
        )}
      </Box>
    </Box>
  )
}
