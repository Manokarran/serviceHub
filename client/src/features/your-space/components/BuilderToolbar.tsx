'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import {
  BUILDER_TOP_BAR_HEIGHT,
  BUILDER_TYPOGRAPHY,
  builderIconGroupSx
} from '../constants/builderLayout'
import { builderToolbarSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import { LiveSiteButton } from './LiveSiteButton'
import { VersionHistoryDialog } from './VersionHistoryDialog'

type Props = {
  tenantName: string
  siteUrl: string
  displayUrl: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

function SaveStatusIndicator({
  label,
  tone
}: {
  label: string
  tone: 'info' | 'warning' | 'success' | 'neutral' | 'error'
}) {
  const theme = useTheme()

  const palette =
    tone === 'neutral'
      ? { main: theme.palette.text.secondary, bg: alpha(theme.palette.text.primary, 0.04) }
      : tone === 'error'
        ? { main: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.08) }
        : {
            main: theme.palette[tone].main,
            bg: alpha(theme.palette[tone].main, 0.08)
          }

  const isActive = tone === 'info'

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.625,
        px: 1,
        py: 0.375,
        borderRadius: 1,
        border: '1px solid',
        borderColor: alpha(palette.main, 0.15),
        backgroundColor: palette.bg,
        maxWidth: { xs: 140, sm: 220 }
      }}
    >
      <Box
        sx={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: palette.main,
          ...(isActive && {
            animation: 'builderPulse 1.4s ease-in-out infinite',
            '@keyframes builderPulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.45, transform: 'scale(0.85)' }
            }
          })
        }}
      />
      <Typography
        variant='caption'
        sx={{
          ...BUILDER_TYPOGRAPHY.label,
          color: palette.main,
          lineHeight: 1.2,
          display: { xs: 'none', sm: 'block' }
        }}
        noWrap
      >
        {label}
      </Typography>
    </Box>
  )
}

function ToolbarIconButton({
  title,
  icon,
  onClick,
  ariaLabel
}: {
  title: string
  icon: string
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  ariaLabel: string
}) {
  return (
    <Tooltip title={title}>
      <IconButton
        size='small'
        onClick={onClick}
        aria-label={ariaLabel}
        sx={{ width: 28, height: 28, color: 'text.secondary', fontSize: '0.95rem' }}
      >
        <i className={icon} />
      </IconButton>
    </Tooltip>
  )
}

export function BuilderToolbar({ tenantName, siteUrl, displayUrl, isFullscreen, onToggleFullscreen }: Props) {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('md'))
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    isDirty,
    isSaving,
    isPublishing,
    saveError,
    publishError,
    lastSavedAt,
    lastPublishedAt,
    hasUnpublishedChanges,
    savePage,
    publishPage,
    restoreVersionToDraft,
    setVersions,
    resetToStarter,
    blocks,
    versions
  } = useBuilder()

  const [versionsOpen, setVersionsOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)

  const statusLabel = isPublishing
    ? 'Publishing...'
    : isSaving
      ? 'Saving...'
      : saveError
        ? 'Save failed'
        : hasUnpublishedChanges
          ? 'Unpublished changes'
          : isDirty
            ? 'Unsaved'
            : lastPublishedAt
              ? 'Live'
              : 'Saved'

  const statusTone: 'info' | 'warning' | 'success' | 'neutral' | 'error' = isPublishing || isSaving
    ? 'info'
    : saveError
      ? 'error'
      : hasUnpublishedChanges || isDirty
        ? 'warning'
        : lastPublishedAt
          ? 'success'
          : 'neutral'

  const handleMenuClose = () => setMenuAnchor(null)

  return (
    <>
      <Box
        sx={{
          flexShrink: 0,
          height: BUILDER_TOP_BAR_HEIGHT,
          ...builderToolbarSx(theme)
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 1,
            height: '100%',
            px: { xs: 1.25, sm: 2 }
          }}
        >
          {/* Left — site identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, justifySelf: 'start' }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: alpha(theme.palette.text.primary, 0.05),
                color: 'text.secondary'
              }}
            >
              <i className='ri-global-line' style={{ fontSize: '0.875rem' }} />
            </Box>
            <Box sx={{ minWidth: 0, display: { xs: isNarrow ? 'none' : 'block', sm: 'block' } }}>
              <Typography variant='body2' sx={{ ...BUILDER_TYPOGRAPHY.title, lineHeight: 1.2 }} noWrap>
                {tenantName}
              </Typography>
              <Typography
                variant='caption'
                sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', display: 'block', lineHeight: 1.2 }}
                noWrap
              >
                Home page
              </Typography>
            </Box>
          </Box>

          {/* Center — save status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifySelf: 'center', minWidth: 0 }}>
            <SaveStatusIndicator label={statusLabel} tone={statusTone} />
            {lastSavedAt && !isDirty && !isSaving && (
              <Typography
                variant='caption'
                sx={{
                  ...BUILDER_TYPOGRAPHY.label,
                  color: 'text.disabled',
                  display: { xs: 'none', lg: 'block' }
                }}
                noWrap
              >
                {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
          </Box>

          {/* Right — actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifySelf: 'end', flexShrink: 0 }}>
            <Box sx={builderIconGroupSx(theme)}>
              <LiveSiteButton siteUrl={siteUrl} displayUrl={displayUrl} hasUnpublishedChanges={hasUnpublishedChanges} />

              {!isCompact && (
                <ToolbarIconButton
                  title='Version history'
                  icon='ri-history-line'
                  onClick={() => setVersionsOpen(true)}
                  ariaLabel='Version history'
                />
              )}

              <ToolbarIconButton
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                icon={isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}
                onClick={onToggleFullscreen}
                ariaLabel={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              />
            </Box>

            {!isNarrow && (
              <Box
                component='button'
                type='button'
                onClick={() => void savePage()}
                disabled={isSaving || isPublishing}
                sx={{
                  border: 'none',
                  background: 'none',
                  cursor: isSaving || isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isSaving || isPublishing ? 0.5 : 1,
                  ...BUILDER_TYPOGRAPHY.action,
                  color: 'text.secondary',
                  px: 0.75,
                  py: 0.375,
                  borderRadius: 0.75,
                  transition: 'color 0.12s, background-color 0.12s',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: alpha(theme.palette.text.primary, 0.04)
                  }
                }}
              >
                Save
              </Box>
            )}

            <Box
              component='button'
              type='button'
              onClick={() => void publishPage()}
              disabled={isPublishing || isSaving || !hasUnpublishedChanges}
              sx={{
                border: 'none',
                cursor: isPublishing || isSaving || !hasUnpublishedChanges ? 'not-allowed' : 'pointer',
                ...BUILDER_TYPOGRAPHY.action,
                px: 1.25,
                py: 0.4375,
                borderRadius: 1,
                backgroundColor: 'text.primary',
                color: 'background.paper',
                transition: 'opacity 0.12s, background-color 0.12s',
                opacity: isPublishing || isSaving || !hasUnpublishedChanges ? 0.45 : 1,
                '&:hover': {
                  backgroundColor:
                    isPublishing || isSaving || !hasUnpublishedChanges
                      ? 'text.primary'
                      : alpha(theme.palette.text.primary, 0.88)
                }
              }}
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Box>

            <ToolbarIconButton
              title='More actions'
              icon='ri-more-2-fill'
              onClick={e => setMenuAnchor(e.currentTarget)}
              ariaLabel='More actions'
            />
          </Box>
        </Box>

        <Collapse in={Boolean(saveError || publishError)}>
          <Box sx={{ px: { xs: 1.25, sm: 2 }, pb: 0.75 }}>
            <Alert severity='error' variant='outlined' sx={{ py: 0, borderRadius: 1, fontSize: '0.75rem' }}>
              {publishError ?? saveError}
            </Alert>
          </Box>
        </Collapse>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 200, mt: 0.5 } } }}
      >
        {isNarrow && (
          <MenuItem
            onClick={() => {
              handleMenuClose()
              void savePage()
            }}
            disabled={isSaving || isPublishing}
          >
            <ListItemIcon>
              <i className='ri-save-line' />
            </ListItemIcon>
            <ListItemText>Save draft</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleMenuClose()
            onToggleFullscreen()
          }}
        >
          <ListItemIcon>
            <i className={isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'} />
          </ListItemIcon>
          <ListItemText>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose()
            setVersionsOpen(true)
          }}
        >
          <ListItemIcon>
            <i className='ri-history-line' />
          </ListItemIcon>
          <ListItemText>Version history</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose()
            resetToStarter()
          }}
          disabled={blocks.length === 0}
        >
          <ListItemIcon>
            <i className='ri-refresh-line' />
          </ListItemIcon>
          <ListItemText>Reset template</ListItemText>
        </MenuItem>
      </Menu>

      <VersionHistoryDialog
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        versions={versions}
        onRestore={restoreVersionToDraft}
        onVersionsChange={setVersions}
      />
    </>
  )
}
