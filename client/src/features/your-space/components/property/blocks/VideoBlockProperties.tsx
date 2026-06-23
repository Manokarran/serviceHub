'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { useBuilder } from '../../../context/BuilderContext'
import { useSiteStyles } from '../../SiteStylesScope'
import type { Block, VideoBlockProps } from '../../../types'
import { getVideoSourceLabel, isEmbedVideoUrl, parseVideoUrl } from '../../../utils/videoUrlHelpers'
import type { PropertyPanelTab } from '../PropertyPanelUi'
import { PropertyFields, PropertySection } from '../PropertyPanelUi'
import { PropertySliderField } from '../PropertySliderField'
import { PropertyToggleRow } from '../PropertyToggleRow'
import { AlignmentControl } from '../AlignmentControl'
import { MediaSourceField } from '../MediaSourceField'

type Props = {
  block: Block<'video'>
  activeTab: PropertyPanelTab
}

export function VideoBlockProperties({ block, activeTab }: Props) {
  const { updateBlock } = useBuilder()
  const siteStyles = useSiteStyles()
  const props = block.props as VideoBlockProps
  const update = (changes: Partial<VideoBlockProps>) => updateBlock(block.id, changes)

  const parsedVideo = parseVideoUrl(props.src)
  const embedLabel = getVideoSourceLabel(parsedVideo.type)
  const isEmbed = isEmbedVideoUrl(props.src)

  if (activeTab === 'design') {
    return (
      <PropertyFields>
        <MediaSourceField
          label='Video'
          value={props.src}
          onChange={src => update({ src })}
          acceptVideo
          urlPlaceholder='Upload, paste a file URL, or YouTube/Vimeo link'
        />
        {embedLabel && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1,
              py: 0.625,
              borderRadius: 0.75,
              backgroundColor: theme => alpha(theme.palette.info.main, 0.08),
              color: 'info.main'
            }}
          >
            <i className='ri-links-line' style={{ fontSize: '0.875rem', flexShrink: 0 }} />
            <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'inherit', fontWeight: 400 }}>
              {embedLabel} embed detected
            </Typography>
          </Box>
        )}
        <PropertySection title='Playback' collapsible defaultOpen>
          <PropertyToggleRow
            label='Show controls'
            description='Play/pause, volume, fullscreen bar'
            checked={props.controls}
            onChange={controls => update({ controls })}
          />
          <PropertyToggleRow
            label='Autoplay'
            description='Starts playing when the page loads'
            checked={props.autoplay}
            onChange={autoplay => update({ autoplay, ...(autoplay ? { muted: true } : {}) })}
          />
          {!isEmbed || !props.autoplay ? (
            <PropertyToggleRow
              label='Muted'
              description='No audio on load'
              checked={props.muted}
              onChange={muted => update({ muted })}
            />
          ) : (
            <Box
              sx={{
                px: 1,
                py: 0.625,
                borderRadius: 0.75,
                backgroundColor: theme => alpha(theme.palette.warning.main, 0.08)
              }}
            >
              <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, fontWeight: 400, color: 'warning.main', m: 0 }}>
                Muted is required for embed autoplay
              </Typography>
            </Box>
          )}
          <PropertyToggleRow
            label='Loop'
            description='Restarts automatically when finished'
            checked={props.loop}
            onChange={loop => update({ loop })}
          />
        </PropertySection>
      </PropertyFields>
    )
  }

  if (activeTab === 'layout') {
    return (
      <PropertyFields>
        <AlignmentControl value={props.alignment} onChange={alignment => update({ alignment })} />
      </PropertyFields>
    )
  }

  return (
    <PropertyFields>
      <PropertySection title='Shape' collapsible defaultOpen>
        <PropertySliderField
          label='Corner radius'
          value={props.borderRadius ?? siteStyles.misc.imageCornerRadius}
          min={0}
          max={48}
          step={2}
          unit='px'
          onChange={borderRadius => update({ borderRadius })}
          siteDefault={siteStyles.misc.imageCornerRadius}
          onUseSiteDefault={
            props.borderRadius !== undefined ? () => update({ borderRadius: undefined }) : undefined
          }
        />
      </PropertySection>
    </PropertyFields>
  )
}
