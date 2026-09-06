'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, keyframes, useTheme } from '@mui/material/styles'

import { BUILDER_Z_INDEX } from '../constants/builderLayout'

export type BuilderWorkKind = 'theme' | 'restyle' | 'generate' | 'plan'
export type BuilderWorkPhase = 'building' | 'launching'

type Props = {
  open: boolean
  kind: BuilderWorkKind
  title?: string
  phase: BuilderWorkPhase
  onLaunched?: () => void
}

const STEP_MS = 520
const EXIT_MS = 420

const cardIn = keyframes`
  0%   { opacity: 0; transform: translate3d(0, 18px, 0) scale(0.94); }
  100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
`

const cardOut = keyframes`
  0%   { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
  100% { opacity: 0; transform: translate3d(0, -8px, 0) scale(0.97); }
`

const scrimIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const scrimOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`

const spinRing = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const pulseDot = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.55; }
  50%      { transform: scale(1.35); opacity: 1; }
`

const STEPS: Record<BuilderWorkKind, { label: string; icon: string }[]> = {
  theme: [
    { label: 'Loading palette', icon: 'ri-palette-line' },
    { label: 'Repainting controls', icon: 'ri-brush-line' },
    { label: 'Refreshing canvas', icon: 'ri-layout-3-line' }
  ],
  restyle: [
    { label: 'Reading selection', icon: 'ri-eye-line' },
    { label: 'Choosing direction', icon: 'ri-compass-3-line' },
    { label: 'Updating canvas', icon: 'ri-magic-line' }
  ],
  generate: [
    { label: 'Reading brief', icon: 'ri-file-text-line' },
    { label: 'Laying out pages', icon: 'ri-layout-3-line' },
    { label: 'Refreshing canvas', icon: 'ri-rocket-2-line' }
  ],
  plan: [
    { label: 'Understanding request', icon: 'ri-chat-3-line' },
    { label: 'Planning change', icon: 'ri-route-line' },
    { label: 'Applying to canvas', icon: 'ri-checkbox-circle-line' }
  ]
}

const HEADLINES: Record<BuilderWorkKind, string> = {
  theme: 'Applying theme',
  restyle: 'Redesigning',
  generate: 'Building pages',
  plan: 'Making it happen'
}

const KIND_ICONS: Record<BuilderWorkKind, string> = {
  theme: 'ri-palette-line',
  restyle: 'ri-magic-line',
  generate: 'ri-layout-3-line',
  plan: 'ri-sparkling-line'
}

export function BuilderWorkCard({ open, kind, title, phase, onLaunched }: Props) {
  const theme = useTheme()
  const steps = STEPS[kind]
  const [activeStep, setActiveStep] = useState(0)
  const [exiting, setExiting] = useState(false)
  const launchedRef = useRef(false)
  const onLaunchedRef = useRef(onLaunched)

  onLaunchedRef.current = onLaunched

  useEffect(() => {
    if (!open) {
      setActiveStep(0)
      setExiting(false)
      launchedRef.current = false

      return
    }

    const lastWorkingStep = Math.max(0, steps.length - 2)
    const timer = window.setInterval(() => {
      setActiveStep(current => Math.min(current + 1, lastWorkingStep))
    }, STEP_MS)

    return () => window.clearInterval(timer)
  }, [open, steps.length])

  useEffect(() => {
    if (!open || phase !== 'launching' || launchedRef.current) {
      return
    }

    launchedRef.current = true
    setActiveStep(steps.length - 1)
    setExiting(true)

    window.setTimeout(() => onLaunchedRef.current?.(), EXIT_MS)
  }, [open, phase, steps.length])

  if (!open) {
    return null
  }

  const progress = phase === 'launching' ? 100 : Math.round(((activeStep + 0.55) / steps.length) * 100)
  const accent = theme.palette.primary.main
  const accentAlt = theme.palette.secondary?.main ?? theme.palette.info.main

  return (
    <Box
      role='status'
      aria-live='polite'
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: BUILDER_Z_INDEX.dockOverlay + 40,
        display: 'grid',
        placeItems: 'center',
        px: 2,
        pointerEvents: 'none',
        animation: `${exiting ? scrimOut : scrimIn} ${exiting ? EXIT_MS : 280}ms ease both`
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.28 : 0.18),
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)'
        }}
      />

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 360,
          pointerEvents: 'auto',
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.72 : 0.82),
          backdropFilter: 'blur(18px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.2)',
          boxShadow: `0 18px 48px ${alpha(theme.palette.common.black, 0.28)}, 0 0 0 1px ${alpha(accent, 0.12)}`,
          animation: `${exiting ? cardOut : cardIn} ${exiting ? EXIT_MS : 360}ms cubic-bezier(0.22, 1, 0.36, 1) both`
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(120% 80% at 0% 0%, ${alpha(accent, 0.18)}, transparent 55%), radial-gradient(100% 70% at 100% 100%, ${alpha(accentAlt, 0.14)}, transparent 50%)`,
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ position: 'relative', p: 2.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                border: `2px solid ${alpha(accent, 0.2)}`,
                borderTopColor: accent,
                animation: phase === 'launching' ? 'none' : `${spinRing} 0.85s linear infinite`,
                backgroundColor: alpha(accent, 0.08),
                color: accent,
                fontSize: '1rem'
              }}
            >
              {phase === 'launching' ? <i className='ri-check-line' /> : <i className={KIND_ICONS[kind]} />}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {HEADLINES[kind]}
              </Typography>
              {title ? (
                <Typography sx={{ mt: 0.35, fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.35 }}>
                  {kind === 'theme' ? (
                    <>
                      Switching to <Box component='strong' sx={{ color: 'text.primary', fontWeight: 700 }}>{title}</Box>
                    </>
                  ) : (
                    title
                  )}
                </Typography>
              ) : null}
            </Box>

            <Typography
              sx={{
                flexShrink: 0,
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'text.secondary',
                pt: 0.35
              }}
            >
              {progress}%
            </Typography>
          </Box>

          <Box sx={{ mt: 1.75, display: 'flex', flexDirection: 'column', gap: 0.85 }}>
            {steps.map((step, index) => {
              const isDone = index < activeStep || phase === 'launching'
              const isActive = index === activeStep && phase !== 'launching'

              return (
                <Box
                  key={step.label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    opacity: isDone || isActive ? 1 : 0.4,
                    transition: 'opacity 0.25s ease'
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      flexShrink: 0,
                      backgroundColor: isDone ? accent : isActive ? accentAlt : alpha(theme.palette.text.primary, 0.25),
                      animation: isActive ? `${pulseDot} 1.1s ease-in-out infinite` : 'none'
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.76rem',
                      fontWeight: isActive ? 650 : 500,
                      color: isDone || isActive ? 'text.primary' : 'text.secondary'
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
              mt: 1.75,
              height: 3,
              borderRadius: 999,
              overflow: 'hidden',
              backgroundColor: alpha(theme.palette.text.primary, 0.08)
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: 999,
                transition: 'width 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                background: `linear-gradient(90deg, ${accent}, ${accentAlt})`
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
