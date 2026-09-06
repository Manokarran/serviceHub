'use client'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, keyframes, useTheme } from '@mui/material/styles'

import { BuilderAiButton } from '@/features/your-space/components/BuilderAiButton'

import {
  HOME_AI_BORDER_GRADIENT,
  HOME_AI_BUTTON_GRADIENT,
  HOME_PALETTE
} from '../constants/home-theme'
import { usePublishedTemplates } from '../hooks/usePublishedTemplates'
import { HomeTemplatePicker } from './HomeTemplatePicker'

type Props = {
  isSiteStarted: boolean
}

const aiDrift = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(10px, -8px, 0) scale(1.08); }
`

const aiBorderShift = keyframes`
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
`

export function HomeCreateWebsitePanel({ isSiteStarted }: Props) {
  const { hasTemplates, loading } = usePublishedTemplates()

  return (
    <Box className='flex flex-col gap-3.5'>
      <BuildWithAiHighlight isSiteStarted={isSiteStarted} />

      {isSiteStarted ? (
        <Box className='flex flex-wrap gap-2'>
          <Button
            component={Link}
            href='/your-space?aiSetup=1'
            variant='contained'
            startIcon={<i className='ri-sparkling-line' />}
            sx={{
              bgcolor: HOME_PALETTE.ink,
              color: '#fff',
              '&:hover': { bgcolor: alpha(HOME_PALETTE.ink, 0.88) }
            }}
          >
            Generate website
          </Button>
          {hasTemplates ? (
            <Button
              component={Link}
              href='/your-space?replaceTemplate=1'
              variant='outlined'
              startIcon={<i className='ri-layout-grid-line' />}
              sx={{
                borderColor: alpha(HOME_PALETTE.accent, 0.55),
                color: HOME_PALETTE.dark,
                '&:hover': {
                  borderColor: HOME_PALETTE.accent,
                  bgcolor: alpha(HOME_PALETTE.accent, 0.06)
                }
              }}
            >
              Browse library
            </Button>
          ) : null}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }
          }}
        >
          <PathCard
            icon='ri-layout-grid-line'
            title='Browse the library'
            body='Start from a finished layout. Preview the full site, apply it to your draft, then customize in Your Space.'
            href='/your-space?setup=1'
            cta='Browse templates'
            ctaIcon='ri-gallery-line'
            color={HOME_PALETTE.accent}
          />
          <PathCard
            icon='ri-sparkling-line'
            title='Generate from your brand'
            body='Enter category, logo, about text, theme, and font. We build from the master layout with fresh copy and photography.'
            href='/your-space?aiSetup=1'
            cta='Generate my website'
            ctaIcon='ri-magic-line'
            color={HOME_PALETTE.cyan}
            loading={loading}
          />
        </Box>
      )}

      {!isSiteStarted && hasTemplates ? <HomeTemplatePicker isSiteStarted={false} /> : null}
    </Box>
  )
}

function BuildWithAiHighlight({ isSiteStarted }: { isSiteStarted: boolean }) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        borderRadius: 3,
        p: { xs: 2.5, md: 3 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 2.5,
        background: `
          linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
          ${HOME_AI_BORDER_GRADIENT} border-box
        `,
        backgroundSize: '100% 100%, 240% 240%',
        animation: `${aiBorderShift} 5s ease infinite`,
        border: '1px solid transparent',
        boxShadow: `0 16px 36px ${alpha(HOME_PALETTE.accent, 0.14)}`
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          right: { xs: -90, md: -40 },
          top: { xs: -140, md: -110 },
          background: `radial-gradient(circle, ${alpha(HOME_PALETTE.pink, 0.36)} 0%, transparent 68%)`,
          animation: `${aiDrift} 9s ease-in-out infinite`,
          pointerEvents: 'none'
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          left: { xs: -70, md: 120 },
          bottom: { xs: -100, md: -80 },
          background: `radial-gradient(circle, ${alpha(HOME_PALETTE.cyan, 0.32)} 0%, transparent 70%)`,
          animation: `${aiDrift} 12s ease-in-out infinite reverse`,
          pointerEvents: 'none'
        }}
      />

      <Box className='flex items-start gap-3' sx={{ position: 'relative', zIndex: 1, maxWidth: 560 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            background: HOME_AI_BUTTON_GRADIENT,
            backgroundSize: '220% 220%',
            animation: `${aiBorderShift} 5s ease infinite`,
            boxShadow: `0 10px 22px ${alpha(HOME_PALETTE.accent, 0.28)}`
          }}
        >
          <i className='ri-sparkling-2-line' style={{ fontSize: '1.45rem' }} />
        </Box>
        <div>
          <Typography variant='h6' sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.6 }}>
            Build with AI
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
            {isSiteStarted
              ? 'Ask for a new section, rewrite copy, or restyle a block. The live site stays as-is until you publish.'
              : 'Describe the business in a few sentences. The builder drafts pages while you watch the preview.'}
          </Typography>
        </div>
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <BuilderAiButton
          size='md'
          href='/your-space?aiChat=1'
          gradient={HOME_AI_BUTTON_GRADIENT}
          glowColor={HOME_PALETTE.pink}
        />
      </Box>
    </Box>
  )
}

function PathCard({
  icon,
  title,
  body,
  href,
  cta,
  ctaIcon,
  color,
  loading = false
}: {
  icon: string
  title: string
  body: string
  href: string
  cta: string
  ctaIcon: string
  color: string
  loading?: boolean
}) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        height: '100%',
        borderRadius: 3,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: `1px solid ${alpha(color, 0.2)}`,
        bgcolor: 'background.paper',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 16px 36px ${alpha(theme.palette.text.primary, 0.1)}`
        }
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(color, 0.14),
          color
        }}
      >
        <i className={icon} style={{ fontSize: '1.5rem' }} />
      </Box>
      <Typography variant='h6' sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.65, flex: 1 }}>
        {body}
      </Typography>
      <Button
        component={Link}
        href={href}
        variant='outlined'
        disabled={loading}
        startIcon={<i className={ctaIcon} />}
        sx={{
          alignSelf: 'flex-start',
          mt: 1,
          borderColor: alpha(color, 0.45),
          color: HOME_PALETTE.ink,
          '&:hover': {
            borderColor: color,
            bgcolor: alpha(color, 0.08)
          }
        }}
      >
        {cta}
      </Button>
    </Box>
  )
}
