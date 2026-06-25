'use client'

import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'

import { ItServiceIcon } from '@/components/IconPicker'
import type { IconBlockProps } from '../../types'

type Props = {
  props: IconBlockProps
}

export function IconBlock({ props }: Props) {
  const iconTileSize = Math.max(props.iconSize + 24, 56)

  return (
    <Box
      sx={{
        px: 4,
        py: 2,
        display: 'flex',
        justifyContent:
          props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start'
      }}
    >
      <Box
        sx={{
          width: iconTileSize,
          height: iconTileSize,
          borderRadius: `${props.iconBorderRadius}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          backgroundColor: props.showIconBackground ? alpha(props.iconBackgroundColor, 0.12) : 'transparent',
          border: props.showIconBackground ? `1px solid ${alpha(props.iconBackgroundColor, 0.18)}` : 'none',
          color: props.iconColor
        }}
      >
        <ItServiceIcon name={props.iconName} sx={{ fontSize: props.iconSize }} />
      </Box>
    </Box>
  )
}
