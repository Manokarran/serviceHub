import { NextResponse } from 'next/server'
import sharp from 'sharp'

import { auth } from '@/lib/auth'
import { isImageKitConfigured } from '@/lib/imagekit/config'
import { uploadToImageKit, ImageKitUploadError } from '@/lib/imagekit/server'
import { buildImageKitFolder } from '@/lib/imagekit/urls'
import { MAX_VIDEO_BYTES } from '@/lib/media/validate-video'

export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])

async function optimizeImageBuffer(buffer: Buffer): Promise<{ buffer: Buffer; fileName: string }> {
  const optimized = await sharp(buffer)
    .rotate()
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer()

  return {
    buffer: optimized,
    fileName: `background-${Date.now()}.webp`
  }
}

export async function POST(request: Request) {
  try {
    if (!isImageKitConfigured()) {
      return NextResponse.json({ error: 'ImageKit is not configured.' }, { status: 503 })
    }

    const session = await auth()

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'You must be signed in to upload media.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const mediaType = formData.get('mediaType')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (mediaType !== 'image' && mediaType !== 'video') {
      return NextResponse.json({ error: 'Invalid media type.' }, { status: 400 })
    }

    const tenantId = session.user.tenantId
    const folder = buildImageKitFolder(tenantId, mediaType)

    if (mediaType === 'image') {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json({ error: 'Unsupported image format.' }, { status: 400 })
      }

      if (file.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: 'Image is too large.' }, { status: 400 })
      }

      const inputBuffer = Buffer.from(await file.arrayBuffer())
      const { buffer, fileName } = await optimizeImageBuffer(inputBuffer)

      const upload = await uploadToImageKit({
        buffer,
        fileName,
        folder,
        tags: ['background', 'image', `tenant-${tenantId}`],
        contentType: 'image/webp'
      })

      if (!upload.url) {
        return NextResponse.json({ error: 'Upload failed.' }, { status: 502 })
      }

      return NextResponse.json({
        url: upload.url,
        fileId: upload.fileId,
        mediaType: 'image',
        size: upload.size ?? buffer.length
      })
    }

    if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported video format.' }, { status: 400 })
    }

    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json({ error: 'Video must be 15 MB or smaller.' }, { status: 400 })
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const fileName = `background-${Date.now()}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const upload = await uploadToImageKit({
      buffer,
      fileName,
      folder,
      tags: ['background', 'video', `tenant-${tenantId}`],
      contentType: file.type || 'video/mp4'
    })

    if (!upload.url) {
      return NextResponse.json({ error: 'Upload failed.' }, { status: 502 })
    }

    return NextResponse.json({
      url: upload.url,
      fileId: upload.fileId,
      mediaType: 'video',
      size: upload.size ?? buffer.length
    })
  } catch (error) {
    if (error instanceof ImageKitUploadError) {
      console.error('[media/upload]', error.message)

      return NextResponse.json({ error: error.message }, { status: error.status >= 400 && error.status < 600 ? error.status : 500 })
    }

    console.error('[media/upload]', error)

    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
