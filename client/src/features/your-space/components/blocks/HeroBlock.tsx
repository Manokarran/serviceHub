'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import type { HeroBlockProps } from '../../types'
import { InlineEditableText } from '../inline/InlineEditableText'
import { SitePageLink } from '../SitePageLink'
import { useSiteStyles } from '../SiteStylesScope'
import {
  getBlockBackground,
  getBlockBackgroundShellSx,
  getBlockFillOpacity,
  getPhotoAnimation,
  shouldRenderBlockBackgroundLayers,
  isSimpleColor
} from '../../utils/sectionStyleHelpers'
import { getHeroTitleFontSize, normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import {
  getHeroContentSurfaceSx,
  getHeroMediaOverlaySx,
  getHeroPrimaryButtonSx,
  getHeroPrimaryButtonVariant,
  getHeroSecondaryButtonSx,
  getHeroSecondaryButtonVariant,
  getHeroTitleGradientSx,
  HERO_MAX_WIDTH_MAP,
  heroHasMediaBackground,
  shouldRenderHeroBackgroundVisual,
  shouldShowHeroSplitVisualPanel
} from '../../utils/heroBlockHelpers'
import { isHeroRotatingTitleActive } from '../../utils/heroRotatingWords'
import { resolveHeroVisualColors } from '../../utils/heroVisualHelpers'
import { siteCanvasAbove, siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { BlockBackgroundLayers } from './BlockBackgroundLayers'
import { HeroRotatingTitle } from './HeroRotatingTitle'
import { HeroVisualPanel } from './HeroVisualPanel'

type Props = {
  props: HeroBlockProps
}

function HeroContent({
  props,
  siteStyles,
  buttonAccent,
  alignItems,
  textAlign
}: {
  props: HeroBlockProps
  siteStyles: ReturnType<typeof useSiteStyles>
  buttonAccent: string
  alignItems: 'flex-start' | 'center' | 'flex-end'
  textAlign: HeroBlockProps['alignment']
}) {
  const showPrimaryButton = Boolean(props.buttonText?.trim())
  const showSecondaryButton = Boolean(props.secondaryButtonText?.trim())
  const showEyebrow = Boolean(props.eyebrow?.trim())
  const rotatingTitle = isHeroRotatingTitleActive(props)
  const titleGradientSx = rotatingTitle
    ? {}
    : getHeroTitleGradientSx(props.titleStyle, props.textColor, siteStyles.colors.accent)

  const titleSx = {
    fontFamily: siteStyles.fonts.headingFamily,
    fontWeight: siteStyles.fonts.headingWeight,
    letterSpacing: siteStyles.fonts.headingLetterSpacing,
    fontSize: {
      xs: getHeroTitleFontSize(siteStyles.fonts, 'mobile'),
      md: getHeroTitleFontSize(siteStyles.fonts, 'desktop')
    },
    lineHeight: 1.05,
    color: 'inherit',
    maxWidth: '100%',
    display: 'block',
    ...titleGradientSx
  }

  const subtitleSx = {
    fontFamily: siteStyles.fonts.bodyFamily,
    fontWeight: siteStyles.fonts.bodyWeight,
    fontSize: {
      xs: Math.round(normalizeSiteFonts(siteStyles.fonts).bodySize * 1.05),
      md: Math.round(normalizeSiteFonts(siteStyles.fonts).bodySize * 1.2)
    },
    opacity: 0.88,
    color: 'inherit',
    maxWidth: 620,
    lineHeight: 1.65,
    display: 'block'
  }

  const eyebrowSx = {
    display: 'inline-flex',
    alignItems: 'center',
    px: 1.5,
    py: 0.5,
    mb: 2.5,
    borderRadius: 999,
    fontFamily: siteStyles.fonts.bodyFamily,
    fontSize: Math.round(normalizeSiteFonts(siteStyles.fonts).bodySize * 0.78),
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: 'inherit',
    opacity: 0.92,
    border: '1px solid rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)'
  }

  const buttonLabelSx = { font: 'inherit', color: 'inherit' }
  const contentSurfaceSx = getHeroContentSurfaceSx(props.contentSurface)
  const hasSurface = props.contentSurface === 'glass'

  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems,
        textAlign,
        ...(hasSurface && {
          ...contentSurfaceSx,
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 3, md: 4 }
        })
      }}
    >
      {showEyebrow && (
        <Box component='span' sx={eyebrowSx}>
          <InlineEditableText
            value={props.eyebrow ?? ''}
            field='eyebrow'
            placeholder='Eyebrow label'
            sx={{ borderRadius: 'inherit' }}
          />
        </Box>
      )}

      <Typography variant='h2' sx={{ ...titleSx, mb: 2 }}>
        {rotatingTitle ? (
          <HeroRotatingTitle
            title={props.title}
            words={props.rotatingWords ?? []}
            intervalMs={props.rotatingWordIntervalMs}
            accentColor={siteStyles.colors.accent}
          />
        ) : (
          <InlineEditableText value={props.title} field='title' placeholder='Hero title' sx={titleSx} />
        )}
      </Typography>

      <Typography variant='h6' component='div' sx={{ ...subtitleSx, mb: showPrimaryButton || showSecondaryButton ? 4 : 0 }}>
        <InlineEditableText
          value={props.subtitle}
          field='subtitle'
          multiline
          placeholder='Hero subtitle'
          sx={subtitleSx}
        />
      </Typography>

      {(showPrimaryButton || showSecondaryButton) && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: alignItems === 'center' ? 'center' : alignItems === 'flex-end' ? 'flex-end' : 'flex-start'
          }}
        >
          {showPrimaryButton && (
            <Button
              component={SitePageLink}
              href={props.buttonLink || '#'}
              variant={getHeroPrimaryButtonVariant(props.buttonStyle, siteStyles)}
              size='large'
              sx={getHeroPrimaryButtonSx(props.buttonStyle, siteStyles, buttonAccent, props.textColor)}
            >
              <InlineEditableText value={props.buttonText} field='buttonText' placeholder='Primary button' sx={buttonLabelSx} />
            </Button>
          )}
          {showSecondaryButton && (
            <Button
              component={SitePageLink}
              href={props.secondaryButtonLink || '#'}
              variant={getHeroSecondaryButtonVariant(props.buttonStyle, siteStyles)}
              size='large'
              sx={getHeroSecondaryButtonSx(props.buttonStyle, siteStyles, buttonAccent, props.textColor)}
            >
              <InlineEditableText
                value={props.secondaryButtonText ?? ''}
                field='secondaryButtonText'
                placeholder='Secondary button'
                sx={buttonLabelSx}
              />
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}

export function HeroBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const isSplit = props.layout === 'split-left' || props.layout === 'split-right'
  const contentFirst = props.layout !== 'split-right'
  const showSplitVisual = shouldShowHeroSplitVisualPanel(props)
  const showBackgroundVisual = shouldRenderHeroBackgroundVisual(props)
  const hasMedia = heroHasMediaBackground(props)
  const fillOpacity = getBlockFillOpacity(props)
  const photoAnimation = hasMedia ? getPhotoAnimation(props, siteStyles.misc.imageHoverEffect) : 'none'
  const showStaticBackgroundLayers = shouldRenderBlockBackgroundLayers(props)
  const background = getBlockBackground(props, '#6366f1')
  const buttonAccent = isSimpleColor(background) ? background : siteStyles.colors.accent
  const visualColors = resolveHeroVisualColors(props, siteStyles.colors.accent)
  const maxWidth = HERO_MAX_WIDTH_MAP[props.contentMaxWidth ?? 'lg']
  const paddingX = props.contentPaddingX ?? 32
  const paddingY = props.contentPaddingY ?? 64
  const splitRatio = props.splitRatio ?? 50
  const verticalAlign = props.verticalAlign ?? 'center'
  const alignItems =
    props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
  const mediaOverlaySx = getHeroMediaOverlaySx(props.mediaOverlay, hasMedia)

  const shellSx = {
    ...getBlockBackgroundShellSx(props, photoAnimation, fillOpacity, '#6366f1', {
      fillEnabled: showStaticBackgroundLayers
    }),
    color: props.textColor,
    position: 'relative' as const,
    overflow: 'hidden' as const
  }

  const centeredShellSx = {
    ...shellSx,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems,
    justifyContent: verticalAlign === 'bottom' ? 'flex-end' : 'center',
    textAlign: props.alignment,
    minHeight: props.minHeight,
    px: `${paddingX}px`,
    py: `${paddingY}px`
  }

  if (!isSplit) {
    return (
      <Box component='section' sx={centeredShellSx}>
        {showBackgroundVisual && (
          <HeroVisualPanel
            animation={props.splitVisualAnimation}
            colorStart={visualColors.start}
            colorEnd={visualColors.end}
            mode='section-background'
          />
        )}
        {showStaticBackgroundLayers && (
          <BlockBackgroundLayers props={props} photoOpacity={fillOpacity} fallbackColor='#6366f1' />
        )}
        {mediaOverlaySx && <Box aria-hidden sx={mediaOverlaySx} />}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: typeof maxWidth === 'number' ? maxWidth : maxWidth,
            mx: props.contentMaxWidth === 'full' ? 0 : 'auto'
          }}
        >
          <HeroContent
            props={props}
            siteStyles={siteStyles}
            buttonAccent={buttonAccent}
            alignItems={alignItems}
            textAlign={props.alignment}
          />
        </Box>
      </Box>
    )
  }

  const splitRowDirection = contentFirst ? 'row' : 'row-reverse'
  const splitStackSx = {
    flexDirection: { xs: 'column', sm: splitRowDirection },
    ...siteCanvasBelow({ flexDirection: 'column' }),
    ...siteCanvasAbove({ flexDirection: splitRowDirection })
  } as const
  const contentFlex = splitRatio / 100
  const visualFlex = 1 - contentFlex

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
      {showStaticBackgroundLayers && (
        <BlockBackgroundLayers props={props} photoOpacity={fillOpacity} fallbackColor='#6366f1' />
      )}
      {mediaOverlaySx && <Box aria-hidden sx={mediaOverlaySx} />}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          ...splitStackSx,
          flex: 1,
          minWidth: 0,
          width: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: verticalAlign === 'bottom' ? 'flex-end' : 'center',
            textAlign: 'left',
            flex: { xs: 1, sm: contentFlex },
            px: { xs: 2, sm: `${Math.max(paddingX, 24)}px` },
            py: { xs: 4, sm: `${paddingY}px` },
            minWidth: 0
          }}
        >
          <HeroContent
            props={props}
            siteStyles={siteStyles}
            buttonAccent={buttonAccent}
            alignItems='flex-start'
            textAlign='left'
          />
        </Box>
        {showSplitVisual && (
          <Box sx={{ flex: { xs: 0, sm: visualFlex }, minWidth: 0, display: { xs: 'none', sm: 'flex' } }}>
            <HeroVisualPanel
              animation={props.splitVisualAnimation}
              colorStart={visualColors.start}
              colorEnd={visualColors.end}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}
