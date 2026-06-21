export const MAX_VIDEO_BYTES = 15 * 1024 * 1024
export const MAX_VIDEO_DURATION_SECONDS = 60
export const MAX_VIDEO_HEIGHT = 1080
export const MAX_VIDEO_WIDTH = 1920

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

export type VideoMetadata = {
  width: number
  height: number
  duration: number
}

export function validateVideoMimeType(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    return 'Use MP4 or WebM video.'
  }

  if (file.size > MAX_VIDEO_BYTES) {
    return 'Video must be 15 MB or smaller.'
  }

  return null
}

export async function readVideoMetadata(file: File): Promise<VideoMetadata> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const metadata = await new Promise<VideoMetadata>((resolve, reject) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true

      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: Number.isFinite(video.duration) ? video.duration : 0
        })
      }

      video.onerror = () => reject(new Error('Could not read video metadata.'))
      video.src = objectUrl
    })

    return metadata
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function validateVideoFile(file: File): Promise<string | null> {
  const mimeError = validateVideoMimeType(file)

  if (mimeError) {
    return mimeError
  }

  try {
    const metadata = await readVideoMetadata(file)

    if (metadata.duration > MAX_VIDEO_DURATION_SECONDS) {
      return `Video must be ${MAX_VIDEO_DURATION_SECONDS} seconds or shorter.`
    }

    if (metadata.width > MAX_VIDEO_WIDTH || metadata.height > MAX_VIDEO_HEIGHT) {
      return `Video resolution must be ${MAX_VIDEO_WIDTH}×${MAX_VIDEO_HEIGHT} or smaller. Re-export at 1080p before uploading.`
    }

    return null
  } catch {
    return 'Could not read video file. Try another format.'
  }
}
