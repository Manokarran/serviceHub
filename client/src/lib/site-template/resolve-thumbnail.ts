import { DEFAULT_TEMPLATE_THUMBNAIL } from '@/lib/constants/site-template'
import { getImageKitThumbnailUrl } from '@/lib/imagekit/urls'

type TemplateThumbnailSource = {
  thumbnailUrl?: string | null
  generatedThumbnailUrl?: string | null
}

export function resolveTemplateThumbnailUrl(template: TemplateThumbnailSource): string {
  const custom = template.thumbnailUrl?.trim()

  if (custom) {
    return custom
  }

  const generated = template.generatedThumbnailUrl?.trim()

  if (generated) {
    return generated
  }

  return DEFAULT_TEMPLATE_THUMBNAIL
}

export function getTemplateThumbnailDisplayUrl(template: TemplateThumbnailSource, size = 480): string {
  const url = resolveTemplateThumbnailUrl(template)

  if (url.startsWith('/')) {
    return url
  }

  return getImageKitThumbnailUrl(url, size)
}

export function hasCustomTemplateThumbnail(template: TemplateThumbnailSource): boolean {
  return Boolean(template.thumbnailUrl?.trim())
}

export function hasGeneratedTemplateThumbnail(template: TemplateThumbnailSource): boolean {
  return Boolean(template.generatedThumbnailUrl?.trim())
}
