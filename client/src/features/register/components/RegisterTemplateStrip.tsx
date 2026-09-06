'use client'

import { useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { SITE_TEMPLATE_CATEGORY_LABELS } from '@/lib/constants/site-template'
import { getTemplateThumbnailDisplayUrl } from '@/lib/site-template/resolve-thumbnail'
import type { SiteTemplateSummary } from '@/models/site-template'

import { TemplateLivePreview } from '@/features/site-templates/components/TemplateLivePreview'

import { CREATIVE_START_OPTIONS } from '../constants/prompt-suggestions'
import { REGISTER_PALETTE, enterSx, shimmer, templateMarquee } from '../constants/register-theme'

type Props = {
  templates: SiteTemplateSummary[]
  loading: boolean
  disabled?: boolean
  onSelectTemplate: (templateId: string) => void
  onSelectBlank: () => void
  onFocusPrompt: () => void
  onScrollToTemplates: () => void
}

const ACCENTS = {
  violet: REGISTER_PALETTE.violet,
  cyan: REGISTER_PALETTE.cyan,
  pink: REGISTER_PALETTE.pink
} as const

/** Compact laptop-window proportion — avoids the squat, stretched strip look. */
const CARD_WIDTH = 268
const PREVIEW_HEIGHT = 168
const CARD_GAP = 18
/** Seconds for one full loop of the duplicated track (~slow gallery drift). */
const MARQUEE_SECONDS_PER_CARD = 5.5

export function RegisterTemplateStrip({
  templates,
  loading,
  disabled,
  onSelectTemplate,
  onSelectBlank,
  onFocusPrompt,
  onScrollToTemplates
}: Props) {
  const [paused, setPaused] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)

    sync()
    media.addEventListener('change', sync)

    return () => media.removeEventListener('change', sync)
  }, [])

  const loopTemplates = useMemo(() => {
    if (templates.length === 0) {
      return []
    }

    // Pad short catalogs so the rail feels full, then duplicate once for a seamless -50% loop.
    let base = [...templates]

    while (base.length < 4) {
      base = [...base, ...templates]
    }

    return [0, 1].flatMap(copy => base.map(template => ({ template, copy })))
  }, [templates])

  const marqueeDurationSec = Math.max(loopTemplates.length * 0.5 * MARQUEE_SECONDS_PER_CARD, 28)

  return (
    <Box sx={{ width: '100%', maxWidth: 1160, mx: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 1.75,
          mb: { xs: 7, md: 9 },
          ...enterSx(460)
        }}
      >
        {CREATIVE_START_OPTIONS.map(option => {
          const accent = ACCENTS[option.accent]

          return (
            <Box
              key={option.id}
              component='button'
              type='button'
              disabled={disabled}
              onClick={() => {
                if (option.id === 'ai') {
                  onFocusPrompt()
                } else if (option.id === 'blank') {
                  onSelectBlank()
                } else {
                  onScrollToTemplates()
                }
              }}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'left',
                cursor: 'pointer',
                border: `1px solid ${REGISTER_PALETTE.hairline}`,
                borderRadius: '18px',
                backgroundColor: REGISTER_PALETTE.surface,
                backdropFilter: 'blur(18px)',
                p: 2.25,
                display: 'flex',
                gap: 1.75,
                alignItems: 'flex-start',
                transition:
                  'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease, background-color 0.28s ease',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  background: `radial-gradient(ellipse 70% 100% at 0% 0%, ${alpha(accent, 0.22)}, transparent 65%)`
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: alpha(accent, 0.5),
                  backgroundColor: REGISTER_PALETTE.surfaceStrong
                },
                '&:hover::before': { opacity: 1 },
                '&:disabled': { opacity: 0.55, cursor: 'not-allowed', transform: 'none' }
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 42,
                  height: 42,
                  borderRadius: '13px',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  color: accent,
                  border: `1px solid ${alpha(accent, 0.3)}`,
                  background: `linear-gradient(140deg, ${alpha(accent, 0.24)}, ${alpha(accent, 0.06)})`
                }}
              >
                <i className={option.icon} style={{ fontSize: '1.2rem' }} />
              </Box>
              <Box sx={{ position: 'relative' }}>
                <Typography
                  sx={{
                    fontFamily: 'var(--register-display)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '-0.02em',
                    color: REGISTER_PALETTE.text
                  }}
                >
                  {option.title}
                </Typography>
                <Typography sx={{ mt: 0.4, fontSize: '0.83rem', lineHeight: 1.5, color: REGISTER_PALETTE.textMuted }}>
                  {option.subtitle}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>

      <Box
        id='register-templates'
        sx={{
          mb: 3,
          scrollMarginTop: 32,
          ...enterSx(520)
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--register-display)',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '1.9rem' },
            letterSpacing: '-0.03em',
            color: REGISTER_PALETTE.text
          }}
        >
          Or start from a published look
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.92rem', color: REGISTER_PALETTE.textMuted }}>
          Real site snapshots — pick one and it lands in your builder ready to customise.
        </Typography>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            gap: `${CARD_GAP}px`,
            overflow: 'hidden',
            px: 0.5
          }}
        >
          {[0, 1, 2, 3].map(item => (
            <Box
              key={item}
              sx={{
                width: CARD_WIDTH,
                flexShrink: 0,
                borderRadius: '20px',
                border: `1px solid ${REGISTER_PALETTE.hairline}`,
                overflow: 'hidden',
                backgroundColor: alpha('#0A0C16', 0.75)
              }}
            >
              <Box
                sx={{
                  height: PREVIEW_HEIGHT,
                  background: `linear-gradient(100deg, ${alpha('#FFFFFF', 0.03)}, ${alpha('#FFFFFF', 0.09)}, ${alpha('#FFFFFF', 0.03)})`,
                  backgroundSize: '200% 100%',
                  animation: `${shimmer} 1.6s linear infinite`,
                  animationDelay: `${item * -0.25}s`
                }}
              />
              <Box sx={{ height: 64, backgroundColor: alpha('#FFFFFF', 0.02) }} />
            </Box>
          ))}
        </Box>
      ) : templates.length === 0 ? (
        <Box
          sx={{
            borderRadius: '18px',
            border: `1px dashed ${REGISTER_PALETTE.hairlineStrong}`,
            p: 5,
            textAlign: 'center',
            backgroundColor: REGISTER_PALETTE.surface
          }}
        >
          <Typography sx={{ color: REGISTER_PALETTE.textMuted }}>
            No published templates yet — describe your site above and AI will build it from scratch.
          </Typography>
        </Box>
      ) : (
        <Box
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false)
            }
          }}
          sx={{
            position: 'relative',
            mx: { xs: -2.5, sm: -4, md: -5 },
            px: { xs: 2.5, sm: 4, md: 5 },
            overflow: 'hidden',
            maskImage: {
              xs: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
              md: 'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)'
            },
            WebkitMaskImage: {
              xs: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
              md: 'linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: `${CARD_GAP}px`,
              py: 1,
              ...(reduceMotion
                ? {
                    overflowX: 'auto',
                    width: '100%',
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' }
                  }
                : {
                    width: 'max-content',
                    animation: `${templateMarquee} ${marqueeDurationSec}s linear infinite`,
                    animationPlayState: paused || disabled ? 'paused' : 'running'
                  })
            }}
          >
            {(reduceMotion ? templates.map(template => ({ template, copy: 0 })) : loopTemplates).map(
              ({ template, copy }, index) => {
                const thumbnail = getTemplateThumbnailDisplayUrl(template, 640)
                const hasLivePreview = Boolean(template.homePreview?.blocks.length)

                return (
                  <Box
                    key={`${template.id}-${copy}-${index}`}
                    role='button'
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled || undefined}
                    aria-label={`Use the ${template.name} template`}
                    onClick={() => {
                      if (!disabled) {
                        onSelectTemplate(template.id)
                      }
                    }}
                    onKeyDown={event => {
                      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault()
                        onSelectTemplate(template.id)
                      }
                    }}
                    sx={{
                      width: CARD_WIDTH,
                      flexShrink: 0,
                      scrollSnapAlign: 'start',
                      textAlign: 'left',
                      opacity: disabled ? 0.6 : 1,
                      border: `1px solid ${REGISTER_PALETTE.hairline}`,
                      borderRadius: '20px',
                      overflow: 'hidden',
                      backgroundColor: alpha('#0A0C16', 0.82),
                      backdropFilter: 'blur(18px)',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      boxShadow: `0 18px 40px ${alpha('#000000', 0.35)}`,
                      transition:
                        'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, border-color 0.3s ease',
                      '&:hover': disabled
                        ? {}
                        : {
                            transform: 'translateY(-6px)',
                            borderColor: alpha(REGISTER_PALETTE.violetSoft, 0.55),
                            boxShadow: `0 28px 56px ${alpha('#000000', 0.55)}, 0 0 0 1px ${alpha(REGISTER_PALETTE.violet, 0.28)}`
                          },
                      '&:hover .template-overlay': { opacity: disabled ? 0 : 1 },
                      '&:focus-visible': {
                        outline: 'none',
                        borderColor: alpha(REGISTER_PALETTE.violetSoft, 0.7),
                        boxShadow: `0 0 0 4px ${alpha(REGISTER_PALETTE.violet, 0.28)}`
                      },
                      '&:focus-visible .template-overlay': { opacity: 1 }
                    }}
                  >
                    <Box
                      inert
                      sx={{
                        position: 'relative',
                        height: PREVIEW_HEIGHT,
                        overflow: 'hidden',
                        backgroundColor: alpha('#FFFFFF', 0.04),
                        borderBottom: `1px solid ${REGISTER_PALETTE.hairline}`
                      }}
                    >
                      {/* Soft browser chrome so the snapshot reads as a window, not a stretched tile */}
                      <Box
                        sx={{
                          height: 22,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.65,
                          px: 1.25,
                          backgroundColor: alpha('#FFFFFF', 0.04),
                          borderBottom: `1px solid ${REGISTER_PALETTE.hairline}`
                        }}
                      >
                        {[REGISTER_PALETTE.pink, REGISTER_PALETTE.amber, REGISTER_PALETTE.cyan].map(color => (
                          <Box
                            key={color}
                            sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: alpha(color, 0.7) }}
                          />
                        ))}
                        <Box
                          sx={{
                            ml: 0.5,
                            flex: 1,
                            height: 10,
                            maxWidth: 120,
                            borderRadius: 999,
                            backgroundColor: alpha('#FFFFFF', 0.06)
                          }}
                        />
                      </Box>

                      <Box sx={{ position: 'relative', height: PREVIEW_HEIGHT - 22, overflow: 'hidden' }}>
                        {hasLivePreview ? (
                          <TemplateLivePreview
                            blocks={template.homePreview!.blocks}
                            siteStyles={template.homePreview!.siteStyles}
                            height={PREVIEW_HEIGHT - 22}
                            showBrowserChrome={false}
                          />
                        ) : (
                          <Box
                            component='img'
                            src={thumbnail}
                            alt=''
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'top center',
                              display: 'block'
                            }}
                          />
                        )}

                        <Box
                          className='template-overlay'
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            opacity: 0,
                            transition: 'opacity 0.28s ease',
                            display: 'grid',
                            placeItems: 'center',
                            background: `linear-gradient(180deg, ${alpha('#04050B', 0.15)}, ${alpha('#04050B', 0.88)})`
                          }}
                        >
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.75,
                              px: 1.75,
                              height: 34,
                              borderRadius: 999,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: '#0A0C16',
                              background: `linear-gradient(100deg, ${REGISTER_PALETTE.violetSoft}, ${REGISTER_PALETTE.cyan})`
                            }}
                          >
                            Use this template
                            <i className='ri-arrow-right-line' />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ px: 1.75, py: 1.5 }}>
                      <Typography
                        className='line-clamp-1'
                        sx={{
                          fontFamily: 'var(--register-display)',
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          color: REGISTER_PALETTE.text
                        }}
                      >
                        {template.name}
                      </Typography>
                      <Typography sx={{ mt: 0.3, fontSize: '0.74rem', color: REGISTER_PALETTE.textFaint }}>
                        {SITE_TEMPLATE_CATEGORY_LABELS[template.category]} · {template.pageCount} pages
                      </Typography>
                    </Box>
                  </Box>
                )
              }
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}
