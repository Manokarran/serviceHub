'use client'

import Typography from '@mui/material/Typography'

import type { SplitVisualConfig } from '../../types'
import { useBuilder } from '../../context/BuilderContext'
import { AnimatedBackgroundControls } from '../AnimatedBackgroundControls'
import { PropertyBodyText } from '../property/PropertyPanelUi'

export function SitePageBackgroundPanel() {
  const { siteStyles, updateSiteStyles } = useBuilder()

  return (
    <>
      <PropertyBodyText>
        Animated background for your entire site. Lower block background opacity in each block&apos;s Style tab to let this show through.
      </PropertyBodyText>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1.5 }}>
        Applies to the live website and builder preview.
      </Typography>
      <AnimatedBackgroundControls
        config={{
          splitVisualAnimation: siteStyles.misc.pageSplitVisualAnimation,
          splitVisualColorStart: siteStyles.misc.pageSplitVisualColorStart,
          splitVisualColorEnd: siteStyles.misc.pageSplitVisualColorEnd
        }}
        accentColor={siteStyles.colors.accent}
        onUpdate={(changes: Partial<SplitVisualConfig>) =>
          updateSiteStyles({
            misc: {
              ...siteStyles.misc,
              ...(changes.splitVisualAnimation !== undefined
                ? { pageSplitVisualAnimation: changes.splitVisualAnimation }
                : {}),
              ...(changes.splitVisualColorStart !== undefined
                ? { pageSplitVisualColorStart: changes.splitVisualColorStart }
                : {}),
              ...(changes.splitVisualColorEnd !== undefined ? { pageSplitVisualColorEnd: changes.splitVisualColorEnd } : {})
            }
          })
        }
      />
    </>
  )
}
