'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, keyframes, useTheme } from '@mui/material/styles'

import { registerFontVariablesClassName } from '@/features/register/constants/register-fonts'
import type { PendingBuildIntent } from '@/features/register/utils/pending-build-intent'

type Props = {
  intent: PendingBuildIntent | null
}

const CURTAIN_MS = 900
const CARD_VISIBLE_MS = 5200

const curtainOut = keyframes`
  0%   { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.12); }
`

const markPop = keyframes`
  0%   { opacity: 0; transform: scale(0.6); }
  60%  { opacity: 1; transform: scale(1.08); }
  100% { opacity: 1; transform: scale(1); }
`

const cardIn = keyframes`
  from { opacity: 0; transform: translate3d(0, 16px, 0); }
  to   { opacity: 1; transform: translate3d(0, 0, 0); }
`

const cardOut = keyframes`
  from { opacity: 1; transform: translate3d(0, 0, 0); }
  to   { opacity: 0; transform: translate3d(0, 12px, 0); }
`

function describeIntent(intent: PendingBuildIntent) {
  if (intent.type === 'ai-ready') {
    return {
      title: 'Your AI draft is ready',
      body: intent.designConcept
        ? `Built with a ${intent.designConcept} direction. Click any section to refine it.`
        : 'Your first draft is on the canvas. Click any section to make it yours.',
      icon: 'ri-sparkling-2-fill'
    }
  }

  if (intent.type === 'ai') {
    return {
      title: 'Your workspace is live',
      body: 'The AI builder is drafting your site now — watch it appear on the canvas.',
      icon: 'ri-sparkling-2-fill'
    }
  }

  if (intent.type === 'template') {
    return {
      title: 'Your site is ready to edit',
      body: 'Your template is loaded as a draft. Click any section to make it yours.',
      icon: 'ri-layout-masonry-fill'
    }
  }

  return {
    title: 'Your canvas is ready',
    body: 'Drag a control from the left panel, or ask the AI builder to start you off.',
    icon: 'ri-brush-fill'
  }
}

/**
 * Bridges the registration launch animation into the builder: the same dark curtain the
 * register page faded into dissolves here, then a short welcome card names what happens next.
 */
export function BuilderArrivalWelcome({ intent }: Props) {
  const theme = useTheme()
  const [stage, setStage] = useState<'idle' | 'curtain' | 'card' | 'leaving' | 'done'>('idle')

  useEffect(() => {
    if (!intent || stage !== 'idle') {
      return
    }

    setStage('curtain')
  }, [intent, stage])

  useEffect(() => {
    if (stage !== 'curtain') {
      return
    }

    const timer = window.setTimeout(() => setStage('card'), CURTAIN_MS)

    return () => window.clearTimeout(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'card') {
      return
    }

    const timer = window.setTimeout(() => setStage('leaving'), CARD_VISIBLE_MS)

    return () => window.clearTimeout(timer)
  }, [stage])

  useEffect(() => {
    if (stage !== 'leaving') {
      return
    }

    const timer = window.setTimeout(() => setStage('done'), 420)

    return () => window.clearTimeout(timer)
  }, [stage])

  if (!intent || stage === 'idle' || stage === 'done') {
    return null
  }

  const copy = describeIntent(intent)

  return (
    <>
      {stage === 'curtain' ? (
        <Box
          aria-hidden
          className={registerFontVariablesClassName}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: theme.zIndex.modal + 60,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
            backgroundColor: '#04050B',
            animation: `${curtainOut} ${CURTAIN_MS}ms cubic-bezier(0.6, 0, 0.3, 1) forwards`
          }}
        >
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: '28px',
              display: 'grid',
              placeItems: 'center',
              color: '#0A0C16',
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #C4B5FD, #22D3EE)',
              boxShadow: '0 30px 80px rgba(139, 92, 246, 0.55)',
              animation: `${markPop} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both`
            }}
          >
            <i className='ri-check-line' />
          </Box>
        </Box>
      ) : null}

      <Box
        role='status'
        aria-live='polite'
        className={registerFontVariablesClassName}
        sx={{
          position: 'fixed',
          left: '50%',
          bottom: { xs: 16, md: 28 },
          transform: 'translateX(-50%)',
          zIndex: theme.zIndex.snackbar,
          width: { xs: 'calc(100% - 32px)', sm: 440 },
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          px: 2,
          py: 1.75,
          borderRadius: 3,
          color: '#F5F7FF',
          fontFamily: 'var(--register-body)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backgroundColor: alpha('#0A0C16', 0.94),
          backdropFilter: 'blur(20px)',
          boxShadow: `0 26px 70px ${alpha('#000000', 0.55)}`,
          animation:
            stage === 'leaving'
              ? `${cardOut} 0.4s ease forwards`
              : `${cardIn} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both`
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center',
            color: '#0A0C16',
            background: 'linear-gradient(135deg, #C4B5FD, #22D3EE)'
          }}
        >
          <i className={copy.icon} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: 'var(--register-display)',
              fontWeight: 600,
              fontSize: '0.92rem',
              lineHeight: 1.35
            }}
          >
            {intent.companyName ? `${copy.title} — ${intent.companyName}` : copy.title}
          </Typography>
          <Typography sx={{ mt: 0.35, fontSize: '0.82rem', lineHeight: 1.5, color: 'rgba(226, 232, 240, 0.72)' }}>
            {copy.body}
          </Typography>
        </Box>
      </Box>
    </>
  )
}
