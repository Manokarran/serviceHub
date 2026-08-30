'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { ImageBlockProps } from '../../types'
import {
  getContinuousAnimationSx,
  getEntranceAnimationSx,
  getImageDeliveryWidth,
  getImageElementSx,
  getImageFrameSx,
  getMediaAspectRatio,
  getMediaOpacityFraction
} from '../../utils/mediaBlockHelpers'
import {
  getCroppedImageElementSx,
  getImageAdjustmentFilterSx,
  resolveBlockImageSrc,
  shouldApplyClientImageEdits
} from '../../utils/imageEditHelpers'
import { siteCanvasBelow } from '../../utils/siteResponsiveHelpers'
import { useSiteStyles } from '../SiteStylesScope'

type Props = {
  props: ImageBlockProps
}

export function ImageBlock({ props }: Props) {
  const theme = useTheme()
  const siteStyles = useSiteStyles()
  const hoverEffect = props.hoverEffect ?? siteStyles.misc.imageHoverEffect
  const aspectRatio = getMediaAspectRatio(siteStyles.misc)
  const hasFixedAspect = Boolean(aspectRatio)
  const frameSx = getImageFrameSx(siteStyles.misc, hoverEffect, props.borderRadius, props.naturalWidth)
  const opacity = getMediaOpacityFraction(props.opacity)
  const cornerRadius = props.borderRadius ?? siteStyles.misc.imageCornerRadius
  const deliveryWidth = getImageDeliveryWidth(props.naturalWidth)
  const optimizedSrc = props.src
    ? resolveBlockImageSrc({
        src: props.src,
        displayWidth: deliveryWidth,
        crop: props.crop,
        adjustments: props.adjustments,
        naturalWidth: props.naturalWidth,
        naturalHeight: props.naturalHeight,
        deliveryQuality: props.deliveryQuality
      })
    : ''

  const entranceAnimation = props.entranceAnimation ?? 'none'
  const continuousAnimation = props.continuousAnimation ?? 'none'

  const containerRef = useRef<HTMLDivElement>(null)
  const [hasEntered, setHasEntered] = useState(entranceAnimation === 'none')

  useEffect(() => {
    if (entranceAnimation === 'none') {
      setHasEntered(true)
      return
    }

    setHasEntered(false)

    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [entranceAnimation])

  const entranceSx = getEntranceAnimationSx(entranceAnimation, hasEntered)
  const continuousSx = getContinuousAnimationSx(continuousAnimation, opacity)
  const frameOpacity = continuousAnimation === 'breathe' ? undefined : opacity

  const imageFrameSx = {
    ...(frameOpacity !== undefined ? { opacity: frameOpacity } : {}),
    ...(frameSx as object),
    ...(continuousSx as object)
  }

  const useClientEdits = shouldApplyClientImageEdits({
    src: props.src,
    crop: props.crop,
    adjustments: props.adjustments
  })

  const imageSx = {
    ...getImageElementSx(hasFixedAspect),
    ...(useClientEdits ? getCroppedImageElementSx(props.crop) : {}),
    ...(useClientEdits ? getImageAdjustmentFilterSx(props.adjustments) : {})
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent:
          props.alignment === 'center'
            ? 'center'
            : props.alignment === 'right'
              ? 'flex-end'
              : 'flex-start',
        ...siteCanvasBelow({ px: 2, py: 1.5 }),
        ...entranceSx
      }}
    >
      {optimizedSrc ? (
        <Box sx={imageFrameSx}>
          <Box
            component='img'
            className='media-block-image'
            src={optimizedSrc}
            alt={props.alt || 'Image'}
            width={props.naturalWidth}
            height={props.naturalHeight}
            sx={imageSx}
          />
        </Box>
      ) : (
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            minHeight: 160,
            opacity,
            borderRadius: `${cornerRadius}px`,
            border: '1px dashed',
            borderColor: alpha(theme.palette.text.primary, 0.18),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.disabled',
            backgroundColor: alpha(theme.palette.text.primary, 0.03)
          }}
        >
          <Typography variant='body2'>Add an image in the properties panel</Typography>
        </Box>
      )}
    </Box>
  )
}
