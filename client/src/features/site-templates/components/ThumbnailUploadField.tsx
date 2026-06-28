'use client'

import { useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { isImageKitConfigured } from '@/lib/imagekit/config'
import { compressImageFile } from '@/lib/media/compress-image'

type Props = {
  value?: string
  onChange: (url: string) => void
  onError: (message: string) => void
}

export function ThumbnailUploadField({ value, onChange, onError }: Props) {
  const theme = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const imageKitReady = isImageKitConfigured()

  const uploadFile = async (file: File) => {
    if (!imageKitReady) {
      onError('ImageKit is not configured. Add credentials to your environment.')

      return
    }

    if (!file.type.startsWith('image/')) {
      onError('Upload a JPEG, PNG, or WebP image.')

      return
    }

    setUploading(true)

    try {
      const compressed = await compressImageFile(file)
      const formData = new FormData()
      formData.append('file', compressed.blob, file.name)

      const response = await fetch('/api/media/template-thumbnail', {
        method: 'POST',
        body: formData
      })

      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        onError(data.error ?? 'Upload failed.')

        return
      }

      onChange(data.url)
    } catch {
      onError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box className='flex flex-col gap-3'>
      <Box
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          border: `2px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          cursor: uploading ? 'default' : 'pointer',
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {value ? (
          <Box
            component='img'
            src={value}
            alt='Template thumbnail preview'
            sx={{ width: '100%', height: 180, objectFit: 'cover' }}
          />
        ) : (
          <Box className='flex flex-col items-center gap-2 p-6 text-center'>
            <i className='ri-image-add-line text-3xl text-primary' />
            <Typography variant='body2' color='text.secondary'>
              Click to upload a thumbnail
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              Recommended 800×600, JPG or PNG
            </Typography>
          </Box>
        )}
        {uploading ? (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              bgcolor: alpha(theme.palette.common.black, 0.45)
            }}
          >
            <LinearProgress />
          </Box>
        ) : null}
      </Box>
      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp,image/gif'
        hidden
        onChange={event => {
          const file = event.target.files?.[0]

          if (file) {
            void uploadFile(file)
          }

          event.target.value = ''
        }}
      />
      {value ? (
        <Button size='small' variant='outlined' onClick={() => inputRef.current?.click()} disabled={uploading}>
          Replace thumbnail
        </Button>
      ) : null}
    </Box>
  )
}
