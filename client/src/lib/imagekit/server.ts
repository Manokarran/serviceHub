import 'server-only'

import { serverEnv } from '@/config/env'

export type ImageKitUploadResult = {
  url: string
  fileId?: string
  size?: number
}

type ImageKitUploadResponse = {
  url?: string
  fileId?: string
  size?: number
  message?: string
  help?: string
}

export class ImageKitUploadError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ImageKitUploadError'
    this.status = status
  }
}

function getBasicAuthHeader(privateKey: string): string {
  // ImageKit expects private key as Basic auth username with an empty password.
  return `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`
}

export async function uploadToImageKit(params: {
  buffer: Buffer
  fileName: string
  folder: string
  tags: string[]
  contentType?: string
}): Promise<ImageKitUploadResult> {
  const privateKey = serverEnv.imagekitPrivateKey

  if (!privateKey) {
    throw new ImageKitUploadError('ImageKit is not configured.', 503)
  }

  const formData = new FormData()
  const blob = new Blob([new Uint8Array(params.buffer)], {
    type: params.contentType ?? 'application/octet-stream'
  })

  formData.append('file', blob, params.fileName)
  formData.append('fileName', params.fileName)
  formData.append('folder', params.folder)
  formData.append('useUniqueFileName', 'true')

  if (params.tags.length > 0) {
    formData.append('tags', params.tags.join(','))
  }

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: getBasicAuthHeader(privateKey),
      Accept: 'application/json'
    },
    body: formData
  })

  const data = (await response.json()) as ImageKitUploadResponse

  if (!response.ok) {
    if (response.status === 403) {
      throw new ImageKitUploadError(
        data.message
          ? `ImageKit authentication failed: ${data.message} Copy the full private key from ImageKit → Developer → API keys into IMAGEKIT_PRIVATE_KEY (wrap in quotes if it ends with =), then restart the dev server.`
          : 'ImageKit rejected your private API key. In the ImageKit dashboard, open Developer → API keys, copy the full private key into IMAGEKIT_PRIVATE_KEY (wrap it in quotes if it ends with =), then restart the dev server.',
        403
      )
    }

    throw new ImageKitUploadError(data.message ?? 'ImageKit upload failed.', response.status)
  }

  if (!data.url) {
    throw new ImageKitUploadError('ImageKit did not return a file URL.', 502)
  }

  return {
    url: data.url,
    fileId: data.fileId,
    size: data.size
  }
}
