import type sharpFactory from 'sharp'

type SharpFactory = typeof sharpFactory

let cached: Promise<SharpFactory | null> | undefined

export class SharpUnavailableError extends Error {
  constructor() {
    super('Image processing is unavailable.')
    this.name = 'SharpUnavailableError'
  }
}

/** Load sharp only when image work runs. A static import 500s Vercel pages if libvips is missing. */
export async function loadSharp(): Promise<SharpFactory | null> {
  if (!cached) {
    cached = import('sharp')
      .then(mod => mod.default)
      .catch((error: unknown) => {
        console.error('[sharp] Failed to load native module', error)

        return null
      })
  }

  return cached
}
