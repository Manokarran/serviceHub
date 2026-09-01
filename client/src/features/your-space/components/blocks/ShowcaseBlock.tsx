'use client'

import { type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { getDisplayImageUrl } from '@/lib/imagekit/urls'
import type { ShowcaseBlockProps, ShowcaseItem } from '../../types'
import {
  getHeroMediaOverlaySx,
  getHeroPrimaryButtonSx,
  getHeroPrimaryButtonVariant,
  getHeroTitleGradientSx
} from '../../utils/heroBlockHelpers'
import { resolveHeroVisualColors } from '../../utils/heroVisualHelpers'
import {
  getBlockBackgroundShellSx,
  getBlockFillOpacity,
  getPhotoAnimation,
  isSimpleColor,
  shouldRenderBlockBackgroundLayers
} from '../../utils/sectionStyleHelpers'
import { getMediaHoverSx } from '../../utils/mediaBlockHelpers'
import {
  getVisibleShowcaseItems,
  isLayeredShowcase,
  resolveShowcaseVisualKind,
  SHOWCASE_MAX_WIDTH_MAP,
  updateShowcaseItem
} from '../../utils/showcaseBlockHelpers'
import { getHeroTitleFontSize, normalizeSiteFonts } from '../../utils/siteStylesHelpers'
import { siteCanvasAbove, siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useCanvasBlockEdit } from '../inline/CanvasBlockEditContext'
import { SitePageLink } from '../SitePageLink'
import { useSiteStyles } from '../SiteStylesScope'
import { BlockBackgroundLayers } from './BlockBackgroundLayers'
import { HeroVisualPanel } from './HeroVisualPanel'
import { ShowcaseItemEditor } from './ShowcaseItemEditor'

type Props = {
  props: ShowcaseBlockProps
}

function useShowcaseItemUpdater(items: ShowcaseItem[]) {
  const editContext = useCanvasBlockEdit()

  return (itemId: string, changes: Partial<ShowcaseItem>) => {
    editContext?.updateProps({ items: updateShowcaseItem(items, itemId, changes) })
  }
}

function ShowcaseVisual({
  item,
  minHeight,
  radius,
  overlay,
  accentColor,
  hoverEffect,
  alwaysOverlay = false
}: {
  item: ShowcaseItem
  minHeight: number
  radius: number
  overlay: ShowcaseBlockProps['mediaOverlay']
  accentColor: string
  hoverEffect: Parameters<typeof getMediaHoverSx>[0]
  alwaysOverlay?: boolean
}) {
  const kind = resolveShowcaseVisualKind(item)
  const visualColors = resolveHeroVisualColors(item, accentColor)
  const imageSrc = item.imageSrc?.trim() ? getDisplayImageUrl(item.imageSrc, 1400, { quality: 92 }) : ''
  const logoSrc = item.logoSrc?.trim() ? getDisplayImageUrl(item.logoSrc, 640, { quality: 92 }) : ''
  const overlaySx = alwaysOverlay || kind === 'image' ? getHeroMediaOverlaySx(overlay ?? 'gradient', true) : null

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight,
        height: '100%',
        width: '100%',
        borderRadius: `${radius}px`,
        backgroundColor: alpha(accentColor, 0.08),
        boxShadow: radius > 0 ? '0 20px 48px rgba(15, 23, 42, 0.12)' : 'none',
        ...(kind === 'image' ? getMediaHoverSx(hoverEffect) : {})
      }}
    >
      {kind === 'image' && imageSrc && (
        <Box
          component='img'
          className='media-block-image'
          src={imageSrc}
          alt={item.imageAlt || item.title}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
        />
      )}
      {kind === 'logo' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 4,
            background: `linear-gradient(160deg, ${alpha(visualColors.start, 0.16)} 0%, ${alpha(visualColors.end, 0.28)} 100%)`
          }}
        >
          {logoSrc ? (
            <Box
              component='img'
              src={logoSrc}
              alt={item.logoAlt || item.logoText || 'Logo'}
              sx={{ maxWidth: '56%', maxHeight: '46%', objectFit: 'contain' }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: { xs: 28, md: 40 },
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: visualColors.start
              }}
            >
              {item.logoText}
            </Typography>
          )}
        </Box>
      )}
      {kind === 'animation' && (
        <HeroVisualPanel
          animation={item.splitVisualAnimation}
          colorStart={visualColors.start}
          colorEnd={visualColors.end}
          mode='section-background'
        />
      )}
      {overlaySx && <Box aria-hidden sx={overlaySx} />}
    </Box>
  )
}

function ShowcaseCopy({
  item,
  items,
  props,
  siteStyles,
  buttonAccent,
  overlayMode = false
}: {
  item: ShowcaseItem
  items: ShowcaseItem[]
  props: ShowcaseBlockProps
  siteStyles: ReturnType<typeof useSiteStyles>
  buttonAccent: string
  overlayMode?: boolean
}) {
  const updateItem = useShowcaseItemUpdater(items)
  const textColor = props.textColor
  const alignItems =
    props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
  const fonts = normalizeSiteFonts(siteStyles.fonts)
  const titleGradientSx = getHeroTitleGradientSx(props.titleStyle, textColor, siteStyles.colors.accent)
  const showEyebrow = Boolean(item.eyebrow?.trim())
  const showButton = Boolean(item.buttonText?.trim())
  const showLogo = Boolean(item.logoSrc?.trim() || item.logoText?.trim())
  const titleSx = {
    fontFamily: siteStyles.fonts.headingFamily,
    fontWeight: siteStyles.fonts.headingWeight,
    letterSpacing: siteStyles.fonts.headingLetterSpacing,
    fontSize: overlayMode
      ? { xs: 26, md: 34 }
      : {
          xs: Math.round(getHeroTitleFontSize(siteStyles.fonts, 'mobile') * 0.72),
          md: Math.round(getHeroTitleFontSize(siteStyles.fonts, 'desktop') * 0.78)
        },
    lineHeight: 1.08,
    color: textColor,
    display: 'block' as const,
    ...titleGradientSx
  }
  const bodySx = {
    fontFamily: siteStyles.fonts.bodyFamily,
    fontWeight: siteStyles.fonts.bodyWeight,
    fontSize: {
      xs: fonts.bodySize,
      md: Math.round(fonts.bodySize * 1.08)
    },
    lineHeight: 1.7,
    color: textColor,
    opacity: overlayMode ? 0.92 : 0.78,
    maxWidth: overlayMode ? '100%' : 520,
    display: 'block' as const
  }

  const logoMark = showLogo ? (
    item.logoSrc?.trim() ? (
      <Box
        component='img'
        src={getDisplayImageUrl(item.logoSrc, overlayMode ? 160 : 240, { quality: 92 })}
        alt={item.logoAlt || item.logoText || 'Logo'}
        sx={{
          maxHeight: overlayMode ? 28 : 40,
          maxWidth: overlayMode ? 120 : 168,
          width: 'auto',
          height: 'auto',
          display: 'block',
          objectFit: 'contain'
        }}
      />
    ) : (
      <Typography
        component='span'
        sx={{
          fontFamily: siteStyles.fonts.headingFamily,
          fontWeight: 600,
          fontSize: overlayMode ? 12 : 13,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: textColor
        }}
      >
        <InlineEditableText
          value={item.logoText}
          placeholder='Logo'
          onCommit={logoText => updateItem(item.id, { logoText })}
          sx={{ font: 'inherit', color: 'inherit', letterSpacing: 'inherit' }}
        />
      </Typography>
    )
  ) : null

  const eyebrow = showEyebrow ? (
    <Typography
      component='span'
      sx={{
        fontFamily: siteStyles.fonts.bodyFamily,
        fontSize: Math.round(fonts.bodySize * 0.78),
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: textColor,
        opacity: 0.72
      }}
    >
      <InlineEditableText
        value={item.eyebrow}
        placeholder='Eyebrow'
        onCommit={eyebrowText => updateItem(item.id, { eyebrow: eyebrowText })}
        sx={{ font: 'inherit', color: 'inherit', letterSpacing: 'inherit' }}
      />
    </Typography>
  ) : null

  const title = (
    <Typography variant='h2' sx={{ ...titleSx, mb: 0 }}>
      <InlineEditableText
        value={item.title}
        placeholder='Title'
        onCommit={titleText => updateItem(item.id, { title: titleText })}
        sx={titleSx}
      />
    </Typography>
  )

  const body = (
    <Typography component='div' sx={bodySx}>
      <InlineEditableText
        value={item.body}
        placeholder='Supporting text'
        multiline
        onCommit={bodyText => updateItem(item.id, { body: bodyText })}
        sx={bodySx}
      />
    </Typography>
  )

  const action = showButton ? (
    <Button
      component={SitePageLink}
      href={item.buttonLink || '#'}
      variant={getHeroPrimaryButtonVariant(props.buttonStyle, siteStyles)}
      size='large'
      sx={{
        ...getHeroPrimaryButtonSx(props.buttonStyle, siteStyles, buttonAccent, textColor),
        mt: overlayMode ? 0.5 : 1,
        alignSelf: alignItems
      }}
    >
      <InlineEditableText
        value={item.buttonText}
        placeholder='Button'
        onCommit={buttonText => updateItem(item.id, { buttonText })}
        sx={{ font: 'inherit', color: 'inherit' }}
      />
    </Button>
  ) : null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems,
        textAlign: props.alignment,
        justifyContent: overlayMode ? 'space-between' : 'flex-start',
        gap: overlayMode ? 1.25 : 2,
        width: '100%',
        height: overlayMode ? '100%' : 'auto',
        flex: overlayMode ? 1 : undefined,
        position: 'relative',
        zIndex: 1
      }}
    >
      {(logoMark || (overlayMode && eyebrow)) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems, gap: overlayMode ? 1 : 1.25 }}>
          {logoMark}
          {overlayMode ? eyebrow : null}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems, gap: overlayMode ? 1.25 : 2, mt: overlayMode ? 'auto' : 0 }}>
        {overlayMode ? null : eyebrow}
        {title}
        {body}
        {action}
      </Box>
    </Box>
  )
}

function ShowcaseLayeredCard({
  item,
  items,
  props,
  siteStyles,
  buttonAccent,
  minHeight
}: {
  item: ShowcaseItem
  items: ShowcaseItem[]
  props: ShowcaseBlockProps
  siteStyles: ReturnType<typeof useSiteStyles>
  buttonAccent: string
  minHeight: number
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        minHeight,
        height: '100%',
        borderRadius: `${props.mediaRadius}px`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <ShowcaseVisual
          item={item}
          minHeight={minHeight}
          radius={0}
          overlay={props.mediaOverlay}
          accentColor={siteStyles.colors.accent}
          hoverEffect={siteStyles.misc.imageHoverEffect}
          alwaysOverlay
        />
      </Box>
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 2.5, md: 3.5 },
          minHeight
        }}
      >
        <ShowcaseCopy
          item={item}
          items={items}
          props={props}
          siteStyles={siteStyles}
          buttonAccent={buttonAccent}
          overlayMode
        />
      </Box>
    </Box>
  )
}

function ShowcaseStackedCard({
  item,
  items,
  props,
  siteStyles,
  buttonAccent
}: {
  item: ShowcaseItem
  items: ShowcaseItem[]
  props: ShowcaseBlockProps
  siteStyles: ReturnType<typeof useSiteStyles>
  buttonAccent: string
}) {
  const visualFirst = props.mediaSide !== 'end'
  const visual = (
    <ShowcaseVisual
      item={item}
      minHeight={220}
      radius={Math.max(16, props.mediaRadius - 8)}
      overlay={props.mediaOverlay}
      accentColor={siteStyles.colors.accent}
      hoverEffect={siteStyles.misc.imageHoverEffect}
    />
  )
  const copy = (
    <Box sx={{ px: 0.5, py: 0.5 }}>
      <ShowcaseCopy
        item={item}
        items={items}
        props={props}
        siteStyles={siteStyles}
        buttonAccent={buttonAccent}
      />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
      {visualFirst ? (
        <>
          <Box sx={{ minHeight: 220, aspectRatio: '16 / 10' }}>{visual}</Box>
          {copy}
        </>
      ) : (
        <>
          {copy}
          <Box sx={{ minHeight: 220, aspectRatio: '16 / 10' }}>{visual}</Box>
        </>
      )}
    </Box>
  )
}

function ShowcaseSplitLayout({
  item,
  items,
  props,
  siteStyles,
  buttonAccent
}: {
  item: ShowcaseItem
  items: ShowcaseItem[]
  props: ShowcaseBlockProps
  siteStyles: ReturnType<typeof useSiteStyles>
  buttonAccent: string
}) {
  const contentFirst = props.mediaSide === 'end'
  const splitRowDirection = contentFirst ? 'row' : 'row-reverse'
  const contentFlex = props.splitRatio / 100
  const visualFlex = 1 - contentFlex
  const splitStackSx = {
    flexDirection: { xs: 'column', sm: splitRowDirection },
    ...siteCanvasBelow({ flexDirection: 'column' }),
    ...siteCanvasAbove({ flexDirection: splitRowDirection })
  } as const

  return (
    <Box
      sx={{
        display: 'flex',
        ...splitStackSx,
        gap: { xs: 3, md: `${props.gap}px` },
        alignItems: 'stretch',
        minHeight: props.minHeight
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: { xs: '1 1 auto', sm: contentFlex },
          minWidth: 0,
          py: { xs: 1, md: 2 }
        }}
      >
        <ShowcaseCopy
          item={item}
          items={items}
          props={props}
          siteStyles={siteStyles}
          buttonAccent={buttonAccent}
        />
      </Box>
      <Box
        sx={{
          flex: { xs: '1 1 auto', sm: visualFlex },
          minWidth: 0,
          minHeight: { xs: Math.min(props.minHeight, 320), sm: props.minHeight }
        }}
      >
        <ShowcaseVisual
          item={item}
          minHeight={props.minHeight}
          radius={props.mediaRadius}
          overlay={props.mediaOverlay}
          accentColor={siteStyles.colors.accent}
          hoverEffect={siteStyles.misc.imageHoverEffect}
        />
      </Box>
    </Box>
  )
}

export function ShowcaseBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const editContext = useCanvasBlockEdit()
  const updateItem = useShowcaseItemUpdater(props.items)
  const items = getVisibleShowcaseItems(props)
  const fillOpacity = getBlockFillOpacity(props)
  const showStaticBackgroundLayers = shouldRenderBlockBackgroundLayers(props)
  const photoAnimation = getPhotoAnimation(props, siteStyles.misc.imageHoverEffect)
  const background = props.background || 'transparent'
  const buttonAccent = isSimpleColor(background) && background !== 'transparent' ? background : siteStyles.colors.accent
  const maxWidth = SHOWCASE_MAX_WIDTH_MAP[props.maxWidth ?? 'lg']
  const layered = isLayeredShowcase(props)

  const shellSx = {
    ...getBlockBackgroundShellSx(props, photoAnimation, fillOpacity, '#ffffff', {
      fillEnabled: showStaticBackgroundLayers
    }),
    color: props.textColor,
    position: 'relative' as const,
    overflow: editContext ? 'visible' : ('hidden' as const),
    py: `${props.paddingY}px`,
    px: `${props.paddingX}px`,
    ...siteCanvasBelow({
      ...(props.paddingX > 24 ? { px: `${Math.min(props.paddingX, 24)}px` } : {})
    })
  }

  const wrapItem = (item: ShowcaseItem, index: number, child: ReactNode) => (
    <ShowcaseItemEditor
      key={item.id}
      item={item}
      index={index}
      onChange={changes => updateItem(item.id, changes)}
    >
      {child}
    </ShowcaseItemEditor>
  )

  const inner = (() => {
    if (props.layout === 'split') {
      return wrapItem(
        items[0],
        0,
        <ShowcaseSplitLayout
          item={items[0]}
          items={props.items}
          props={props}
          siteStyles={siteStyles}
          buttonAccent={buttonAccent}
        />
      )
    }

    if (props.layout === 'stack') {
      if (layered) {
        return wrapItem(
          items[0],
          0,
          <ShowcaseLayeredCard
            item={items[0]}
            items={props.items}
            props={props}
            siteStyles={siteStyles}
            buttonAccent={buttonAccent}
            minHeight={props.minHeight}
          />
        )
      }

      return (
        <Box sx={{ maxWidth: 760, mx: props.alignment === 'center' ? 'auto' : 0 }}>
          {wrapItem(
            items[0],
            0,
            <ShowcaseStackedCard
              item={items[0]}
              items={props.items}
              props={props}
              siteStyles={siteStyles}
              buttonAccent={buttonAccent}
            />
          )}
        </Box>
      )
    }

    const columns = Math.max(1, Math.min(3, props.columns ?? 3))

    return (
      <Box
        sx={{
          display: 'grid',
          gap: `${props.gap}px`,
          gridTemplateColumns: { xs: '1fr', md: `repeat(${columns}, minmax(0, 1fr))` },
          ...siteCanvasBelow({ gridTemplateColumns: '1fr' }),
          ...siteCanvasAbove({ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` })
        }}
      >
        {items.map((item, index) =>
          wrapItem(
            item,
            index,
            layered ? (
              <ShowcaseLayeredCard
                item={item}
                items={props.items}
                props={props}
                siteStyles={siteStyles}
                buttonAccent={buttonAccent}
                minHeight={Math.max(360, props.minHeight - 80)}
              />
            ) : (
              <ShowcaseStackedCard
                item={item}
                items={props.items}
                props={props}
                siteStyles={siteStyles}
                buttonAccent={buttonAccent}
              />
            )
          )
        )}
      </Box>
    )
  })()

  return (
    <Box component='section' sx={shellSx}>
      {showStaticBackgroundLayers && (
        <Box aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <BlockBackgroundLayers props={props} photoOpacity={fillOpacity} fallbackColor='#ffffff' />
        </Box>
      )}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: typeof maxWidth === 'number' ? maxWidth : maxWidth,
          mx: props.maxWidth === 'full' ? 0 : 'auto'
        }}
      >
        {inner}
      </Box>
    </Box>
  )
}
