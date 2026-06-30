'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useDebounce } from 'react-use'

import { BUILDER_TYPOGRAPHY } from '@/features/your-space/constants/builderLayout'
import {
  isUnsplashConfigured,
  isUnsplashPhotoSelected,
  searchUnsplashPhotos,
  trackUnsplashDownload
} from '@/lib/unsplash/client'
import type { UnsplashPhoto } from '@/lib/unsplash/types'

type Props = {
  value?: string
  defaultQuery?: string
  orientation?: 'landscape' | 'portrait' | 'squarish'
  onSelect: (photo: UnsplashPhoto) => void
}

export function UnsplashPhotoPicker({
  value,
  defaultQuery = 'professional photography',
  orientation,
  onSelect
}: Props) {
  const theme = useTheme()
  const [search, setSearch] = useState(defaultQuery)
  const [debouncedSearch, setDebouncedSearch] = useState(defaultQuery)
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null)

  useDebounce(() => setDebouncedSearch(search.trim() || defaultQuery), 500, [search, defaultQuery])

  useEffect(() => {
    if (!isUnsplashConfigured()) {
      setSearchError('Unsplash API key is not configured.')
      setPhotos([])
      setHasMore(false)

      return
    }

    let cancelled = false

    const loadPhotos = async () => {
      setLoading(true)
      setSearchError(null)
      setPage(1)

      try {
        const { results, totalPages } = await searchUnsplashPhotos({
          query: debouncedSearch,
          page: 1,
          orientation
        })

        if (!cancelled) {
          setPhotos(results)
          setHasMore(totalPages > 1)
        }
      } catch (error) {
        if (!cancelled) {
          setSearchError(error instanceof Error ? error.message : 'Could not load photos. Try another search.')
          setPhotos([])
          setHasMore(false)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPhotos()

    return () => {
      cancelled = true
    }
  }, [debouncedSearch, orientation])

  const handleLoadMore = async () => {
    const nextPage = page + 1

    setLoadingMore(true)
    setSearchError(null)

    try {
      const { results, totalPages } = await searchUnsplashPhotos({
        query: debouncedSearch,
        page: nextPage,
        orientation
      })

      setPhotos(prev => {
        const existingIds = new Set(prev.map(photo => photo.id))

        return [...prev, ...results.filter(photo => !existingIds.has(photo.id))]
      })
      setPage(nextPage)
      setHasMore(nextPage < totalPages)
    } catch {
      setSearchError('Could not load more photos. Try again.')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSelect = (photo: UnsplashPhoto) => {
    setSelectedPhoto(photo)
    void trackUnsplashDownload(photo)
    onSelect(photo)
  }

  const activePhoto =
    selectedPhoto ??
    photos.find(photo => isUnsplashPhotoSelected(photo, value)) ??
    null

  if (!isUnsplashConfigured()) {
    return (
      <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary' }}>
        Add <code>NEXT_PUBLIC_UNSPLASH_KEY</code> to enable Unsplash search.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary' }}>Search Unsplash</Typography>

      <TextField
        label='Search photos'
        size='small'
        fullWidth
        value={search}
        onChange={event => setSearch(event.target.value)}
        placeholder={defaultQuery}
      />

      {loading ? (
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary' }}>Loading photos…</Typography>
      ) : searchError ? (
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'error.main' }}>{searchError}</Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0.75,
            maxHeight: 280,
            overflowY: 'auto',
            pr: 0.25
          }}
        >
          {photos.map(photo => {
            const selected = isUnsplashPhotoSelected(photo, value)

            return (
              <Box
                key={photo.id}
                component='button'
                type='button'
                onClick={() => handleSelect(photo)}
                sx={{
                  aspectRatio: '4 / 3',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : alpha(theme.palette.divider, 0.9),
                  backgroundImage: `url(${photo.urls.thumb})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  p: 0,
                  boxShadow: selected ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
                }}
              />
            )
          })}
        </Box>
      )}

      {hasMore && !loading && !searchError && (
        <Button variant='outlined' size='small' fullWidth onClick={() => void handleLoadMore()} disabled={loadingMore}>
          {loadingMore ? 'Loading more…' : `Load more photos`}
        </Button>
      )}

      {activePhoto ? (
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', fontWeight: 400, lineHeight: 1.5 }}>
          Photo by{' '}
          <Box
            component='a'
            href={`${activePhoto.user.links.html}?utm_source=servicehub&utm_medium=referral`}
            target='_blank'
            rel='noopener noreferrer'
            sx={{ color: 'text.secondary', textDecoration: 'underline' }}
          >
            {activePhoto.user.name}
          </Box>{' '}
          on{' '}
          <Box
            component='a'
            href={`${activePhoto.links.html}?utm_source=servicehub&utm_medium=referral`}
            target='_blank'
            rel='noopener noreferrer'
            sx={{ color: 'text.secondary', textDecoration: 'underline' }}
          >
            Unsplash
          </Box>
        </Typography>
      ) : null}
    </Box>
  )
}
