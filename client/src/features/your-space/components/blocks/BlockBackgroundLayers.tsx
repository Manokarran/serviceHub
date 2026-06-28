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

  resolveBlockMediaUrl,

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

  const mediaUrl = resolveBlockMediaUrl(props, fallbackColor)



  const deliveryUrl =

    mediaUrl && isVideo

      ? getOptimizedVideoUrl(mediaUrl)

      : mediaUrl && isPhoto

        ? getOptimizedImageUrl(mediaUrl)

        : null



  const cachedVideoUrl = useCachedMediaUrl(isVideo ? deliveryUrl : null)

  const displayVideoUrl = cachedVideoUrl ?? deliveryUrl ?? mediaUrl



  if (mediaUrl && isVideo && displayVideoUrl) {

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

        src={displayVideoUrl}

        sx={{

          ...getPhotoLayerSx(photoOpacity),

          objectFit: 'cover',

          width: '100%',

          height: '100%'

        }}

      />

    )

  }



  if (mediaUrl && isPhoto && deliveryUrl) {

    return (

      <Box

        aria-hidden

        className={SECTION_PHOTO_LAYER_CLASS}

        sx={getPhotoLayerSx(photoOpacity)}

        style={{ backgroundImage: `url(${JSON.stringify(deliveryUrl)})` }}

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


