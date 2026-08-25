'use client'

import Box from '@mui/material/Box'

import {
  SITE_TEMPLATE_CATEGORIES,
  SITE_TEMPLATE_CATEGORY_LABELS,
  type SiteTemplateCategory
} from '@/lib/constants/site-template'
import { CATEGORY_META, INDUSTRY_META, PURPOSE_META } from '@/lib/ai-site-wizard/design-catalog'
import {
  AI_INDUSTRY_LABELS,
  AI_INDUSTRY_OPTIONS,
  AI_SITE_PURPOSE_LABELS,
  AI_SITE_PURPOSES,
  type AiSiteWizardProfile
} from '@/lib/validators/ai-site-wizard.validator'

import { FieldGroup, OptionCard, OptionGrid, StepIntro } from './WizardControls'

type Props = {
  profile: AiSiteWizardProfile
  update: <K extends keyof AiSiteWizardProfile>(key: K, value: AiSiteWizardProfile[K]) => void
}

export function GoalsStep({ profile, update }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      <StepIntro
        title='What are you building?'
        description='These three answers steer the layout, the photography, and what the copy argues for.'
      />

      <FieldGroup label='Type of website' hint='Sets the structure and which sections get the most weight'>
        <OptionGrid minWidth={172}>
          {SITE_TEMPLATE_CATEGORIES.map(item => (
            <OptionCard
              key={item}
              selected={profile.category === item}
              onSelect={() => update('category', item as SiteTemplateCategory)}
              icon={CATEGORY_META[item].icon}
              title={SITE_TEMPLATE_CATEGORY_LABELS[item]}
              subtitle={CATEGORY_META[item].blurb}
            />
          ))}
        </OptionGrid>
      </FieldGroup>

      <FieldGroup label='Industry' hint='Drives photography and the vocabulary in your copy'>
        <OptionGrid minWidth={158}>
          {AI_INDUSTRY_OPTIONS.map(item => (
            <OptionCard
              key={item}
              selected={profile.industry === item}
              onSelect={() => update('industry', item)}
              icon={INDUSTRY_META[item].icon}
              title={AI_INDUSTRY_LABELS[item]}
              subtitle={INDUSTRY_META[item].blurb}
            />
          ))}
        </OptionGrid>
      </FieldGroup>

      <FieldGroup label='Primary goal' hint='The one thing a visitor should do before they leave'>
        <OptionGrid minWidth={186}>
          {AI_SITE_PURPOSES.map(item => (
            <OptionCard
              key={item}
              selected={profile.purpose === item}
              onSelect={() => update('purpose', item)}
              icon={PURPOSE_META[item].icon}
              title={AI_SITE_PURPOSE_LABELS[item]}
              subtitle={PURPOSE_META[item].blurb}
            />
          ))}
        </OptionGrid>
      </FieldGroup>
    </Box>
  )
}
