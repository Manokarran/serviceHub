'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, keyframes } from '@mui/material/styles'

import { registerFontVariablesClassName } from '../constants/register-fonts'
import { REGISTER_PALETTE, auroraDrift, shimmer } from '../constants/register-theme'

export type BuildPhase = 'building' | 'launching'

export type BuildOverlayMode = 'ai' | 'template' | 'blank' | 'theme' | 'restyle' | 'plan' | 'generate'

type Props = {
  open: boolean
  companyName?: string
  mode: BuildOverlayMode
  phase: BuildPhase
  onLaunched?: () => void
}

const STEP_MS = 1100
const THEME_STEP_MS = 720
const LAUNCH_MS = 900

const blockIn = keyframes`
  0%   { opacity: 0; transform: translate3d(0, 14px, 0) scale(0.97); filter: blur(6px); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
`

const stepIn = keyframes`
  from { opacity: 0; transform: translate3d(-10px, 0, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
`

const scanLine = keyframes`
  0%   { transform: translateY(-10%); opacity: 0; }
  12%  { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateY(1000%); opacity: 0; }
`

const launchZoom = keyframes`
  0%   { transform: scale(1); opacity: 1; filter: blur(0); }
  55%  { transform: scale(1.06); opacity: 1; filter: blur(0); }
  100% { transform: scale(1.5); opacity: 0; filter: blur(14px); }
`

const flash = keyframes`
  0%   { opacity: 0; }
  45%  { opacity: 0.9; }
  100% { opacity: 0; }
`

const spinRing = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const STEPS = {
  ai: [
    { label: 'Reading your brief', icon: 'ri-file-text-line' },
    { label: 'Choosing an art direction', icon: 'ri-palette-line' },
    { label: 'Laying out your pages', icon: 'ri-layout-3-line' },
    { label: 'Writing your copy', icon: 'ri-quill-pen-line' },
    { label: 'Opening the builder', icon: 'ri-rocket-2-line' }
  ],
  generate: [
    { label: 'Reading your brief', icon: 'ri-file-text-line' },
    { label: 'Choosing an art direction', icon: 'ri-palette-line' },
    { label: 'Laying out your pages', icon: 'ri-layout-3-line' },
    { label: 'Writing your copy', icon: 'ri-quill-pen-line' },
    { label: 'Refreshing the canvas', icon: 'ri-rocket-2-line' }
  ],
  template: [
    { label: 'Creating your workspace', icon: 'ri-building-line' },
    { label: 'Applying the template', icon: 'ri-layout-masonry-line' },
    { label: 'Copying pages and styles', icon: 'ri-stack-line' },
    { label: 'Opening the builder', icon: 'ri-rocket-2-line' }
  ],
  blank: [
    { label: 'Creating your workspace', icon: 'ri-building-line' },
    { label: 'Preparing a clean canvas', icon: 'ri-brush-line' },
    { label: 'Opening the builder', icon: 'ri-rocket-2-line' }
  ],
  theme: [
    { label: 'Loading the palette', icon: 'ri-palette-line' },
    { label: 'Repainting your controls', icon: 'ri-brush-line' },
    { label: 'Refreshing the canvas', icon: 'ri-layout-3-line' }
  ],
  restyle: [
    { label: 'Reading the selection', icon: 'ri-eye-line' },
    { label: 'Choosing a direction', icon: 'ri-compass-3-line' },
    { label: 'Restyling blocks', icon: 'ri-magic-line' },
    { label: 'Updating the canvas', icon: 'ri-layout-3-line' }
  ],
  plan: [
    { label: 'Understanding the request', icon: 'ri-chat-3-line' },
    { label: 'Planning the change', icon: 'ri-route-line' },
    { label: 'Applying to the canvas', icon: 'ri-checkbox-circle-line' }
  ]
} as const

const HEADLINES: Record<BuildOverlayMode, string> = {
  ai: 'Building your website',
  generate: 'Building your website',
  template: 'Setting up your site',
  blank: 'Preparing your workspace',
  theme: 'Applying your theme',
  restyle: 'Redesigning with AI',
  plan: 'Making it happen'
}

/** Wireframe rows that pop in one by one so the user watches a site being assembled. */
const WIREFRAME = [
  { height: 26, kind: 'nav' as const },
  { height: 92, kind: 'hero' as const },
  { height: 54, kind: 'cols' as const },
  { height: 46, kind: 'media' as const },
  { height: 24, kind: 'footer' as const }
]

export function BuildingWebsiteOverlay({ open, companyName, mode, phase, onLaunched }: Props) {
  const steps = STEPS[mode]
  const [activeStep, setActiveStep] = useState(0)
  const [softProgress, setSoftProgress] = useState(0)
  const launchedRef = useRef(false)
  const onLaunchedRef = useRef(onLaunched)
  const stepMs = mode === 'theme' || mode === 'plan' ? THEME_STEP_MS : STEP_MS

  onLaunchedRef.current = onLaunched

  useEffect(() => {
    if (!open) {
      setActiveStep(0)
      setSoftProgress(0)
      launchedRef.current = false

      return
    }

    const lastWorkingStep = Math.max(0, steps.length - 2)

    const timer = window.setInterval(() => {
      setActiveStep(current => Math.min(current + 1, lastWorkingStep))
    }, stepMs)

    return () => window.clearInterval(timer)
  }, [open, stepMs, steps.length])

  // Keep the bar inching forward during long AI generates after checklist steps stall.
  useEffect(() => {
    if (!open || phase !== 'building') {
      return
    }

    const timer = window.setInterval(() => {
      setSoftProgress(current => Math.min(current + 1.2, 88))
    }, 400)

    return () => window.clearInterval(timer)
  }, [open, phase])

  useEffect(() => {
    if (!open || phase !== 'launching' || launchedRef.current) {
      return
    }

    launchedRef.current = true
    setActiveStep(steps.length - 1)
    setSoftProgress(100)

    // Deliberately not cleaned up: the launch must survive the re-render it triggers.
    window.setTimeout(() => onLaunchedRef.current?.(), LAUNCH_MS)
  }, [open, phase, steps.length])

  if (!open) {
    return null
  }

  const headline = HEADLINES[mode]
  const stepProgress = Math.round(((activeStep + 0.55) / steps.length) * 100)
  const progress = phase === 'launching' ? 100 : Math.max(stepProgress, Math.round(softProgress))

  return (
    <Box
      role='status'
      aria-live='polite'
      className={registerFontVariablesClassName}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        backgroundColor: REGISTER_PALETTE.ink,
        fontFamily: 'var(--register-body)'
      }}
    >
      <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {[
          { color: REGISTER_PALETTE.violet, top: '-25%', left: '-10%', size: 760, duration: 18 },
          { color: REGISTER_PALETTE.cyan, top: '10%', left: '62%', size: 620, duration: 22 },
          { color: REGISTER_PALETTE.pink, top: '58%', left: '18%', size: 640, duration: 26 }
        ].map((blob, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: blob.top,
              left: blob.left,
              width: blob.size,
              height: blob.size,
              borderRadius: '50%',
              background: `radial-gradient(circle at 40% 40%, ${alpha(blob.color, 0.6)}, transparent 68%)`,
              filter: 'blur(80px)',
              animation: `${auroraDrift} ${blob.duration}s ease-in-out infinite`,
              animationDelay: `${index * -4}s`
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 940,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' },
          alignItems: 'center',
          gap: { xs: 4, md: 6 },
          animation:
            phase === 'launching' ? `${launchZoom} ${LAUNCH_MS}ms cubic-bezier(0.6, 0, 0.4, 1) forwards` : 'none'
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              px: 1.25,
              py: 0.5,
              mb: 2.25,
              borderRadius: 999,
              border: `1px solid ${REGISTER_PALETTE.hairline}`,
              backgroundColor: REGISTER_PALETTE.surface
            }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `2px solid ${alpha(REGISTER_PALETTE.violetSoft, 0.25)}`,
                borderTopColor: REGISTER_PALETTE.violetSoft,
                animation: `${spinRing} 0.9s linear infinite`
              }}
            />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: REGISTER_PALETTE.textMuted }}>
              {`${progress}% complete`}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: 'var(--register-display)',
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.7rem' },
              letterSpacing: '-0.035em',
              lineHeight: 1.08,
              backgroundImage: `linear-gradient(100deg, ${REGISTER_PALETTE.text} 10%, ${REGISTER_PALETTE.violetSoft} 45%, ${REGISTER_PALETTE.cyan} 85%, ${REGISTER_PALETTE.text})`,
              backgroundSize: '220% 100%',
              animation: `${shimmer} 3.4s linear infinite`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent'
            }}
          >
            {headline}
          </Typography>

          {companyName ? (
            <Typography sx={{ mt: 1, fontSize: '1rem', color: REGISTER_PALETTE.textMuted }}>
              {mode === 'theme' ? (
                <>
                  switching to{' '}
                  <Box component='strong' sx={{ color: REGISTER_PALETTE.text }}>
                    {companyName}
                  </Box>
                </>
              ) : (
                <>
                  for{' '}
                  <Box component='strong' sx={{ color: REGISTER_PALETTE.text }}>
                    {companyName}
                  </Box>
                </>
              )}
            </Typography>
          ) : null}

          <Box sx={{ mt: 3.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {steps.map((step, index) => {
              const isDone = index < activeStep || phase === 'launching'
              const isActive = index === activeStep && phase !== 'launching'

              return (
                <Box
                  key={step.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    opacity: isDone || isActive ? 1 : 0.38,
                    transition: 'opacity 0.4s ease',
                    animation: `${stepIn} 0.5s ease both`,
                    animationDelay: `${index * 90}ms`
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '0.85rem',
                      transition: 'all 0.35s ease',
                      color: isDone ? '#0A0C16' : isActive ? REGISTER_PALETTE.violetSoft : REGISTER_PALETTE.textFaint,
                      border: `1px solid ${
                        isDone
                          ? 'transparent'
                          : isActive
                            ? alpha(REGISTER_PALETTE.violetSoft, 0.5)
                            : REGISTER_PALETTE.hairline
                      }`,
                      background: isDone
                        ? `linear-gradient(120deg, ${REGISTER_PALETTE.violetSoft}, ${REGISTER_PALETTE.cyan})`
                        : isActive
                          ? alpha(REGISTER_PALETTE.violet, 0.18)
                          : 'transparent',
                      boxShadow: isActive ? `0 0 0 6px ${alpha(REGISTER_PALETTE.violet, 0.12)}` : 'none'
                    }}
                  >
                    <i className={isDone ? 'ri-check-line' : step.icon} />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.92rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isDone || isActive ? REGISTER_PALETTE.text : REGISTER_PALETTE.textMuted
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>

          <Box
            sx={{
              mt: 3.5,
              height: 4,
              borderRadius: 999,
              overflow: 'hidden',
              backgroundColor: alpha('#FFFFFF', 0.09)
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: 999,
                transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                background: `linear-gradient(90deg, ${REGISTER_PALETTE.violet}, ${REGISTER_PALETTE.cyan})`,
                boxShadow: `0 0 18px ${alpha(REGISTER_PALETTE.cyan, 0.55)}`
              }}
            />
          </Box>
        </Box>

        <Box
          aria-hidden
          sx={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            border: `1px solid ${REGISTER_PALETTE.hairlineStrong}`,
            backgroundColor: alpha('#0A0C16', 0.86),
            backdropFilter: 'blur(20px)',
            boxShadow: `0 40px 110px ${alpha('#000000', 0.65)}`,
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.75,
              py: 1.25,
              borderBottom: `1px solid ${alpha('#FFFFFF', 0.08)}`
            }}
          >
            {['#F87171', '#FBBF24', '#34D399'].map(dot => (
              <Box key={dot} sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: alpha(dot, 0.75) }} />
            ))}
            <Box
              sx={{
                ml: 1.25,
                flex: 1,
                height: 20,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                px: 1.25,
                fontSize: '0.66rem',
                color: REGISTER_PALETTE.textFaint,
                backgroundColor: alpha('#FFFFFF', 0.05)
              }}
            >
              {companyName && mode !== 'theme' ? companyName.toLowerCase().replace(/\s+/g, '') : 'your-site'}
              .servicehub.app
            </Box>
          </Box>

          <Box
            sx={{ position: 'relative', p: 1.75, display: 'flex', flexDirection: 'column', gap: 1.25, minHeight: 300 }}
          >
            {WIREFRAME.map((row, index) => {
              const revealed = index <= activeStep + 1 || phase === 'launching'

              return (
                <Box
                  key={row.kind}
                  sx={{
                    height: row.height,
                    display: 'flex',
                    gap: 1,
                    opacity: revealed ? 1 : 0,
                    animation: revealed ? `${blockIn} 0.6s cubic-bezier(0.22, 1, 0.36, 1) both` : 'none',
                    animationDelay: `${index * 120}ms`
                  }}
                >
                  {row.kind === 'cols' || row.kind === 'media' ? (
                    [0, 1, 2].map(column => (
                      <Box
                        key={column}
                        sx={{
                          flex: 1,
                          borderRadius: '10px',
                          background:
                            row.kind === 'media'
                              ? `linear-gradient(120deg, ${alpha(REGISTER_PALETTE.cyan, 0.22)}, ${alpha(REGISTER_PALETTE.violet, 0.16)})`
                              : alpha('#FFFFFF', 0.07),
                          border: `1px solid ${alpha('#FFFFFF', 0.07)}`
                        }}
                      />
                    ))
                  ) : (
                    <Box
                      sx={{
                        flex: 1,
                        borderRadius: '10px',
                        border: `1px solid ${alpha('#FFFFFF', 0.07)}`,
                        background:
                          row.kind === 'hero'
                            ? `linear-gradient(120deg, ${alpha(REGISTER_PALETTE.violet, 0.4)}, ${alpha(REGISTER_PALETTE.cyan, 0.22)})`
                            : alpha('#FFFFFF', 0.07)
                      }}
                    />
                  )}
                </Box>
              )
            })}

            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 26,
                background: `linear-gradient(180deg, transparent, ${alpha(REGISTER_PALETTE.cyan, 0.35)}, transparent)`,
                animation: `${scanLine} 2.6s ease-in-out infinite`
              }}
            />
          </Box>
        </Box>
      </Box>

      {phase === 'launching' ? (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(ellipse at center, ${alpha(REGISTER_PALETTE.violetSoft, 0.95)}, ${alpha(
              REGISTER_PALETTE.cyan,
              0.5
            )} 45%, transparent 78%)`,
            animation: `${flash} ${LAUNCH_MS}ms ease-out forwards`,
            pointerEvents: 'none'
          }}
        />
      ) : null}
    </Box>
  )
}
