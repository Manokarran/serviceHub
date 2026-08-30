import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import type { LocationContext } from '@/lib/location/types'

export const runtime = 'nodejs'

type NominatimResult = {
  display_name?: string
  lat?: string
  lon?: string
  address?: {
    country_code?: string
    country?: string
    state?: string
    state_district?: string
    county?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
  }
}

function parseCoordinate(value: string | null) {
  if (!value?.trim()) {
    return null
  }

  const coordinate = Number(value)

  return Number.isFinite(coordinate) ? coordinate : null
}

function isValidPoint(latitude: number, longitude: number) {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
}

function getLocationContext(result: NominatimResult): LocationContext {
  const address = result.address
  const countryCode = address?.country_code?.trim().toLowerCase()
  const region = address?.state?.trim() || address?.state_district?.trim() || address?.county?.trim()

  const place =
    address?.city?.trim() || address?.town?.trim() || address?.village?.trim() || address?.municipality?.trim()

  return {
    ...(countryCode && /^[a-z]{2}$/.test(countryCode) ? { countryCode } : {}),
    ...(address?.country?.trim() ? { country: address.country.trim() } : {}),
    ...(region ? { region } : {}),
    ...(place ? { place } : {})
  }
}

function parseContextValue(value: string | null, maxLength: number) {
  const contextValue = value?.trim()

  return contextValue && contextValue.length <= maxLength ? contextValue : undefined
}

function appendContext(query: string, value: string | undefined) {
  if (!value || query.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
    return query
  }

  return `${query}, ${value}`
}

function getViewbox(latitude: number, longitude: number) {
  const latitudeSpan = 1.5
  const longitudeSpan = Math.max(1.5, Math.min(5, 1.5 / Math.cos((latitude * Math.PI) / 180)))

  return [
    Math.max(-180, longitude - longitudeSpan),
    Math.min(90, latitude + latitudeSpan),
    Math.min(180, longitude + longitudeSpan),
    Math.max(-90, latitude - latitudeSpan)
  ].join(',')
}

function isNominatimResult(value: unknown): value is NominatimResult {
  return typeof value === 'object' && value !== null
}

function isUsableNominatimResult(value: unknown): value is NominatimResult {
  if (!isNominatimResult(value) || typeof value.display_name !== 'string') {
    return false
  }

  const latitude = Number(value.lat)
  const longitude = Number(value.lon)

  return Number.isFinite(latitude) && Number.isFinite(longitude) && isValidPoint(latitude, longitude)
}

function getErrorMessage(status: number) {
  if (status === 429) {
    return 'The address service is busy. Please wait a moment and try again.'
  }

  return 'The address service is unavailable. Please try again.'
}

function toLocation(result: NominatimResult) {
  return {
    address: result.display_name as string,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    context: getLocationContext(result)
  }
}

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 })
  }

  const url = new URL(request.url)
  const query = url.searchParams.get('q')?.trim()
  const latitude = parseCoordinate(url.searchParams.get('lat'))
  const longitude = parseCoordinate(url.searchParams.get('lon'))
  const contextLatitude = parseCoordinate(url.searchParams.get('contextLat'))
  const contextLongitude = parseCoordinate(url.searchParams.get('contextLon'))
  const countryCode = parseContextValue(url.searchParams.get('countryCode'), 2)?.toLowerCase()
  const contextPlace = parseContextValue(url.searchParams.get('place'), 100)
  const contextRegion = parseContextValue(url.searchParams.get('region'), 100)
  const hasMapCoordinates = url.searchParams.has('lat') || url.searchParams.has('lon')
  const hasContextCoordinates = url.searchParams.has('contextLat') || url.searchParams.has('contextLon')

  if (hasMapCoordinates && (latitude === null || longitude === null)) {
    return NextResponse.json({ error: 'Enter both map coordinates.' }, { status: 400 })
  }

  if (hasContextCoordinates && (contextLatitude === null || contextLongitude === null)) {
    return NextResponse.json({ error: 'Enter both context coordinates.' }, { status: 400 })
  }

  if (contextLatitude !== null && contextLongitude !== null && !isValidPoint(contextLatitude, contextLongitude)) {
    return NextResponse.json({ error: 'Enter valid context coordinates.' }, { status: 400 })
  }

  if (latitude !== null && longitude !== null) {
    if (!isValidPoint(latitude, longitude)) {
      return NextResponse.json({ error: 'Enter valid map coordinates.' }, { status: 400 })
    }
  } else if (!query || query.length < 3 || query.length > 200) {
    return NextResponse.json({ error: 'Enter at least 3 characters for the address.' }, { status: 400 })
  }

  try {
    const endpoint = new URL('https://nominatim.openstreetmap.org')

    if (latitude !== null && longitude !== null) {
      endpoint.pathname = '/reverse'
      endpoint.searchParams.set('format', 'jsonv2')
      endpoint.searchParams.set('addressdetails', '1')
      endpoint.searchParams.set('lat', String(latitude))
      endpoint.searchParams.set('lon', String(longitude))
    } else {
      endpoint.pathname = '/search'
      endpoint.searchParams.set('format', 'jsonv2')
      endpoint.searchParams.set('addressdetails', '1')
      endpoint.searchParams.set('limit', '5')

      let contextualQuery = query as string

      contextualQuery = appendContext(contextualQuery, contextPlace)
      contextualQuery = appendContext(contextualQuery, contextRegion)
      endpoint.searchParams.set('q', contextualQuery)

      if (countryCode && /^[a-z]{2}$/.test(countryCode)) {
        endpoint.searchParams.set('countrycodes', countryCode)
      }

      if (contextLatitude !== null && contextLongitude !== null) {
        endpoint.searchParams.set('viewbox', getViewbox(contextLatitude, contextLongitude))
      }
    }

    const response = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ServiceHub location settings'
      },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: getErrorMessage(response.status) },
        { status: response.status === 429 ? 429 : 502 }
      )
    }

    const data: unknown = await response.json()

    const results = Array.isArray(data)
      ? data.filter(isUsableNominatimResult).slice(0, 5)
      : isUsableNominatimResult(data)
        ? [data]
        : []

    if (!results.length) {
      return NextResponse.json({ error: 'No matching address was found.' }, { status: 404 })
    }

    const locations = results.map(toLocation)

    return NextResponse.json({
      location: locations[0],
      locations
    })
  } catch (error) {
    console.error('[location/geocode]', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error && error.name === 'TimeoutError'
            ? 'The address search timed out. Please try again.'
            : 'Could not find that address.'
      },
      { status: 502 }
    )
  }
}
