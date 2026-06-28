/** Max stored dimensions — high enough for crisp 2× retina delivery. */
const DEFAULT_MAX_WIDTH = 2560
const DEFAULT_MAX_HEIGHT = 2560
/** Storage quality — compressed for space but not visibly degraded. */
const DEFAULT_QUALITY = 0.88
const MAX_IMAGE_INPUT_BYTES = 20 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export type CompressImageResult = {
  blob: Blob
  fileName: string
  width: number
  height: number
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Use JPEG, PNG, or WebP images.'
  }

  if (file.size > MAX_IMAGE_INPUT_BYTES) {
    return 'Image must be 20 MB or smaller before compression.'
  }

  return null
}

export async function compressImageFile(file: File): Promise<CompressImageResult> {
  const validationError = validateImageFile(file)

  if (validationError) {
    throw new Error(validationError)
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, DEFAULT_MAX_WIDTH / bitmap.width, DEFAULT_MAX_HEIGHT / bitmap.height)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    bitmap.close()
    throw new Error('Could not prepare image for compression.')
  }

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error('Image compression failed.'))
        }
      },
      'image/webp',
      DEFAULT_QUALITY
    )
  })

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'background'

  return {
    blob,
    fileName: `${baseName}.webp`,
    width,
    height
  }
}
