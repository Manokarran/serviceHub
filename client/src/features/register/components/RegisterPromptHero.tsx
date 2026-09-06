'use client'

import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha, keyframes } from '@mui/material/styles'

import { PROMPT_SUGGESTIONS, ROTATING_BUSINESSES } from '../constants/prompt-suggestions'
import { REGISTER_PALETTE, borderSpin, enterSx, shimmer } from '../constants/register-theme'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
}

const wordIn = keyframes`
  from { opacity: 0; transform: translate3d(0, 0.5em, 0) rotateX(-40deg); }
  to   { opacity: 1; transform: translate3d(0, 0, 0) rotateX(0deg); }
`

const ROTATE_MS = 2400

export function RegisterPromptHero({ value, onChange, onSubmit, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWordIndex(current => (current + 1) % ROTATING_BUSINESSES.length)
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (value.trim()) {
        onSubmit()
      }
    }
  }

  const canSubmit = Boolean(value.trim()) && !disabled

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 860, mx: 'auto' }}>
      <Box sx={{ textAlign: 'center', mb: { xs: 3.5, md: 4.5 } }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.6,
            mb: { xs: 3, md: 3.5 },
            borderRadius: 999,
            border: `1px solid ${REGISTER_PALETTE.hairline}`,
            backgroundColor: REGISTER_PALETTE.surface,
            backdropFilter: 'blur(14px)',
            ...enterSx(60)
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: REGISTER_PALETTE.cyan,
              boxShadow: `0 0 10px ${REGISTER_PALETTE.cyan}`
            }}
          />
          <Typography
            sx={{ fontSize: '0.76rem', fontWeight: 600, color: REGISTER_PALETTE.textMuted, letterSpacing: '0.01em' }}
          >
            AI website builder — a full site in under a minute
          </Typography>
        </Box>

        <Typography
          component='h1'
          sx={{
            fontFamily: 'var(--register-display)',
            fontWeight: 800,
            fontSize: { xs: '2.7rem', sm: '3.6rem', md: '4.5rem' },
            letterSpacing: '-0.045em',
            lineHeight: 1.02,
            color: REGISTER_PALETTE.text,
            mb: 2,
            ...enterSx(140)
          }}
        >
          Build the website
          <br />
          your{' '}
          <Box
            component='span'
            sx={{
              display: 'inline-block',
              minWidth: { xs: '4.2ch', md: '5ch' },
              textAlign: 'left',
              perspective: '600px'
            }}
          >
            <Box
              key={wordIndex}
              component='span'
              sx={{
                display: 'inline-block',
                animation: `${wordIn} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both`,
                backgroundImage: `linear-gradient(100deg, ${REGISTER_PALETTE.violetSoft}, ${REGISTER_PALETTE.cyan} 45%, ${REGISTER_PALETTE.pink} 80%, ${REGISTER_PALETTE.violetSoft})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {ROTATING_BUSINESSES[wordIndex]}
            </Box>
          </Box>{' '}
          deserves
        </Typography>

        <Typography
          sx={{
            fontFamily: 'var(--register-body)',
            color: REGISTER_PALETTE.textMuted,
            fontSize: { xs: '1.02rem', md: '1.18rem' },
            maxWidth: 560,
            mx: 'auto',
            lineHeight: 1.55,
            ...enterSx(220)
          }}
        >
          Describe your business and watch a complete, editable site appear — pages, copy and design included.
        </Typography>
      </Box>

      <Box sx={enterSx(300)}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: '26px',
            p: '1.5px',
            transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease',
            transform: focused ? 'translateY(-3px)' : 'none',
            background: `linear-gradient(115deg, ${alpha(REGISTER_PALETTE.violet, focused ? 1 : 0.7)}, ${alpha(
              REGISTER_PALETTE.cyan,
              focused ? 0.95 : 0.5
            )}, ${alpha(REGISTER_PALETTE.pink, focused ? 0.9 : 0.45)}, ${alpha(REGISTER_PALETTE.violet, focused ? 1 : 0.7)})`,
            backgroundSize: '260% 260%',
            animation: `${borderSpin} ${focused ? 4 : 9}s ease infinite`,
            boxShadow: focused
              ? `0 32px 90px ${alpha(REGISTER_PALETTE.violet, 0.4)}, 0 0 0 6px ${alpha(REGISTER_PALETTE.violet, 0.08)}`
              : `0 24px 70px ${alpha('#000000', 0.55)}`
          }}
        >
          <Box
            sx={{
              borderRadius: '25px',
              backgroundColor: alpha('#0A0C16', 0.92),
              backdropFilter: 'blur(24px)',
              px: { xs: 1.75, sm: 2.25 },
              pt: { xs: 1.75, sm: 2 },
              pb: 1.25,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  mt: 0.5,
                  width: 34,
                  height: 34,
                  borderRadius: '11px',
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: REGISTER_PALETTE.violetSoft,
                  background: `linear-gradient(140deg, ${alpha(REGISTER_PALETTE.violet, 0.28)}, ${alpha(REGISTER_PALETTE.cyan, 0.16)})`,
                  border: `1px solid ${alpha(REGISTER_PALETTE.violetSoft, 0.24)}`
                }}
              >
                <i className='ri-sparkling-2-line' style={{ fontSize: '1.05rem' }} />
              </Box>

              <Box
                component='textarea'
                ref={textareaRef}
                value={value}
                disabled={disabled}
                onChange={event => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder='A modern booking site for my hair salon with services, stylists and online appointments…'
                rows={3}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  resize: 'none',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'var(--register-body)',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.55,
                  color: REGISTER_PALETTE.text,
                  py: 0.75,
                  '&::placeholder': { color: REGISTER_PALETTE.textFaint },
                  '&:disabled': { opacity: 0.6 }
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                pt: 1,
                borderTop: `1px solid ${alpha('#FFFFFF', 0.07)}`
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  color: REGISTER_PALETTE.textFaint,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Enter to continue · Shift + Enter for a new line
              </Typography>

              <Box
                component='button'
                type='button'
                disabled={!canSubmit}
                onClick={onSubmit}
                aria-label='Build my website with AI'
                sx={{
                  ml: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.9,
                  px: 2,
                  height: 40,
                  borderRadius: 999,
                  border: 'none',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--register-body)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: canSubmit ? '#0A0C16' : REGISTER_PALETTE.textFaint,
                  background: canSubmit
                    ? `linear-gradient(100deg, ${REGISTER_PALETTE.violetSoft}, ${REGISTER_PALETTE.cyan} 55%, ${REGISTER_PALETTE.violetSoft})`
                    : alpha('#FFFFFF', 0.07),
                  backgroundSize: '200% 100%',
                  animation: canSubmit ? `${shimmer} 3s linear infinite` : 'none',
                  transition: 'transform 0.2s ease, filter 0.2s ease',
                  '&:hover': canSubmit ? { transform: 'translateY(-1px)', filter: 'brightness(1.08)' } : {}
                }}
              >
                Build my site
                <i className='ri-arrow-right-line' style={{ fontSize: '1rem' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          mt: 2.5,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          ...enterSx(380)
        }}
      >
        {PROMPT_SUGGESTIONS.map(suggestion => (
          <Box
            key={suggestion.id}
            component='button'
            type='button'
            disabled={disabled}
            onClick={() => {
              onChange(suggestion.prompt)
              textareaRef.current?.focus()
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              height: 34,
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: 'var(--register-body)',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: REGISTER_PALETTE.textMuted,
              border: `1px solid ${REGISTER_PALETTE.hairline}`,
              backgroundColor: REGISTER_PALETTE.surface,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.22s ease',
              '&:hover': {
                color: REGISTER_PALETTE.text,
                borderColor: alpha(REGISTER_PALETTE.violetSoft, 0.45),
                backgroundColor: alpha(REGISTER_PALETTE.violet, 0.14),
                transform: 'translateY(-2px)'
              },
              '&:disabled': { opacity: 0.5, cursor: 'not-allowed', transform: 'none' }
            }}
          >
            <i className={suggestion.icon} style={{ fontSize: '0.95rem', opacity: 0.85 }} />
            {suggestion.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
