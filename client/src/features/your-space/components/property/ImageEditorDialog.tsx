'use client'

import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import { isImageKitUrl } from '@/lib/imagekit/config'
import { getImageKitThumbnailUrl } from '@/lib/imagekit/urls'
import {
  isDefaultImageAdjustments,
  isDefaultImageCrop,
  normalizeImageAdjustments,
  normalizeImageCrop,
  renderEditedImageBlob,
  ENHANCE_IMAGE_ADJUSTMENTS,
  buildCssImageFilter
} from '@/lib/media/image-edit'
import { fitCropToAspect, getAspectRatioValue, computeImageLayout } from '@/lib/media/image-crop-interaction'
import type { ImageAdjustments, ImageCropSettings } from '@/features/your-space/types'
import { DEFAULT_IMAGE_ADJUSTMENTS, DEFAULT_IMAGE_CROP } from '@/features/your-space/types'

import { ImageCropCanvas } from './ImageCropCanvas'
import { PropertySliderField } from './PropertySliderField'

type AspectPreset = 'free' | '1:1' | '16:9' | '4:3'

export type ImageEditorResult = {
  crop: ImageCropSettings | null
  adjustments: ImageAdjustments | null
  src?: string
  naturalWidth?: number
  naturalHeight?: number
}

type Props = {
  open: boolean
  src: string
  naturalWidth?: number
  naturalHeight?: number
  crop?: ImageCropSettings | null
  adjustments?: ImageAdjustments | null
  onClose: () => void
  onApply: (result: ImageEditorResult) => void
}

export function ImageEditorDialog({
  open,
  src,
  naturalWidth,
  naturalHeight,
  crop,
  adjustments,
  onClose,
  onApply
}: Props) {
  const [draftCrop, setDraftCrop] = useState<ImageCropSettings>(DEFAULT_IMAGE_CROP)
  const [draftAdjustments, setDraftAdjustments] = useState<ImageAdjustments>(DEFAULT_IMAGE_ADJUSTMENTS)
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>('free')
  const [busy, setBusy] = useState<'bake' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    setDraftCrop(normalizeImageCrop(crop))
    setDraftAdjustments(normalizeImageAdjustments(adjustments))
    setAspectPreset('free')
    setError(null)
  }, [open, crop, adjustments])

  const previewSrc = src ? getImageKitThumbnailUrl(src, 960) : ''
  const filter = buildCssImageFilter(draftAdjustments)
  const aspectRatio = getAspectRatioValue(aspectPreset)
  const canBake = Boolean(src && isImageKitUrl(src))

  const hasEdits = useMemo(
    () => !isDefaultImageCrop(draftCrop) || !isDefaultImageAdjustments(draftAdjustments),
    [draftAdjustments, draftCrop]
  )

  const handleAspectChange = (preset: AspectPreset) => {
    setAspectPreset(preset)

    if (preset === 'free') {
      return
    }

    const ratio = getAspectRatioValue(preset)

    if (!ratio) {
      return
    }

    setDraftCrop(current => {
      const width = naturalWidth ?? 1200
      const height = naturalHeight ?? 800
      const layout = computeImageLayout(560, 360, width, height)

      return fitCropToAspect(current, ratio, layout)
    })
  }

  const handleReset = () => {
    setDraftCrop({ ...DEFAULT_IMAGE_CROP })
    setDraftAdjustments({ ...DEFAULT_IMAGE_ADJUSTMENTS })
    setAspectPreset('free')
    setError(null)
  }

  const handleApply = () => {
    onApply({
      crop: isDefaultImageCrop(draftCrop) ? null : draftCrop,
      adjustments: isDefaultImageAdjustments(draftAdjustments) ? null : draftAdjustments
    })
    onClose()
  }

  const handleBakeAndReplace = async () => {
    if (!src) {
      return
    }

    setBusy('bake')
    setError(null)

    try {
      const rendered = await renderEditedImageBlob({
        src: previewSrc || src,
        crop: draftCrop,
        adjustments: draftAdjustments,
        quality: 0.92
      })

      const formData = new FormData()
      formData.append('file', rendered.blob, `edited-${Date.now()}.webp`)
      formData.append('mediaType', 'image')

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'Upload failed.')
      }

      onApply({
        crop: null,
        adjustments: null,
        src: data.url,
        naturalWidth: rendered.width,
        naturalHeight: rendered.height
      })
      onClose()
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not save the edited image.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md' scroll='paper'>
      <DialogTitle>Edit image</DialogTitle>
      <DialogContent className='flex flex-col gap-4' sx={{ pt: 1 }}>
        {error ? <Alert severity='error'>{error}</Alert> : null}

        {previewSrc ? (
          <Box sx={{ px: 1, py: 0.5 }}>
            <ImageCropCanvas
            src={previewSrc}
            crop={draftCrop}
            filter={filter}
            aspectRatio={aspectRatio}
            naturalWidth={naturalWidth}
            naturalHeight={naturalHeight}
            onCropChange={setDraftCrop}
            />
          </Box>
        ) : null}

        <Typography variant='body2' color='text.secondary'>
          Drag the crop box to reposition. Drag the corner and edge handles to resize — like a standard photo editor.
        </Typography>

        <Box className='flex flex-wrap gap-2'>
          {(['free', '1:1', '16:9', '4:3'] as AspectPreset[]).map(preset => (
            <Chip
              key={preset}
              label={preset === 'free' ? 'Free crop' : preset}
              clickable
              color={aspectPreset === preset ? 'primary' : 'default'}
              variant={aspectPreset === preset ? 'filled' : 'outlined'}
              onClick={() => handleAspectChange(preset)}
            />
          ))}
          <Chip
            label='Auto enhance'
            clickable
            color='secondary'
            variant='outlined'
            icon={<i className='ri-magic-line' />}
            onClick={() => setDraftAdjustments({ ...ENHANCE_IMAGE_ADJUSTMENTS })}
          />
        </Box>

        <Typography variant='subtitle2'>Adjustments</Typography>
        <PropertySliderField
          label='Brightness'
          value={draftAdjustments.brightness}
          min={50}
          max={150}
          unit='%'
          onChange={brightness => setDraftAdjustments(current => ({ ...current, brightness }))}
        />
        <PropertySliderField
          label='Contrast'
          value={draftAdjustments.contrast}
          min={50}
          max={150}
          unit='%'
          onChange={contrast => setDraftAdjustments(current => ({ ...current, contrast }))}
        />
        <PropertySliderField
          label='Saturation'
          value={draftAdjustments.saturation}
          min={0}
          max={200}
          unit='%'
          onChange={saturation => setDraftAdjustments(current => ({ ...current, saturation }))}
        />
        <PropertySliderField
          label='Sharpness'
          value={draftAdjustments.sharpness}
          min={0}
          max={100}
          unit='%'
          onChange={sharpness => setDraftAdjustments(current => ({ ...current, sharpness }))}
        />

        {naturalWidth && naturalHeight ? (
          <Typography variant='caption' color='text.secondary'>
            Source size: {naturalWidth} × {naturalHeight}px
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} disabled={Boolean(busy)}>
          Cancel
        </Button>
        <Button variant='text' onClick={handleReset} disabled={Boolean(busy) || !hasEdits}>
          Reset edits
        </Button>
        <Box sx={{ flex: 1 }} />
        {canBake ? (
          <Button
            variant='outlined'
            disabled={Boolean(busy) || !hasEdits}
            onClick={() => void handleBakeAndReplace()}
            startIcon={busy === 'bake' ? <i className='ri-loader-4-line animate-spin' /> : <i className='ri-save-line' />}
          >
            Bake & replace
          </Button>
        ) : null}
        <Button variant='contained' disabled={Boolean(busy)} onClick={handleApply}>
          Apply edits
        </Button>
      </DialogActions>
    </Dialog>
  )
}
