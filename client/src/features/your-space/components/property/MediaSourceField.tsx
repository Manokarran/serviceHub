'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { MediaUploadZone } from '@/components/builder/MediaUploadZone'
import { getImageKitThumbnailUrl } from '@/lib/imagekit/urls'
import { BUILDER_TYPOGRAPHY } from '../../constants/builderLayout'
import { buildVideoEmbedUrl, parseVideoUrl } from '../../utils/videoUrlHelpers'
import { CompactButton, PropertyFieldLabel } from './PropertyPanelUi'

type Props = {
  label?: string
  value: string
  onChange: (url: string, dimensions?: { width: number; height: number }) => void
  acceptVideo?: boolean
  clearLabel?: string
  urlPlaceholder?: string
}

export function MediaSourceField({
  label = 'Media',
  value,
  onChange,
  acceptVideo = false,
  clearLabel = 'Remove',
  urlPlaceholder = 'https://…'
}: Props) {
  const theme = useTheme()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const parsedVideo = parseVideoUrl(value)
  const embedPreviewUrl =
    parsedVideo.type !== 'file' && value
      ? buildVideoEmbedUrl(parsedVideo, { autoplay: false, muted: true, loop: false, controls: true })
      : null
  const isDirectVideo = Boolean(value?.match(/\.(mp4|webm|mov)(\?|#|$)/i))
  const previewUrl = value
    ? embedPreviewUrl
      ? embedPreviewUrl
      : isDirectVideo
        ? value
        : getImageKitThumbnailUrl(value, 320)
    : null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PropertyFieldLabel>{label}</PropertyFieldLabel>
      <MediaUploadZone
        onUploaded={result => {
          if (!acceptVideo && result.mediaType === 'video') {
            setUploadError('Upload an image file for this field.')

            return
          }

          setUploadError(null)
          onChange(
            result.url,
            result.width && result.height ? { width: result.width, height: result.height } : undefined
          )
        }}
        onError={message => setUploadError(message)}
      />
      {uploadError && (
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'error.main' }}>{uploadError}</Typography>
      )}
      <TextField
        label='URL'
        size='small'
        fullWidth
        value={value}
        placeholder={urlPlaceholder}
        onChange={event => onChange(event.target.value)}
        sx={{ '& .MuiInputBase-root': { borderRadius: 1 } }}
      />
      {previewUrl && (
        <Box
          sx={{
            maxWidth: '100%',
            borderRadius: 1,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.25),
            overflow: 'hidden',
            backgroundColor: alpha(theme.palette.text.primary, 0.03),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(embedPreviewUrl || isDirectVideo ? { aspectRatio: '16 / 9' } : {})
          }}
        >
          {embedPreviewUrl ? (
            <Box
              component='iframe'
              src={embedPreviewUrl}
              title='Video preview'
              allow='accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              sx={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            />
          ) : isDirectVideo ? (
            <Box
              component='video'
              src={previewUrl}
              muted
              playsInline
              loop
              autoPlay
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box
              component='img'
              src={previewUrl}
              alt='Preview'
              sx={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: 220,
                objectFit: 'scale-down',
                display: 'block'
              }}
            />
          )}
        </Box>
      )}
      {value && (
        <CompactButton
          startIcon={<i className='ri-delete-bin-line' style={{ fontSize: '0.875rem' }} />}
          onClick={() => {
            setUploadError(null)
            onChange('')
          }}
        >
          {clearLabel}
        </CompactButton>
      )}
    </Box>
  )
}
