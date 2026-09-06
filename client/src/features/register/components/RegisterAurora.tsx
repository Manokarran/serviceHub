'use client'

import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'

import { REGISTER_PALETTE, auroraDrift, floatSoft, gridPan } from '../constants/register-theme'

const BLOBS = [
  { color: REGISTER_PALETTE.violet, size: 780, top: '-22%', left: '-12%', duration: 26, opacity: 0.5 },
  { color: REGISTER_PALETTE.cyan, size: 620, top: '-8%', left: '58%', duration: 32, opacity: 0.34 },
  { color: REGISTER_PALETTE.pink, size: 560, top: '48%', left: '-8%', duration: 29, opacity: 0.26 },
  { color: REGISTER_PALETTE.violet, size: 700, top: '62%', left: '52%', duration: 35, opacity: 0.3 }
]

/** Layered ambient backdrop: aurora blobs, a drifting grid, a vignette and film grain. */
export function RegisterAurora() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: REGISTER_PALETTE.ink
      }}
    >
      {BLOBS.map((blob, index) => (
        <Box
          key={`${blob.color}-${index}`}
          sx={{
            position: 'absolute',
            top: blob.top,
            left: blob.left,
            width: blob.size,
            height: blob.size,
            borderRadius: '50%',
            opacity: blob.opacity,
            background: `radial-gradient(circle at 35% 35%, ${alpha(blob.color, 0.85)}, ${alpha(blob.color, 0)} 68%)`,
            filter: 'blur(70px)',
            animation: `${auroraDrift} ${blob.duration}s ease-in-out infinite`,
            animationDelay: `${index * -6}s`
          }}
        />
      ))}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${alpha('#FFFFFF', 0.05)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha('#FFFFFF', 0.05)} 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 22%, #000 0%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 22%, #000 0%, transparent 78%)',
          animation: `${gridPan} 24s linear infinite`
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '14%',
          left: '50%',
          width: 'min(1100px, 120vw)',
          height: 420,
          transform: 'translateX(-50%)',
          background: `radial-gradient(ellipse at center, ${alpha(REGISTER_PALETTE.violetSoft, 0.22)}, transparent 70%)`,
          filter: 'blur(20px)',
          animation: `${floatSoft} 9s ease-in-out infinite`
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse 120% 90% at 50% 0%, transparent 35%, ${alpha(REGISTER_PALETTE.ink, 0.82)} 100%)`
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.22,
          mixBlendMode: 'overlay',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='0.5'/></svg>\")"
        }}
      />
    </Box>
  )
}
