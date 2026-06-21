export type VideoSourceType = 'file' | 'youtube' | 'vimeo'

export type ParsedVideoUrl = {
  type: VideoSourceType
  id?: string
}

export type VideoEmbedOptions = {
  autoplay: boolean
  muted: boolean
  loop: boolean
  controls: boolean
}

const YOUTUBE_ID_PATTERN = /[a-zA-Z0-9_-]{11}/

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
]

const VIMEO_PATTERN = /vimeo\.com\/(?:video\/)?(\d+)/

const DIRECT_VIDEO_PATTERN = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i

export function parseVideoUrl(url: string): ParsedVideoUrl {
  const trimmed = url.trim()

  if (!trimmed) {
    return { type: 'file' }
  }

  if (DIRECT_VIDEO_PATTERN.test(trimmed)) {
    return { type: 'file' }
  }

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = trimmed.match(pattern)

    if (match?.[1] && YOUTUBE_ID_PATTERN.test(match[1])) {
      return { type: 'youtube', id: match[1] }
    }
  }

  const vimeoMatch = trimmed.match(VIMEO_PATTERN)

  if (vimeoMatch?.[1]) {
    return { type: 'vimeo', id: vimeoMatch[1] }
  }

  return { type: 'file' }
}

export function isEmbedVideoUrl(url: string): boolean {
  const { type } = parseVideoUrl(url)

  return type === 'youtube' || type === 'vimeo'
}

export function buildVideoEmbedUrl(parsed: ParsedVideoUrl, options: VideoEmbedOptions): string | null {
  if (!parsed.id) {
    return null
  }

  if (parsed.type === 'youtube') {
    const params = new URLSearchParams()

    if (options.autoplay) {
      params.set('autoplay', '1')
      params.set('mute', '1')
    } else if (options.muted) {
      params.set('mute', '1')
    }

    if (options.loop) {
      params.set('loop', '1')
      params.set('playlist', parsed.id)
    }

    if (!options.controls) {
      params.set('controls', '0')
    }

    params.set('rel', '0')
    params.set('modestbranding', '1')

    const query = params.toString()

    return `https://www.youtube-nocookie.com/embed/${parsed.id}${query ? `?${query}` : ''}`
  }

  if (parsed.type === 'vimeo') {
    const params = new URLSearchParams()

    if (options.autoplay) {
      params.set('autoplay', '1')
      params.set('muted', '1')
    } else if (options.muted) {
      params.set('muted', '1')
    }

    if (options.loop) {
      params.set('loop', '1')
    }

    if (!options.controls) {
      params.set('controls', '0')
    }

    const query = params.toString()

    return `https://player.vimeo.com/video/${parsed.id}${query ? `?${query}` : ''}`
  }

  return null
}

export function getVideoSourceLabel(type: VideoSourceType): string | null {
  if (type === 'youtube') {
    return 'YouTube'
  }

  if (type === 'vimeo') {
    return 'Vimeo'
  }

  return null
}
