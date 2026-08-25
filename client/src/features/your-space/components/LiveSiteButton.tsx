'use client'

import { useCallback, useState } from 'react'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import { useTheme } from '@mui/material/styles'

import { builderToolbarIconButtonSx } from '../constants/builderLayout'

type Props = {
  siteUrl: string
  displayUrl: string
  hasUnpublishedChanges?: boolean
}

export function LiveSiteButton({ siteUrl, displayUrl, hasUnpublishedChanges = false }: Props) {
  const theme = useTheme()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const menuOpen = Boolean(menuAnchor)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(siteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }

    setMenuAnchor(null)
  }, [siteUrl])

  const tooltipTitle = hasUnpublishedChanges
    ? `${displayUrl} — unpublished changes on draft`
    : displayUrl

  return (
    <>
      <Tooltip title={tooltipTitle}>
        <IconButton
          size='small'
          onClick={e => setMenuAnchor(e.currentTarget)}
          aria-label='Live site'
          sx={builderToolbarIconButtonSx(theme)}
        >
          <i className='ri-global-line' />
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              border: '1.5px solid',
              borderColor: 'background.paper',
              backgroundColor: hasUnpublishedChanges ? 'warning.main' : 'success.main'
            }}
          />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={() => setMenuAnchor(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        <MenuItem component='a' href={siteUrl} target='_blank' rel='noopener noreferrer' onClick={() => setMenuAnchor(null)}>
          <ListItemIcon>
            <i className='ri-external-link-line' />
          </ListItemIcon>
          <ListItemText primary='Open live site' secondary={displayUrl} />
        </MenuItem>
        <MenuItem onClick={() => void handleCopy()}>
          <ListItemIcon>
            <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'} />
          </ListItemIcon>
          <ListItemText primary={copied ? 'Copied!' : 'Copy URL'} />
        </MenuItem>
      </Menu>
    </>
  )
}
