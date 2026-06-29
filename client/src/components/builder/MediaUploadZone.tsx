'use client'

import { useRef, useState } from 'react'

import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '@/features/your-space/constants/builderLayout'
import { isImageKitConfigured } from '@/lib/imagekit/config'
import { compressImageFile } from '@/lib/media/compress-image'
import { MAX_VIDEO_BYTES, validateVideoFile } from '@/lib/media/validate-video'

type UploadResult = {
  url: string
  mediaType: 'image' | 'video'
  width?: number
  height?: number
}

type Props = {
  onUploaded: (result: UploadResult) => void
  onError: (message: string) => void
}

export function MediaUploadZone({ onUploaded, onError }: Props) {
  const theme = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progressLabel, setProgressLabel] = useState<string | null>(null)

  const imageKitReady = isImageKitConfigured()

  const uploadFile = async (file: File) => {
    if (!imageKitReady) {
      onError('ImageKit is not configured. Add credentials to your environment.')

      return
    }

    setUploading(true)
    setProgressLabel('Preparing…')

    try {
      let payload: File | Blob = file
      let uploadFileName = file.name
      let mediaType: 'image' | 'video'
      let imageWidth: number | undefined
      let imageHeight: number | undefined

      if (file.type.startsWith('image/')) {
        setProgressLabel('Compressing image…')
        const compressed = await compressImageFile(file)
        payload = compressed.blob
        uploadFileName = compressed.fileName
        mediaType = 'image'
        imageWidth = compressed.width
        imageHeight = compressed.height
      } else if (file.type.startsWith('video/')) {
        const validationError = await validateVideoFile(file)

        if (validationError) {
          onError(validationError)

          return
        }

        mediaType = 'video'
        setProgressLabel('Uploading video…')
      } else {
        onError('Upload an image (JPEG, PNG, WebP) or video (MP4, WebM).')

        return
      }

      const formData = new FormData()
      formData.append('file', payload, uploadFileName)
      formData.append('mediaType', mediaType)

      setProgressLabel(mediaType === 'image' ? 'Uploading image…' : 'Uploading video…')

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      const data = (await response.json()) as UploadResult & { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Upload failed.')
      }

      onUploaded({
        url: data.url,
        mediaType: data.mediaType,
        width: imageWidth,
        height: imageHeight
      })
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Upload failed.')
    } finally {
      setUploading(false)
      setProgressLabel(null)
    }
  }

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]

    if (!file || uploading) {
      return
    }

    void uploadFile(file)
  }

  const maxVideoMb = Math.round(MAX_VIDEO_BYTES / (1024 * 1024))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
        component='button'
        type='button'
        disabled={!imageKitReady || uploading}
        onClick={() => inputRef.current?.click()}
        onDragEnter={event => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={event => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={event => {
          event.preventDefault()
          setDragging(false)
        }}
        onDrop={event => {
          event.preventDefault()
          setDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        sx={{
          border: '1px dashed',
          borderColor: dragging ? 'primary.main' : alpha(theme.palette.divider, 0.9),
          borderRadius: 1,
          backgroundColor: dragging ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.text.primary, 0.02),
          py: 2,
          px: 1.5,
          cursor: imageKitReady && !uploading ? 'pointer' : 'not-allowed',
          opacity: imageKitReady ? 1 : 0.65,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.75,
          textAlign: 'center'
        }}
      >
        <Box component='i' className='ri-upload-cloud-line' sx={{ fontSize: 24, color: 'text.secondary' }} />
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.primary' }}>
          {uploading ? progressLabel : 'Upload image or video'}
        </Typography>
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary', lineHeight: 1.5 }}>
          Images are compressed to WebP (max 2560px). Videos up to {maxVideoMb} MB, 1080p, 60s.
        </Typography>
      </Box>

      <input
        ref={inputRef}
        hidden
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime'
        onChange={event => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />

      {uploading && <LinearProgress />}

      {!imageKitReady && (
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'warning.main' }}>
          Set ImageKit env variables to enable uploads.
        </Typography>
      )}
    </Box>
  )
}
