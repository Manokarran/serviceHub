export type UnsplashPhoto = {
  id: string
  width: number
  height: number
  urls: { thumb: string; regular: string }
  alt_description?: string | null
  description?: string | null
  user: { name: string; links: { html: string } }
  links: { html: string; download_location: string }
}

export type UnsplashSearchResult = {
  results: UnsplashPhoto[]
  totalPages: number
}
