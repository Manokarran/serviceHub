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
import { getPublicPagePath } from '@/lib/utils/public-site-url'
import { LiveSiteButton } from './LiveSiteButton'
import { VersionHistoryDialog } from './VersionHistoryDialog'

type Props = {
  tenantName: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

const STATUS_ICONS: Record<string, string> = {
  info: 'ri-loader-4-line',
  warning: 'ri-alert-line',
  success: 'ri-check-line',
  error: 'ri-error-warning-line',
  neutral: 'ri-save-line'
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
  const icon = STATUS_ICONS[tone]

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.375,
        borderRadius: '100px',
        border: '1px solid',
        borderColor: alpha(palette.main, 0.18),
        backgroundColor: palette.bg,
        maxWidth: { xs: 140, sm: 220 }
      }}
    >
      <Box
        component='span'
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          color: palette.main,
          fontSize: '0.7rem',
          ...(isActive && {
            animation: 'builderSpin 1s linear infinite',
            '@keyframes builderSpin': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' }
            }
          })
        }}
      >
        <i className={icon} />
      </Box>
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

function PageSwitcher({ compact = false }: { compact?: boolean }) {
  const theme = useTheme()
  const { pages, currentPageSlug, currentPageTitle, isPageSwitching, switchPage } = useBuilder()
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const open = Boolean(anchor)

  const currentPage = pages.find(page => page.slug === currentPageSlug)

  return (
    <>
      <Box
        component='button'
        type='button'
        onClick={event => setAnchor(event.currentTarget)}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-label='Switch page'
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          maxWidth: compact ? 160 : 220,
          px: compact ? 0.75 : 1,
          py: 0.375,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
          borderRadius: 1.25,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          cursor: 'pointer',
          color: 'text.primary',
          transition: 'background-color 0.15s, border-color 0.15s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.09),
            borderColor: alpha(theme.palette.primary.main, 0.28)
          }
        }}
      >
        <i
          className={currentPage?.isHome ? 'ri-home-4-fill' : 'ri-file-3-line'}
          style={{ fontSize: '0.8rem', color: theme.palette.primary.main, flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0, textAlign: 'left' }}>
          <Typography
            component='span'
            sx={{ ...BUILDER_TYPOGRAPHY.title, display: 'block', lineHeight: 1.2 }}
            noWrap
          >
            {currentPageTitle}
          </Typography>
          {!compact && (
            <Typography
              component='span'
              sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', display: 'block', lineHeight: 1.2 }}
              noWrap
            >
              Editing page
            </Typography>
          )}
        </Box>
        <i className='ri-arrow-down-s-line' style={{ fontSize: '0.9rem', color: theme.palette.text.secondary, flexShrink: 0 }} />
      </Box>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5, maxHeight: 360 } } }}
      >
        {pages.map(page => {
          const isActive = page.slug === currentPageSlug

          return (
            <MenuItem
              key={page.slug}
              selected={isActive}
              disabled={isPageSwitching}
              onClick={() => {
                setAnchor(null)

                if (!isActive) {
                  void switchPage(page.slug)
                }
              }}
              sx={{ gap: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <i className={page.isHome ? 'ri-home-4-fill' : 'ri-file-3-line'} />
              </ListItemIcon>
              <ListItemText
                primary={page.title}
                secondary={page.isHome ? 'Home page' : undefined}
                slotProps={{
                  primary: { sx: BUILDER_TYPOGRAPHY.title },
                  secondary: { sx: BUILDER_TYPOGRAPHY.label }
                }}
              />
              {isActive && (
                <i className='ri-check-line' style={{ fontSize: '0.9rem', color: theme.palette.primary.main }} />
              )}
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}

export function BuilderToolbar({ tenantName, isFullscreen, onToggleFullscreen }: Props) {
  const theme = useTheme()
  const isCompact = useMediaQuery(theme.breakpoints.down('md'))
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'))
  const isMobileSidebar = useMediaQuery(theme.breakpoints.down('lg'))

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
    resetToEmpty,
    blocks,
    versions,
    currentPageSlug,
    currentPageTitle,
    tenantSlug
  } = useBuilder()

  const pagePath = getPublicPagePath(tenantSlug, currentPageSlug)
  const siteUrl = typeof window !== 'undefined' ? `${window.location.origin}${pagePath}` : pagePath
  const displayUrl = typeof window !== 'undefined' ? `${window.location.host}${pagePath}` : pagePath

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
          minHeight: BUILDER_TOP_BAR_HEIGHT,
          height: { xs: 'auto', sm: BUILDER_TOP_BAR_HEIGHT },
          ...builderToolbarSx(theme)
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            minHeight: BUILDER_TOP_BAR_HEIGHT,
            py: { xs: 0.75, sm: 0 },
            px: { xs: 1.25, sm: 2 }
          }}
        >
          {/* Left — site identity + page context */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: '1 1 140px' }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.25,
                display: { xs: isNarrow ? 'none' : 'flex', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                color: 'primary.main',
                boxShadow: `0 1px 4px ${alpha(theme.palette.primary.main, 0.12)}`
              }}
            >
              <i className='ri-global-line' style={{ fontSize: '0.875rem' }} />
            </Box>
            <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.375 }}>
              <Typography
                variant='body2'
                sx={{
                  ...BUILDER_TYPOGRAPHY.title,
                  lineHeight: 1.2,
                  display: { xs: isNarrow ? 'none' : 'block', sm: 'block' }
                }}
                noWrap
              >
                {tenantName}
              </Typography>
              {isMobileSidebar ? (
                <PageSwitcher compact={isNarrow} />
              ) : (
                <Typography
                  variant='caption'
                  sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', display: 'block', lineHeight: 1.2 }}
                  noWrap
                >
                  {currentPageTitle}
                  {currentPageSlug === 'home' ? ' · Home' : ''}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Center — save status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: '0 1 auto', order: { xs: 3, sm: 0 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0, ml: { xs: 0, sm: 'auto' } }}>
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
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                  background: 'none',
                  cursor: isSaving || isPublishing ? 'not-allowed' : 'pointer',
                  opacity: isSaving || isPublishing ? 0.5 : 1,
                  ...BUILDER_TYPOGRAPHY.action,
                  color: 'text.secondary',
                  px: 1.125,
                  py: 0.4375,
                  borderRadius: '100px',
                  transition: 'color 0.15s, background-color 0.15s, border-color 0.15s',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: alpha(theme.palette.text.primary, 0.05),
                    borderColor: alpha(theme.palette.text.primary, 0.18)
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
                px: 1.375,
                py: 0.5,
                borderRadius: '100px',
                backgroundColor: 'text.primary',
                color: 'background.paper',
                transition: 'opacity 0.15s, box-shadow 0.15s',
                opacity: isPublishing || isSaving || !hasUnpublishedChanges ? 0.4 : 1,
                boxShadow: isPublishing || isSaving || !hasUnpublishedChanges
                  ? 'none'
                  : `0 2px 8px ${alpha(theme.palette.common.black, 0.2)}, 0 1px 2px ${alpha(theme.palette.common.black, 0.12)}`,
                '&:hover': {
                  opacity: isPublishing || isSaving || !hasUnpublishedChanges ? 0.4 : 0.88
                }
              }}
            >
              {isPublishing ? 'Publishing...' : 'Publish site'}
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
            resetToEmpty()
          }}
          disabled={blocks.length === 0}
        >
          <ListItemIcon>
            <i className='ri-layout-line' />
          </ListItemIcon>
          <ListItemText>Reset to empty layout</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleMenuClose()
            resetToStarter()
          }}
        >
          <ListItemIcon>
            <i className='ri-refresh-line' />
          </ListItemIcon>
          <ListItemText>Reset to starter template</ListItemText>
        </MenuItem>
      </Menu>

      <VersionHistoryDialog
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        pageSlug={currentPageSlug}
        pageTitle={currentPageTitle}
        versions={versions}
        onRestore={restoreVersionToDraft}
        onVersionsChange={setVersions}
      />
    </>
  )
}
