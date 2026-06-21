'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import type { ButtonBlockProps } from '../../types'
import { InlineEditableText } from '../inline/InlineEditableText'
import { useSiteStyles } from '../SiteStylesScope'
import { getSiteButtonSx, mapBlockVariantToButtonRole } from '../../utils/siteStylesHelpers'

type Props = {
  props: ButtonBlockProps
}

export function ButtonBlock({ props }: Props) {
  const siteStyles = useSiteStyles()
  const role = mapBlockVariantToButtonRole(props.variant)
  const labelSx = { font: 'inherit', color: 'inherit' }

  return (
    <Box
      sx={{
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      <Button
        component='a'
        href={props.link || '#'}
        variant={props.variant}
        onClick={e => e.preventDefault()}
        sx={getSiteButtonSx(role, siteStyles, props.color, props.borderRadius)}
      >
        <InlineEditableText value={props.text} field='text' placeholder='Button' sx={labelSx} />
      </Button>
    </Box>
  )
}
