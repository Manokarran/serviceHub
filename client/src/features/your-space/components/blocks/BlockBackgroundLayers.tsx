'use client'

import Box from '@mui/material/Box'

import type { BlockBackgroundProps } from '../../types'
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '@/lib/imagekit/urls'
import { useCachedMediaUrl } from '@/hooks/useCachedMediaUrl'
import {
  getBlockBackground,
  getBlockBackgroundOpacity,
  getPhotoLayerSx,
  isPhotoBackground,
  isSimpleColor,
  isVideoBackground,
  parseMediaUrl,
  SECTION_PHOTO_LAYER_CLASS
} from '../../utils/sectionStyleHelpers'

type Props = {
  props: BlockBackgroundProps
  photoOpacity: number
  fallbackColor?: string
}

export function BlockBackgroundLayers({ props, photoOpacity, fallbackColor = '#ffffff' }: Props) {
  const background = getBlockBackground(props, fallbackColor)
  const isVideo = isVideoBackground(props)
  const isPhoto = isPhotoBackground(props)
  const mediaUrl = isVideo || isPhoto ? parseMediaUrl(background) : null

  const deliveryUrl =
    mediaUrl && isVideo
      ? getOptimizedVideoUrl(mediaUrl)
      : mediaUrl && isPhoto
        ? getOptimizedImageUrl(mediaUrl)
        : null

  const cachedUrl = useCachedMediaUrl(deliveryUrl)

  if (mediaUrl && isVideo && cachedUrl) {
    return (
      <Box
        aria-hidden
        component='video'
        className={SECTION_PHOTO_LAYER_CLASS}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        src={cachedUrl}
        sx={{
          ...getPhotoLayerSx(photoOpacity),
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    )
  }

  if (mediaUrl && isPhoto && cachedUrl) {
    return (
      <Box
        aria-hidden
        className={SECTION_PHOTO_LAYER_CLASS}
        sx={getPhotoLayerSx(photoOpacity)}
        style={{ backgroundImage: `url(${cachedUrl})` }}
      />
    )
  }

  if (!isSimpleColor(background)) {
    const backgroundOpacity = getBlockBackgroundOpacity(props) / 100

    return (
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          opacity: backgroundOpacity
        }}
        style={{ background }}
      />
    )
  }

  return null
}
