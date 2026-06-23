'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useDebounce } from 'react-use'

import { BUILDER_TYPOGRAPHY, builderSegmentedControlSx } from '@/features/your-space/constants/builderLayout'
import { PropertyFieldLabel } from '@/features/your-space/components/property/PropertyPanelUi'
import type { ImageHoverEffect } from '@/features/your-space/types'
import {
  BLOCK_BACKGROUND_PREVIEW_OPACITY,
  buildPhotoBackgroundCss,
  buildVideoBackgroundValue,
  isVideoBackground,
  parseMediaUrl,
  parsePhotoUrl
} from '@/features/your-space/utils/sectionStyleHelpers'
import { getImageKitThumbnailUrl } from '@/lib/imagekit/urls'
import { MediaUploadZone } from '@/components/builder/MediaUploadZone'

export type BackgroundType = 'color' | 'pattern' | 'gradient' | 'photo' | 'video'

type TabId = BackgroundType

type Props = {
  value: string
  backgroundType?: BackgroundType
  sectionType: string
  photoOpacity?: number
  photoAnimation?: ImageHoverEffect
  defaultPhotoAnimation?: ImageHoverEffect
  onStyleChange: (key: string, value: string) => void
}

type PatternPreset = {
  id: string
  label: string
  css: string
}

type GradientPreset = {
  id: string
  name: string
  css: string
}

type UnsplashPhoto = {
  id: string
  urls: { thumb: string; regular: string }
  user: { name: string; links: { html: string } }
  links: { html: string }
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'color', label: 'Color' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'photo', label: 'Photo' }
]

function applyBackgroundPreviewOpacity(onStyleChange: Props['onStyleChange']) {
  onStyleChange('backgroundOpacity', String(BLOCK_BACKGROUND_PREVIEW_OPACITY))
}

function setBackgroundType(onStyleChange: Props['onStyleChange'], type: BackgroundType) {
  onStyleChange('backgroundType', type)

  if (type !== 'color') {
    applyBackgroundPreviewOpacity(onStyleChange)
  }
}

const PATTERN_PRESETS: PatternPreset[] = [
  {
    id: 'dots',
    label: 'Dots',
    css: 'radial-gradient(circle, #94a3b8 1.2px, transparent 1.2px) 0 0 / 14px 14px #f8fafc'
  },
  {
    id: 'grid',
    label: 'Grid',
    css: '#ffffff repeating-linear-gradient(0deg, #e2e8f0 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, #e2e8f0 0 1px, transparent 1px 16px)'
  },
  {
    id: 'diagonal',
    label: 'Diagonal',
    css: 'repeating-linear-gradient(45deg, #cbd5e1 0 1px, transparent 1px 12px) #f8fafc'
  },
  {
    id: 'crosshatch',
    label: 'Crosshatch',
    css: 'repeating-linear-gradient(45deg, #cbd5e1 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, #cbd5e1 0 1px, transparent 1px 10px) #f8fafc'
  },
  {
    id: 'chevron',
    label: 'Chevron',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M0 12L12 0L24 12L12 24Z' fill='none' stroke='%23cbd5e1' stroke-width='1'/%3E%3C/svg%3E") 0 0 / 24px 24px #f8fafc`
  },
  {
    id: 'triangles',
    label: 'Triangles',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M0 20L10 0L20 20Z' fill='%23e2e8f0'/%3E%3C/svg%3E") 0 0 / 20px 20px #f8fafc`
  },
  {
    id: 'hexagons',
    label: 'Hexagons',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='24'%3E%3Cpath d='M7 0h14l7 12-7 12H7L0 12z' fill='none' stroke='%23cbd5e1' stroke-width='1'/%3E%3C/svg%3E") 0 0 / 28px 24px #f8fafc`
  },
  {
    id: 'waves',
    label: 'Waves',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='12'%3E%3Cpath d='M0 6Q10 0 20 6T40 6' fill='none' stroke='%23cbd5e1' stroke-width='1.5'/%3E%3C/svg%3E") 0 0 / 40px 12px #f1f5f9`
  },
  {
    id: 'circuit',
    label: 'Circuit',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cpath d='M0 16h10v-6h6v6h10M16 0v10h6v6h-6v10' fill='none' stroke='%23cbd5e1' stroke-width='1'/%3E%3Ccircle cx='16' cy='16' r='2' fill='%2394a3b8'/%3E%3C/svg%3E") 0 0 / 32px 32px #f8fafc`
  },
  {
    id: 'topography',
    label: 'Topography',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M0 30c10-8 20 8 30 0s20-8 30 0M0 45c10-8 20 8 30 0s20-8 30 0M0 15c10-8 20 8 30 0s20-8 30 0' fill='none' stroke='%23cbd5e1' stroke-width='1'/%3E%3C/svg%3E") 0 0 / 60px 60px #f8fafc`
  },
  {
    id: 'plus',
    label: 'Plus',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Cpath d='M9 0h2v9h9v2h-9v9H9v-9H0V9h9z' fill='%23cbd5e1'/%3E%3C/svg%3E") 0 0 / 20px 20px #f8fafc`
  },
  {
    id: 'diamonds',
    label: 'Diamonds',
    css: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect x='8' y='1' width='10' height='10' transform='rotate(45 8 8)' fill='%23e2e8f0'/%3E%3C/svg%3E") 0 0 / 16px 16px #f8fafc`
  }
]

const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'warm-flame', name: 'Warm Flame', css: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)' },
  { id: 'night-fade', name: 'Night Fade', css: 'linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)' },
  { id: 'juicy-peach', name: 'Juicy Peach', css: 'linear-gradient(to top, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'young-passion', name: 'Young Passion', css: 'linear-gradient(to top, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%)' },
  { id: 'sunny-morning', name: 'Sunny Morning', css: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' },
  { id: 'rainy-ashville', name: 'Rainy Ashville', css: 'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)' },
  { id: 'frozen-dreams', name: 'Frozen Dreams', css: 'linear-gradient(to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%)' },
  { id: 'winter-neva', name: 'Winter Neva', css: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { id: 'mean-fruit', name: 'Mean Fruit', css: 'linear-gradient(to top, #fccb90 0%, #d57eeb 100%)' },
  { id: 'deep-blue', name: 'Deep Blue', css: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)' },
  { id: 'malibu', name: 'Malibu Beach', css: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)' },
  { id: 'perfect-blue', name: 'Perfect Blue', css: 'linear-gradient(135deg, #3D4E81 0%, #6E7FF3 100%)' }
]

const GRADIENT_DIRECTIONS = [
  { id: 'right', label: '→', css: 'to right' },
  { id: 'top-right', label: '↗', css: 'to top right' },
  { id: 'top', label: '↑', css: 'to top' },
  { id: 'top-left', label: '↖', css: 'to top left' }
] as const

const PHOTOS_PER_PAGE = 9

const DEFAULT_UNSPLASH_QUERIES: Record<string, string> = {
  hero: 'abstract dark background',
  food: 'restaurant kitchen',
  header: 'minimal abstract background',
  section: 'abstract neutral background',
  footer: 'dark texture background'
}

function getDefaultUnsplashQuery(sectionType: string): string {
  return DEFAULT_UNSPLASH_QUERIES[sectionType] ?? 'abstract background'
}

function normalizeHexColor(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value
  }

  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value

    return `#${r}${r}${g}${g}${b}${b}`
  }

  return '#ffffff'
}

function SwatchButton({
  selected,
  title,
  onClick,
  children
}: {
  selected?: boolean
  title?: string
  onClick: () => void
  children: React.ReactNode
}) {
  const theme = useTheme()

  return (
    <Box
      component='button'
      type='button'
      title={title}
      onClick={onClick}
      sx={{
        width: 52,
        height: 52,
        borderRadius: 1,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : alpha(theme.palette.divider, 0.9),
        boxShadow: selected ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
        cursor: 'pointer',
        p: 0,
        overflow: 'hidden',
        backgroundColor: 'background.paper',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        '&:hover': {
          borderColor: selected ? 'primary.main' : alpha(theme.palette.text.primary, 0.25)
        }
      }}
    >
      {children}
    </Box>
  )
}

function ColorTab({
  value,
  onStyleChange
}: {
  value: string
  onStyleChange: Props['onStyleChange']
}) {
  const colorValue = value.startsWith('#') ? normalizeHexColor(value) : '#ffffff'

  const handleChange = (next: string) => {
    setBackgroundType(onStyleChange, 'color')
    onStyleChange('background', next)
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <TextField
        label='Background'
        size='small'
        fullWidth
        value={colorValue}
        onChange={e => handleChange(e.target.value)}
      />
      <Box
        component='input'
        type='color'
        value={colorValue}
        onChange={e => handleChange(e.target.value)}
        sx={{
          width: 36,
          height: 36,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          flexShrink: 0,
          p: 0
        }}
      />
    </Box>
  )
}

function PatternTab({ value, onStyleChange }: { value: string; onStyleChange: Props['onStyleChange'] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 52px)',
        gap: 1,
        justifyContent: 'space-between'
      }}
    >
      {PATTERN_PRESETS.map(pattern => (
        <SwatchButton
          key={pattern.id}
          title={pattern.label}
          selected={value === pattern.css}
          onClick={() => {
            setBackgroundType(onStyleChange, 'pattern')
            onStyleChange('background', pattern.css)
          }}
        >
          <Box style={{ width: '100%', height: '100%', background: pattern.css }} />
        </SwatchButton>
      ))}
    </Box>
  )
}

function GradientTab({ value, onStyleChange }: { value: string; onStyleChange: Props['onStyleChange'] }) {
  const [customFrom, setCustomFrom] = useState('#6366f1')
  const [customTo, setCustomTo] = useState('#a855f7')
  const [customDirection, setCustomDirection] = useState<(typeof GRADIENT_DIRECTIONS)[number]['id']>('right')
  const [customMode, setCustomMode] = useState(
    () => !GRADIENT_PRESETS.some(preset => preset.css === value) && value.startsWith('linear-gradient')
  )

  const customCss = useMemo(() => {
    const direction = GRADIENT_DIRECTIONS.find(item => item.id === customDirection)?.css ?? 'to right'

    return `linear-gradient(${direction}, ${customFrom} 0%, ${customTo} 100%)`
  }, [customDirection, customFrom, customTo])

  useEffect(() => {
    if (!customMode) {
      return
    }

    setBackgroundType(onStyleChange, 'gradient')
    onStyleChange('background', customCss)
  }, [customMode, customCss, onStyleChange])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 52px)',
          gap: 1,
          justifyContent: 'space-between'
        }}
      >
        {GRADIENT_PRESETS.map(preset => (
          <SwatchButton
            key={preset.id}
            title={preset.name}
            selected={!customMode && value === preset.css}
            onClick={() => {
              setCustomMode(false)
              setBackgroundType(onStyleChange, 'gradient')
              onStyleChange('background', preset.css)
            }}
          >
            <Box style={{ width: '100%', height: '100%', background: preset.css }} />
          </SwatchButton>
        ))}
        <SwatchButton
          title='Custom'
          selected={customMode}
          onClick={() => {
            setCustomMode(true)
            setBackgroundType(onStyleChange, 'gradient')
            onStyleChange('background', customCss)
          }}
        >
          <Box
            style={{
              width: '100%',
              height: '100%',
              background: customCss,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'common.white', textShadow: '0 1px 2px rgba(0,0,0,0.35)' }}>
              +
            </Typography>
          </Box>
        </SwatchButton>
      </Box>

      {customMode && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pt: 0.5 }}>
          <PropertyFieldLabel>Custom gradient</PropertyFieldLabel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', minWidth: 32 }}>From</Typography>
              <Box component='input' type='color' value={customFrom} onChange={e => setCustomFrom(e.target.value)} sx={{ width: 32, height: 32, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', minWidth: 20 }}>To</Typography>
              <Box component='input' type='color' value={customTo} onChange={e => setCustomTo(e.target.value)} sx={{ width: 32, height: 32, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0 }} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {GRADIENT_DIRECTIONS.map(direction => (
              <Box
                key={direction.id}
                component='button'
                type='button'
                onClick={() => setCustomDirection(direction.id)}
                sx={{
                  flex: 1,
                  py: 0.75,
                  border: '1px solid',
                  borderColor: customDirection === direction.id ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  backgroundColor: customDirection === direction.id ? alpha('#6366f1', 0.08) : 'background.paper',
                  cursor: 'pointer',
                  ...BUILDER_TYPOGRAPHY.label,
                  color: customDirection === direction.id ? 'primary.main' : 'text.secondary'
                }}
              >
                {direction.label}
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function PhotoTab({
  value,
  backgroundType,
  sectionType,
  photoOpacity = 100,
  photoAnimation,
  defaultPhotoAnimation = 'none',
  onStyleChange
}: {
  value: string
  backgroundType?: BackgroundType
  sectionType: string
  photoOpacity?: number
  photoAnimation?: ImageHoverEffect
  defaultPhotoAnimation?: ImageHoverEffect
  onStyleChange: Props['onStyleChange']
}) {
  const theme = useTheme()
  const defaultQuery = getDefaultUnsplashQuery(sectionType)
  const [search, setSearch] = useState(defaultQuery)
  const [debouncedSearch, setDebouncedSearch] = useState(defaultQuery)
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<UnsplashPhoto | null>(null)

  useDebounce(() => setDebouncedSearch(search.trim() || defaultQuery), 500, [search, defaultQuery])

  const fetchPhotos = async (pageNum: number, query: string) => {
    const key = process.env.NEXT_PUBLIC_UNSPLASH_KEY

    if (!key) {
      throw new Error('Unsplash API key is not configured.')
    }

    const params = new URLSearchParams({
      query,
      page: String(pageNum),
      per_page: String(PHOTOS_PER_PAGE),
      orientation: 'landscape'
    })
    const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
      headers: { Authorization: `Client-ID ${key}` }
    })

    if (!response.ok) {
      throw new Error('Failed to load photos')
    }

    const data = (await response.json()) as { results: UnsplashPhoto[]; total_pages: number }

    return {
      results: data.results ?? [],
      totalPages: data.total_pages ?? 0
    }
  }

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_UNSPLASH_KEY) {
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
        const { results, totalPages } = await fetchPhotos(1, debouncedSearch)

        if (!cancelled) {
          setPhotos(results)
          setHasMore(totalPages > 1)
        }
      } catch (err) {
        if (!cancelled) {
          setSearchError(err instanceof Error ? err.message : 'Could not load photos. Try another search.')
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
  }, [debouncedSearch])

  const handleLoadMore = async () => {
    const nextPage = page + 1

    setLoadingMore(true)
    setSearchError(null)

    try {
      const { results, totalPages } = await fetchPhotos(nextPage, debouncedSearch)

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
    const css = buildPhotoBackgroundCss(photo.urls.regular)

    setSelectedPhoto(photo)
    setBackgroundType(onStyleChange, 'photo')
    onStyleChange('background', css)
  }

  const handleUploadedMedia = (result: { url: string; mediaType: 'image' | 'video' }) => {
    setSelectedPhoto(null)

    if (result.mediaType === 'video') {
      setBackgroundType(onStyleChange, 'video')
      onStyleChange('background', buildVideoBackgroundValue(result.url))
    } else {
      setBackgroundType(onStyleChange, 'photo')
      onStyleChange('background', buildPhotoBackgroundCss(result.url))
    }
  }

  const activeAnimation = photoAnimation ?? defaultPhotoAnimation
  const currentMediaUrl = parseMediaUrl(value)
  const hasMediaSelected = Boolean(currentMediaUrl)
  const isCurrentVideo = backgroundType === 'video' || isVideoBackground({ background: value, backgroundType })

  const activePhoto =
    selectedPhoto ??
    photos.find(photo => value.includes(photo.urls.regular) || value.includes(photo.urls.thumb)) ??
    null

  const uploadedPreviewUrl =
    currentMediaUrl && !activePhoto
      ? currentMediaUrl.match(/\.(mp4|webm|mov)(\?|#|$)/i)
        ? currentMediaUrl
        : getImageKitThumbnailUrl(currentMediaUrl, 320)
      : null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <MediaUploadZone
        onUploaded={result => {
          setUploadError(null)
          handleUploadedMedia(result)
        }}
        onError={message => setUploadError(message)}
      />

      {uploadError && (
        <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'error.main' }}>{uploadError}</Typography>
      )}

      {uploadedPreviewUrl && hasMediaSelected && (
        <Box
          sx={{
            aspectRatio: '16 / 9',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'primary.main',
            overflow: 'hidden',
            boxShadow: theme => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          {isCurrentVideo ? (
            <Box
              component='video'
              src={uploadedPreviewUrl}
              muted
              playsInline
              loop
              autoPlay
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${uploadedPreviewUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
        </Box>
      )}

      <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary' }}>Or search Unsplash</Typography>

      <TextField
        label='Search photos'
        size='small'
        fullWidth
        value={search}
        onChange={e => setSearch(e.target.value)}
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
            gap: 0.75
          }}
        >
          {photos.map(photo => {
            const css = buildPhotoBackgroundCss(photo.urls.regular)
            const selected = value === css

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
        <Button
          variant='outlined'
          size='small'
          fullWidth
          onClick={() => void handleLoadMore()}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading more…' : 'Load more photos'}
        </Button>
      )}

      {activePhoto && (
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
      )}

      {hasMediaSelected && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
          <PropertyFieldLabel>{isCurrentVideo ? 'Video properties' : 'Photo properties'}</PropertyFieldLabel>
          <Box>
            <PropertyFieldLabel>Opacity: {photoOpacity}%</PropertyFieldLabel>
            <Slider
              value={photoOpacity}
              min={0}
              max={100}
              step={5}
              onChange={(_, v) => onStyleChange('backgroundPhotoOpacity', String(v))}
            />
          </Box>
          <FormControl size='small' fullWidth>
            <InputLabel>Hover effect</InputLabel>
            <Select
              label='Hover effect'
              value={activeAnimation}
              onChange={e => onStyleChange('backgroundPhotoAnimation', e.target.value)}
            >
              <MenuItem value='none'>None</MenuItem>
              <MenuItem value='zoom'>Zoom on hover</MenuItem>
              <MenuItem value='fade'>Fade on hover</MenuItem>
            </Select>
          </FormControl>
          <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary' }}>
            Hover the section on the canvas to preview. Switch to Preview mode for a cleaner view.
          </Typography>
          {photoAnimation === undefined && defaultPhotoAnimation !== 'none' && (
            <Typography sx={{ ...BUILDER_TYPOGRAPHY.subtle, color: 'text.secondary' }}>
              Using site default from Image Blocks ({defaultPhotoAnimation} on hover).
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

export default function BackgroundPicker({
  value,
  backgroundType = 'color',
  sectionType,
  photoOpacity = 100,
  photoAnimation,
  defaultPhotoAnimation = 'none',
  onStyleChange
}: Props) {
  const theme = useTheme()
  const [activeTab, setActiveTab] = useState<TabId>(backgroundType)

  useEffect(() => {
    setActiveTab(backgroundType)
  }, [backgroundType])

  const displayValue = value || '#ffffff'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          ...builderSegmentedControlSx(theme)
        }}
      >
        {TABS.map(tab => (
          <Box
            key={tab.id}
            component='button'
            type='button'
            onClick={() => {
              setActiveTab(tab.id)

              if (tab.id !== 'color') {
                applyBackgroundPreviewOpacity(onStyleChange)
              }
            }}
            sx={{
              flex: 1,
              border: 'none',
              cursor: 'pointer',
              py: 0.4375,
              px: 0.5,
              borderRadius: 0.75,
              ...BUILDER_TYPOGRAPHY.tab,
              color: activeTab === tab.id ? 'text.primary' : 'text.secondary',
              backgroundColor: activeTab === tab.id ? 'background.paper' : 'transparent',
              boxShadow:
                activeTab === tab.id
                  ? `0 1px 2px ${alpha(theme.palette.common.black, 0.06)}`
                  : 'none',
              transition: 'background-color 0.12s, color 0.12s',
              '&:hover': {
                color: 'text.primary',
                backgroundColor:
                  activeTab === tab.id
                    ? 'background.paper'
                    : alpha(theme.palette.text.primary, 0.04)
              }
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>

      <Box>
        {activeTab === 'color' && <ColorTab value={displayValue} onStyleChange={onStyleChange} />}
        {activeTab === 'pattern' && <PatternTab value={displayValue} onStyleChange={onStyleChange} />}
        {activeTab === 'gradient' && <GradientTab value={displayValue} onStyleChange={onStyleChange} />}
        {activeTab === 'photo' && (
          <PhotoTab
            value={displayValue}
            backgroundType={backgroundType}
            sectionType={sectionType}
            photoOpacity={photoOpacity}
            photoAnimation={photoAnimation}
            defaultPhotoAnimation={defaultPhotoAnimation}
            onStyleChange={onStyleChange}
          />
        )}
      </Box>
    </Box>
  )
}
