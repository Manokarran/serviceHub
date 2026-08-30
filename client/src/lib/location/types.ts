export type LocationContext = {
  countryCode?: string
  country?: string
  region?: string
  place?: string
}

export type LocationMapStyle = 'theme' | 'standard' | 'muted' | 'monochrome' | 'warm'

export type TenantLocation = {
  address: string
  latitude: number
  longitude: number
  context?: LocationContext
}
