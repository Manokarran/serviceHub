'use client'

import Box from '@mui/material/Box'

import { ANIMATED_HERO_BACKGROUND_TYPES, DEFAULT_HERO_SPLIT_VISUAL_ANIMATION } from '../../constants/heroVisual'
import type { HeroSplitVisualAnimation } from '../../types'
import { buildHeroVisualGradient, buildHeroVisualShiftGradient } from '../../utils/heroVisualHelpers'

type Props = {
  animation?: HeroSplitVisualAnimation
  colorStart: string
  colorEnd: string
  mode?: 'hero-column' | 'section-column' | 'section-background'
}

export const SHARED_KEYFRAMES = {
  '@keyframes heroFloatA': {
    '0%, 100%': { transform: 'translate(0, 0)' },
    '50%': { transform: 'translate(-12px, -24px)' }
  },
  '@keyframes heroFloatB': {
    '0%, 100%': { transform: 'translate(0, 0)' },
    '50%': { transform: 'translate(16px, -18px)' }
  },
  '@keyframes heroFloatC': {
    '0%, 100%': { transform: 'translate(0, 0)' },
    '50%': { transform: 'translate(-8px, 14px)' }
  },
  '@keyframes heroOrbit': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  '@keyframes heroPulseRing': {
    '0%': { transform: 'scale(0.65)', opacity: 0.55 },
    '100%': { transform: 'scale(1.35)', opacity: 0 }
  },
  '@keyframes heroGradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' }
  },
  '@keyframes heroBlobMorphA': {
    '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
    '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
  },
  '@keyframes heroBlobMorphB': {
    '0%, 100%': { borderRadius: '40% 60% 55% 45% / 55% 45% 60% 40%' },
    '50%': { borderRadius: '65% 35% 40% 60% / 35% 65% 45% 55%' }
  },
  '@keyframes heroAuroraDriftA': {
    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
    '33%': { transform: 'translate(12%, -8%) scale(1.08)' },
    '66%': { transform: 'translate(-8%, 10%) scale(0.95)' }
  },
  '@keyframes heroAuroraDriftB': {
    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
    '50%': { transform: 'translate(-14%, 12%) scale(1.12)' }
  },
  '@keyframes heroMeshDrift': {
    '0%, 100%': { transform: 'translate(0, 0)' },
    '50%': { transform: 'translate(10%, -12%)' }
  },
  '@keyframes heroWaveSlide': {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' }
  },
  '@keyframes heroDotGridMove': {
    '0%': { backgroundPosition: '0 0' },
    '100%': { backgroundPosition: '24px 24px' }
  },
  '@keyframes heroShimmerSweep': {
    '0%': { transform: 'translateX(-120%) skewX(-18deg)' },
    '100%': { transform: 'translateX(220%) skewX(-18deg)' }
  },
  '@keyframes heroTwinkle': {
    '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
    '50%': { opacity: 1, transform: 'scale(1.35)' }
  },
  '@keyframes heroGeoSpin': {
    '0%, 100%': { transform: 'rotate(0deg) translateY(0)' },
    '50%': { transform: 'rotate(12deg) translateY(-16px)' }
  },
  '@keyframes heroParticleRise': {
    '0%': { transform: 'translateY(20%)', opacity: 0 },
    '15%': { opacity: 0.85 },
    '85%': { opacity: 0.45 },
    '100%': { transform: 'translateY(-120%)', opacity: 0 }
  }
} as const

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)'

function motionSafe(animation: string, fallback = 'none') {
  return {
    animation,
    [REDUCED_MOTION]: { animation: fallback }
  }
}

function StaticVisual() {
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          inset: '15%',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.25)',
          backgroundColor: 'rgba(255,255,255,0.08)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 96,
          height: 96,
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.12)'
        }}
      />
    </>
  )
}

function FloatingCirclesVisual() {
  const circles = [
    { size: 120, top: '12%', left: '18%', delay: '0s', duration: '7s', opacity: 0.18 },
    { size: 72, top: '55%', left: '62%', delay: '-2s', duration: '5.5s', opacity: 0.14 },
    { size: 48, top: '28%', left: '72%', delay: '-1s', duration: '6s', opacity: 0.2 },
    { size: 160, top: '68%', left: '8%', delay: '-3s', duration: '8s', opacity: 0.1 },
    { size: 36, top: '8%', left: '58%', delay: '-4s', duration: '4.5s', opacity: 0.22 }
  ]

  return (
    <>
      {circles.map((circle, index) => (
        <Box
          key={`${circle.size}-${circle.top}`}
          sx={{
            position: 'absolute',
            top: circle.top,
            left: circle.left,
            width: circle.size,
            height: circle.size,
            borderRadius: '50%',
            backgroundColor: `rgba(255,255,255,${circle.opacity})`,
            ...motionSafe(
              `heroFloat${index % 3 === 0 ? 'A' : index % 3 === 1 ? 'B' : 'C'} ${circle.duration} ease-in-out infinite`,
              'none'
            ),
            animationDelay: circle.delay
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          inset: '18%',
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(2px)'
        }}
      />
    </>
  )
}

function OrbitingDotsVisual() {
  const orbits = [
    { duration: '14s', dotSize: 10, inset: '22%' },
    { duration: '10s', dotSize: 8, inset: '28%', reverse: true },
    { duration: '7s', dotSize: 6, inset: '34%' }
  ]

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 64,
          height: 64,
          marginTop: '-32px',
          marginLeft: '-32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.16)',
          border: '1px solid rgba(255,255,255,0.28)'
        }}
      />
      {orbits.map(orbit => (
        <Box
          key={orbit.inset}
          sx={{
            position: 'absolute',
            top: orbit.inset,
            left: orbit.inset,
            right: orbit.inset,
            bottom: orbit.inset,
            ...motionSafe(`heroOrbit ${orbit.duration} linear infinite${orbit.reverse ? ' reverse' : ''}`, 'none')
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              width: orbit.dotSize,
              height: orbit.dotSize,
              marginLeft: `-${orbit.dotSize / 2}px`,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.85)',
              boxShadow: '0 0 12px rgba(255,255,255,0.45)'
            }}
          />
        </Box>
      ))}
    </>
  )
}

function PulseRingsVisual() {
  const rings = [
    { delay: '0s', border: '2px' },
    { delay: '1.1s', border: '1.5px' },
    { delay: '2.2s', border: '1px' }
  ]

  return (
    <>
      {rings.map(ring => (
        <Box
          key={ring.delay}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '42%',
            aspectRatio: '1',
            marginTop: '-21%',
            marginLeft: '-21%',
            borderRadius: '50%',
            border: `${ring.border} solid rgba(255,255,255,0.35)`,
            ...motionSafe('heroPulseRing 3.3s ease-out infinite', 'none'),
            animationDelay: ring.delay,
            [REDUCED_MOTION]: { animation: 'none', opacity: 0.25 }
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 18,
          height: 18,
          marginTop: '-9px',
          marginLeft: '-9px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.9)',
          boxShadow: '0 0 24px rgba(255,255,255,0.5)'
        }}
      />
    </>
  )
}

function MorphingBlobsVisual() {
  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '8%',
          width: '52%',
          height: '52%',
          backgroundColor: 'rgba(255,255,255,0.14)',
          filter: 'blur(1px)',
          ...motionSafe('heroBlobMorphA 9s ease-in-out infinite, heroFloatA 11s ease-in-out infinite', 'none')
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '6%',
          right: '6%',
          width: '48%',
          height: '44%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          filter: 'blur(2px)',
          ...motionSafe('heroBlobMorphB 8s ease-in-out infinite, heroFloatB 10s ease-in-out infinite', 'none'),
          animationDelay: '-2s'
        }}
      />
    </>
  )
}

function AuroraVisual({ colorStart, colorEnd }: { colorStart: string; colorEnd: string }) {
  const blobs = [
    { color: colorStart, top: '-10%', left: '-5%', size: '55%', animation: 'heroAuroraDriftA 12s ease-in-out infinite' },
    { color: colorEnd, top: '20%', right: '-15%', size: '50%', animation: 'heroAuroraDriftB 10s ease-in-out infinite -3s' },
    { color: colorStart, bottom: '-20%', left: '25%', size: '60%', animation: 'heroAuroraDriftB 14s ease-in-out infinite -6s' }
  ]

  return (
    <>
      {blobs.map((blob, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: blob.top,
            left: blob.left,
            right: blob.right,
            bottom: blob.bottom,
            width: blob.size,
            height: blob.size,
            borderRadius: '50%',
            background: blob.color,
            opacity: 0.55,
            filter: 'blur(48px)',
            ...motionSafe(blob.animation, 'none')
          }}
        />
      ))}
    </>
  )
}

function MeshGradientVisual({ colorStart, colorEnd }: { colorStart: string; colorEnd: string }) {
  const orbs = [
    { color: colorStart, top: '8%', left: '10%', size: 140, delay: '0s' },
    { color: colorEnd, top: '45%', left: '55%', size: 180, delay: '-2s' },
    { color: colorStart, top: '62%', left: '8%', size: 120, delay: '-4s' },
    { color: colorEnd, top: '18%', left: '68%', size: 100, delay: '-1s' }
  ]

  return (
    <>
      {orbs.map((orb, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: orb.color,
            opacity: 0.5,
            filter: 'blur(36px)',
            ...motionSafe(`heroMeshDrift ${8 + index}s ease-in-out infinite`, 'none'),
            animationDelay: orb.delay
          }}
        />
      ))}
    </>
  )
}

function WaveLinesVisual() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, opacity: 0.35, overflow: 'hidden' }}>
      {[0, 1].map(layer => (
        <Box
          key={layer}
          sx={{
            position: 'absolute',
            bottom: `${12 + layer * 14}%`,
            left: 0,
            width: '200%',
            height: 120,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z' fill='rgba(255,255,255,0.35)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '50% 100%',
            ...motionSafe(`heroWaveSlide ${10 + layer * 4}s linear infinite`, 'none'),
            animationDirection: layer === 1 ? 'reverse' : 'normal'
          }}
        />
      ))}
    </Box>
  )
}

function DotGridVisual() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: '-12px',
        opacity: 0.35,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        ...motionSafe('heroDotGridMove 16s linear infinite', 'none')
      }}
    />
  )
}

function ShimmerVisual() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: '-40% -60%',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%)',
          ...motionSafe('heroShimmerSweep 4.5s ease-in-out infinite', 'none')
        }}
      />
    </Box>
  )
}

function ConstellationVisual() {
  const stars = [
    { top: '18%', left: '22%', size: 4, delay: '0s' },
    { top: '32%', left: '68%', size: 3, delay: '-1.2s' },
    { top: '55%', left: '38%', size: 5, delay: '-0.4s' },
    { top: '72%', left: '76%', size: 3, delay: '-2s' },
    { top: '44%', left: '14%', size: 3, delay: '-1.6s' },
    { top: '24%', left: '48%', size: 4, delay: '-0.8s' },
    { top: '64%', left: '58%', size: 4, delay: '-2.4s' }
  ]

  return (
    <>
      <Box
        component='svg'
        viewBox='0 0 100 100'
        preserveAspectRatio='none'
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }}
      >
        <polyline
          points='22,18 48,24 68,32 58,64 38,55 14,44'
          fill='none'
          stroke='rgba(255,255,255,0.8)'
          strokeWidth='0.4'
        />
      </Box>
      {stars.map((star, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            boxShadow: '0 0 8px rgba(255,255,255,0.6)',
            ...motionSafe('heroTwinkle 3s ease-in-out infinite', 'none'),
            animationDelay: star.delay
          }}
        />
      ))}
    </>
  )
}

function GeometricVisual() {
  const shapes = [
    { top: '16%', left: '20%', size: 64, rotate: 12, delay: '0s' },
    { top: '52%', left: '62%', size: 48, rotate: -18, delay: '-1.5s' },
    { top: '68%', left: '18%', size: 56, rotate: 24, delay: '-3s' },
    { top: '28%', left: '72%', size: 40, rotate: -8, delay: '-2s' }
  ]

  return (
    <>
      {shapes.map((shape, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: shape.top,
            left: shape.left,
            width: shape.size,
            height: shape.size,
            border: '1.5px solid rgba(255,255,255,0.35)',
            backgroundColor: 'rgba(255,255,255,0.08)',
            transform: `rotate(${shape.rotate}deg)`,
            ...motionSafe(`heroGeoSpin ${7 + index}s ease-in-out infinite`, 'none'),
            animationDelay: shape.delay
          }}
        />
      ))}
    </>
  )
}

function ParticlesRiseVisual() {
  const particles = Array.from({ length: 18 }, (_, index) => ({
    left: `${8 + (index * 5.2) % 84}%`,
    size: 3 + (index % 3),
    delay: `${-(index * 0.7) % 6}s`,
    duration: `${4 + (index % 4)}s`
  }))

  return (
    <>
      {particles.map((particle, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: particle.left,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.75)',
            ...motionSafe(`heroParticleRise ${particle.duration} linear infinite`, 'none'),
            animationDelay: particle.delay
          }}
        />
      ))}
    </>
  )
}

function GradientShiftOverlay() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: '16%',
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.18)',
        backgroundColor: 'rgba(255,255,255,0.05)'
      }}
    />
  )
}

function renderHeroVisualAnimation(animation: HeroSplitVisualAnimation, colors: { start: string; end: string }) {
  switch (animation) {
    case 'floating-circles':
      return <FloatingCirclesVisual />
    case 'orbiting-dots':
      return <OrbitingDotsVisual />
    case 'pulse-rings':
      return <PulseRingsVisual />
    case 'morphing-blobs':
      return <MorphingBlobsVisual />
    case 'aurora':
      return <AuroraVisual colorStart={colors.start} colorEnd={colors.end} />
    case 'mesh-gradient':
      return <MeshGradientVisual colorStart={colors.start} colorEnd={colors.end} />
    case 'wave-lines':
      return <WaveLinesVisual />
    case 'dot-grid':
      return <DotGridVisual />
    case 'shimmer':
      return <ShimmerVisual />
    case 'constellation':
      return <ConstellationVisual />
    case 'geometric':
      return <GeometricVisual />
    case 'particles-rise':
      return <ParticlesRiseVisual />
    case 'gradient-shift':
      return <GradientShiftOverlay />
    case 'static':
    default:
      return <StaticVisual />
  }
}

export function HeroVisualPanel({
  animation = DEFAULT_HERO_SPLIT_VISUAL_ANIMATION,
  colorStart,
  colorEnd,
  mode = 'hero-column'
}: Props) {
  const usesAnimatedBackground = ANIMATED_HERO_BACKGROUND_TYPES.includes(animation)
  const background = animation === 'gradient-shift'
    ? buildHeroVisualShiftGradient(colorStart, colorEnd)
    : buildHeroVisualGradient(colorStart, colorEnd)

  const animatedBackgroundSx = usesAnimatedBackground
    ? {
        backgroundSize: '200% 200%',
        ...motionSafe('heroGradientShift 8s ease infinite', 'none')
      }
    : {}

  if (mode === 'section-background') {
    return (
      <Box
        sx={[
          SHARED_KEYFRAMES,
          {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            minHeight: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
            background,
            ...animatedBackgroundSx
          }
        ]}
      >
        {renderHeroVisualAnimation(animation, { start: colorStart, end: colorEnd })}
      </Box>
    )
  }

  if (mode === 'section-column') {
    return (
      <Box
        sx={[
          SHARED_KEYFRAMES,
          {
            flex: 1,
            minHeight: 200,
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
            background,
            ...animatedBackgroundSx
          }
        ]}
      >
        {renderHeroVisualAnimation(animation, { start: colorStart, end: colorEnd })}
      </Box>
    )
  }

  return (
    <Box
      sx={[
        SHARED_KEYFRAMES,
        {
          flex: 1,
          minHeight: 280,
          position: 'relative',
          overflow: 'hidden',
          display: { xs: 'none', md: 'block' },
          background,
          ...animatedBackgroundSx
        }
      ]}
    >
      {renderHeroVisualAnimation(animation, { start: colorStart, end: colorEnd })}
    </Box>
  )
}
