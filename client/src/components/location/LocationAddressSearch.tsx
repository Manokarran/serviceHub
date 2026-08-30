'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import type { TenantLocation } from '@/lib/location/types'

type LocationResult = TenantLocation

type Props = {
  selectedAddress: string
  selectedLatitude?: number | null
  selectedLongitude?: number | null
  context?: TenantLocation | null
  onSelect: (location: LocationResult) => void
}

function getResultContext(location: LocationResult) {
  return [location.context?.place, location.context?.region, location.context?.country].filter(Boolean).join(', ')
}

export function LocationAddressSearch({
  selectedAddress,
  selectedLatitude,
  selectedLongitude,
  context,
  onSelect
}: Props) {
  const [query, setQuery] = useState(selectedAddress)
  const [results, setResults] = useState<LocationResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRequestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setQuery(selectedAddress)
  }, [selectedAddress])

  useEffect(
    () => () => {
      activeRequestRef.current?.abort()
    },
    []
  )

  const handleSearch = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 3) {
      setError('Enter at least 3 characters to search.')
      setResults([])

      return
    }

    setIsLoading(true)
    setError(null)

    activeRequestRef.current?.abort()
    const controller = new AbortController()

    activeRequestRef.current = controller
    const params = new URLSearchParams({ q: trimmedQuery })

    if (context?.latitude !== undefined && context?.longitude !== undefined) {
      params.set('contextLat', String(context.latitude))
      params.set('contextLon', String(context.longitude))
    }

    if (context?.context?.countryCode) {
      params.set('countryCode', context.context.countryCode)
    }

    if (context?.context?.place) {
      params.set('place', context.context.place)
    }

    if (context?.context?.region) {
      params.set('region', context.context.region)
    }

    try {
      const response = await fetch(`/api/location/geocode?${params.toString()}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      })

      const payload = (await response.json()) as {
        error?: string
        location?: LocationResult
        locations?: LocationResult[]
      }

      if (!response.ok) {
        throw new Error(payload.error ?? 'Could not find that address.')
      }

      const locations = Array.isArray(payload.locations)
        ? payload.locations
        : payload.location
          ? [payload.location]
          : []

      if (!locations.length) {
        throw new Error('No matching address was found.')
      }

      setResults(locations)
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.name === 'AbortError') {
        return
      }

      if (activeRequestRef.current === controller) {
        setResults([])
        setError(caughtError instanceof Error ? caughtError.message : 'Could not find that address.')
      }
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null
        setIsLoading(false)
      }
    }
  }

  return (
    <Box
      component='section'
      aria-labelledby='location-address-search-title'
      sx={{
        p: 1.5,
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5,
        backgroundColor: 'action.hover'
      }}
    >
      <Typography id='location-address-search-title' variant='subtitle2' sx={{ fontWeight: 700 }}>
        Search for an address
      </Typography>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25, mb: 1 }}>
        Select a result to update the address and pin together.
      </Typography>
      <Box component='form' onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          label='Address search'
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setError(null)
          }}
          placeholder='Street, suburb, city…'
          size='small'
          fullWidth
          inputProps={{ 'aria-label': 'Search for an override address' }}
        />
        <Button
          type='submit'
          variant='contained'
          size='small'
          disabled={isLoading}
          aria-label='Search addresses'
          sx={{ minWidth: 88, height: 40, flexShrink: 0 }}
        >
          {isLoading ? <CircularProgress size={18} color='inherit' aria-label='Searching addresses' /> : 'Search'}
        </Button>
      </Box>
      {error ? (
        <Alert severity='error' sx={{ mt: 1, py: 0 }} role='alert'>
          {error}
        </Alert>
      ) : null}
      {results.length ? (
        <List
          dense
          disablePadding
          aria-label='Address search results'
          role='listbox'
          sx={{ mt: 1, bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}
        >
          {results.map((result, index) => {
            const contextLabel = getResultContext(result)

            const isSelected =
              result.address === selectedAddress &&
              result.latitude === selectedLatitude &&
              result.longitude === selectedLongitude

            return (
              <Box key={`${result.latitude}:${result.longitude}:${result.address}`}>
                {index > 0 ? <Divider component='li' /> : null}
                <ListItemButton
                  role='option'
                  aria-selected={isSelected}
                  selected={isSelected}
                  onClick={() => {
                    setQuery(result.address)
                    onSelect(result)
                  }}
                  sx={{ alignItems: 'flex-start', py: 1 }}
                >
                  <ListItemText
                    primary={result.address}
                    secondary={contextLabel || `${result.latitude.toFixed(5)}, ${result.longitude.toFixed(5)}`}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: isSelected ? 700 : 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  {isSelected ? (
                    <Typography color='primary.main' variant='caption' sx={{ fontWeight: 700, mt: 0.5, ml: 1 }}>
                      Selected
                    </Typography>
                  ) : null}
                </ListItemButton>
              </Box>
            )
          })}
        </List>
      ) : null}
    </Box>
  )
}
