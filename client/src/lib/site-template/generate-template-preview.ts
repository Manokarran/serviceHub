import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { isImageKitConfigured } from '@/lib/imagekit/config'
import { uploadToImageKit } from '@/lib/imagekit/server'
import { buildPlatformTemplateThumbnailFolder } from '@/lib/imagekit/urls'
import { loadSharp } from '@/lib/media/load-sharp'
import { extractHomePagePreviewImageUrl, findHeroBlock } from '@/lib/site-template/extract-home-preview'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function resolveAccentColor(siteStyles?: SiteStyles | null, heroBackground?: string): string {
  if (siteStyles?.colors?.accent) {
    return siteStyles.colors.accent
  }

  if (heroBackground && !heroBackground.startsWith('http')) {
    return heroBackground
  }

  return '#6366F1'
}

function buildFallbackPreviewSvg(params: {
  templateName: string
  heroTitle?: string
  heroSubtitle?: string
  accentColor: string
}): string {
  const title = escapeXml(params.heroTitle || params.templateName)
  const subtitle = escapeXml(params.heroSubtitle || 'Home page preview')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
      <stop stop-color="${escapeXml(params.accentColor)}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#F8FAFC"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <rect x="48" y="48" width="704" height="504" rx="20" fill="white" fill-opacity="0.92" stroke="#E2E8F0"/>
  <rect x="80" y="88" width="120" height="20" rx="10" fill="${escapeXml(params.accentColor)}"/>
  <rect x="80" y="180" width="420" height="36" rx="12" fill="#0F172A" fill-opacity="0.88"/>
  <rect x="80" y="236" width="300" height="18" rx="9" fill="#64748B" fill-opacity="0.75"/>
  <rect x="80" y="292" width="140" height="40" rx="20" fill="${escapeXml(params.accentColor)}"/>
  <rect x="500" y="140" width="220" height="300" rx="18" fill="${escapeXml(params.accentColor)}" fill-opacity="0.16"/>
  <text x="80" y="470" fill="#64748B" font-family="system-ui, sans-serif" font-size="18" font-weight="600">${title}</text>
  <text x="80" y="500" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="14">${subtitle}</text>
</svg>`
}

async function uploadPreviewBuffer(buffer: Buffer, fileName: string): Promise<string | null> {
  if (!isImageKitConfigured()) {
    return null
  }

  try {
    const upload = await uploadToImageKit({
      buffer,
      fileName,
      folder: buildPlatformTemplateThumbnailFolder(),
      tags: ['template-preview', 'auto-generated'],
      contentType: 'image/webp'
    })

    return upload.url
  } catch (error) {
    console.error('[generateTemplatePreviewThumbnail] upload failed', error)

    return null
  }
}

async function createThumbnailFromImageUrl(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return null
    }

    const sharp = await loadSharp()

    if (!sharp) {
      return null
    }

    const input = Buffer.from(await response.arrayBuffer())
    const buffer = await sharp(input)
      .rotate()
      .resize(800, 600, { fit: 'cover', position: 'centre' })
      .webp({ quality: 85, effort: 4 })
      .toBuffer()

    return uploadPreviewBuffer(buffer, `template-home-preview-${Date.now()}.webp`)
  } catch (error) {
    console.error('[generateTemplatePreviewThumbnail] image fetch failed', error)

    return null
  }
}

async function createThumbnailFromSvg(svg: string): Promise<string | null> {
  try {
    const sharp = await loadSharp()

    if (!sharp) {
      return null
    }

    const buffer = await sharp(Buffer.from(svg)).resize(800, 600).webp({ quality: 85, effort: 4 }).toBuffer()

    return uploadPreviewBuffer(buffer, `template-home-preview-${Date.now()}.webp`)
  } catch (error) {
    console.error('[generateTemplatePreviewThumbnail] svg render failed', error)

    return null
  }
}

/** Build a gallery thumbnail from the live/published home page content. */
export async function generateTemplatePreviewThumbnail(params: {
  templateName: string
  homeBlocks: Block[]
  siteStyles?: SiteStyles | null
}): Promise<string | null> {
  const previewImageUrl = extractHomePagePreviewImageUrl(params.homeBlocks)

  if (previewImageUrl) {
    const uploaded = await createThumbnailFromImageUrl(previewImageUrl)

    if (uploaded) {
      return uploaded
    }
  }

  const hero = findHeroBlock(params.homeBlocks)
  const svg = buildFallbackPreviewSvg({
    templateName: params.templateName,
    heroTitle: hero?.title,
    heroSubtitle: hero?.subtitle,
    accentColor: resolveAccentColor(params.siteStyles, hero?.background)
  })

  return createThumbnailFromSvg(svg)
}
