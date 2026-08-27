import { NextResponse } from 'next/server'

import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { auth } from '@/lib/auth'
import { isImageKitConfigured } from '@/lib/imagekit/config'
import { uploadToImageKit, ImageKitUploadError } from '@/lib/imagekit/server'
import { buildPlatformTemplateThumbnailFolder } from '@/lib/imagekit/urls'
import { loadSharp, SharpUnavailableError } from '@/lib/media/load-sharp'

export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

async function optimizeThumbnail(buffer: Buffer): Promise<{ buffer: Buffer; fileName: string }> {
  const sharp = await loadSharp()

  if (!sharp) {
    throw new SharpUnavailableError()
  }

  const optimized = await sharp(buffer)
    .rotate()
    .resize(800, 600, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85, effort: 4 })
    .toBuffer()

  return {
    buffer: optimized,
    fileName: `template-thumb-${Date.now()}.webp`
  }
}

export async function POST(request: Request) {
  try {
    if (!isImageKitConfigured()) {
      return NextResponse.json({ error: 'ImageKit is not configured.' }, { status: 503 })
    }

    const session = await auth()

    if (!session?.user?.email || !isSuperAdminEmail(session.user.email)) {
      return NextResponse.json({ error: 'Super admin access required.' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported image format.' }, { status: 400 })
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'Image must be 5 MB or smaller.' }, { status: 400 })
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const { buffer, fileName } = await optimizeThumbnail(inputBuffer)
    const folder = buildPlatformTemplateThumbnailFolder()

    const upload = await uploadToImageKit({
      buffer,
      fileName,
      folder,
      tags: ['template-thumbnail', 'platform'],
      contentType: 'image/webp'
    })

    if (!upload.url) {
      return NextResponse.json({ error: 'Upload failed.' }, { status: 502 })
    }

    return NextResponse.json({
      url: upload.url,
      fileId: upload.fileId,
      size: upload.size ?? buffer.length
    })
  } catch (error) {
    if (error instanceof SharpUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503 })
    }

    if (error instanceof ImageKitUploadError) {
      console.error('[media/template-thumbnail]', error.message)

      return NextResponse.json(
        { error: error.message },
        { status: error.status >= 400 && error.status < 600 ? error.status : 500 }
      )
    }

    console.error('[media/template-thumbnail]', error)

    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
