'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import { BUILDER_TYPOGRAPHY } from '../../../constants/builderLayout'
import { SHOWCASE_VISUAL_KIND_OPTIONS } from '../../../constants/showcaseLayout'
import type { ShowcaseItem, ShowcaseVisualKind } from '../../../types'
import { AnimatedBackgroundControls } from '../../AnimatedBackgroundControls'
import { MediaSourceField } from '../MediaSourceField'
import { PageLinkField } from '../PageLinkField'
import { LayoutOptionGroup } from '../PropertyPanelUi'
import { PropertyTextField } from '../PropertyTextField'

type Props = {
  item: ShowcaseItem
  accentColor: string
  onChange: (changes: Partial<ShowcaseItem>) => void
}

export function ShowcaseItemFields({ item, accentColor, onChange }: Props) {
  const visualKind: ShowcaseVisualKind = item.visualKind ?? 'animation'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <PropertyTextField
        label='Logo text'
        value={item.logoText}
        onChange={logoText => onChange({ logoText })}
        placeholder='Brand mark'
      />
      <MediaSourceField
        label='Logo image'
        value={item.logoSrc}
        onChange={(logoSrc, meta) => onChange({ logoSrc, logoAlt: meta?.alt || item.logoAlt })}
        clearLabel='Remove logo'
      />
      <LayoutOptionGroup
        value={visualKind}
        options={SHOWCASE_VISUAL_KIND_OPTIONS}
        onChange={nextKind => onChange({ visualKind: nextKind })}
      />
      {visualKind === 'image' && (
        <MediaSourceField
          label='Visual image'
          value={item.imageSrc}
          onChange={(imageSrc, meta) => onChange({ imageSrc, imageAlt: meta?.alt || item.imageAlt })}
          enableUnsplash
          unsplashDefaultQuery='architecture interior'
          clearLabel='Remove image'
        />
      )}
      {visualKind === 'logo' && (
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
          Uses the logo image or wordmark as the large visual.
        </Typography>
      )}
      {visualKind === 'animation' && (
        <AnimatedBackgroundControls
          config={item}
          accentColor={accentColor}
          hidePlacementControls
          placementHint='Motion in the visual pane. Upload an image if you would rather use photography.'
          onUpdate={onChange}
        />
      )}
      <PropertyTextField
        label='Eyebrow'
        value={item.eyebrow}
        onChange={eyebrow => onChange({ eyebrow })}
        placeholder='Small label'
      />
      <PropertyTextField
        label='Title'
        value={item.title}
        onChange={title => onChange({ title })}
        placeholder='Headline'
      />
      <PropertyTextField
        label='Body'
        value={item.body}
        onChange={body => onChange({ body })}
        placeholder='Supporting copy'
        multiline
        rows={3}
      />
      <PropertyTextField
        label='Button'
        value={item.buttonText}
        onChange={buttonText => onChange({ buttonText })}
        placeholder='Learn more'
      />
      <PageLinkField label='Button link' value={item.buttonLink} onChange={buttonLink => onChange({ buttonLink })} />
      <Box
        sx={{
          px: 1.25,
          py: 1,
          borderRadius: 1,
          backgroundColor: theme => alpha(theme.palette.text.primary, 0.03)
        }}
      >
        <Typography component='p' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.secondary', m: 0 }}>
          Logo sits at the top. Title and body sit with the copy — or along the bottom on layered cards.
        </Typography>
      </Box>
    </Box>
  )
}
