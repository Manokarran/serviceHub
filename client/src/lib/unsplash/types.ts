export type UnsplashColorFilter =
  | 'black_and_white'
  | 'black'
  | 'white'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'magenta'
  | 'green'
  | 'teal'
  | 'blue'

export type UnsplashPhoto = {
  id: string
  width: number
  height: number
  color?: string | null
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
