'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { getPublicPageDisplayUrl, getPublicPageUrl } from '@/lib/utils/public-site-url'
import { useSiteWorkspaceOptional } from '@/features/site-templates/context/SiteWorkspaceContext'
import { usePublishedTemplates } from '@/features/site-templates/hooks/usePublishedTemplates'

import {
  BUILDER_TOP_BAR_HEIGHT,
  BUILDER_TYPOGRAPHY,
  builderToolbarDividerSx,
  builderToolbarIconButtonSx
} from '../constants/builderLayout'
import { builderToolbarSx } from '../constants/builderChrome'
import { useBuilder } from '../context/BuilderContext'
import { LiveSiteButton } from './LiveSiteButton'
import { VersionHistoryDialog } from './VersionHistoryDialog'

type Props = {
  tenantName: string
  isFullscreen: boolean
  onToggleFullscreen: () => void
  /** When false, publish is blocked until super-admin approval. */
  tenantApproved?: boolean
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
  tone,
  detail
}: {
  label: string
  tone: 'info' | 'warning' | 'success' | 'neutral' | 'error'
  detail?: string
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
    <Tooltip title={detail || label}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          height: 32,
          px: 1.25,
          borderRadius: 1.25,
          backgroundColor: palette.bg,
          maxWidth: { xs: 132, sm: 180 }
        }}
      >
        <Box
          component='span'
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: palette.main,
            fontSize: '0.75rem',
            ...(isActive && {
              animation: 'builderSpin 1s linear infinite',
              '@keyframes builderSpin': {
                from: { transform: 'rotate(0deg)' },
                to: { transform: 'rotate(360deg)' }
              }
            })
          }}
        >
          {isActive || tone === 'error' ? (
            <i className={icon} />
          ) : (
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: palette.main
              }}
            />
          )}
        </Box>
        <Typography
          variant='caption'
          sx={{
            ...BUILDER_TYPOGRAPHY.label,
            color: palette.main,
            lineHeight: 1,
            display: { xs: 'none', sm: 'block' }
          }}
          noWrap
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
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
  const theme = useTheme()

  return (
    <Tooltip title={title}>
      <IconButton size='small' onClick={onClick} aria-label={ariaLabel} sx={builderToolbarIconButtonSx(theme)}>
        <i className={icon} />
      </IconButton>
    </Tooltip>
  )
}

function ToolbarDivider() {
  const theme = useTheme()

  return <Box aria-hidden sx={{ ...builderToolbarDividerSx(theme), display: { xs: 'none', sm: 'block' } }} />
}

function PageSwitcher() {
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
          minWidth: 0,
          maxWidth: { xs: 128, sm: 168 },
          height: 32,
          px: 0.75,
          border: 'none',
          borderRadius: 1.25,
          backgroundColor: 'transparent',
          cursor: 'pointer',
          color: 'text.primary',
          transition: 'background-color 0.15s',
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.05)
          }
        }}
      >
        <i
          className={currentPage?.isHome ? 'ri-home-4-fill' : 'ri-file-3-line'}
          style={{ fontSize: '0.85rem', color: theme.palette.primary.main, flexShrink: 0 }}
        />
        <Typography component='span' sx={{ ...BUILDER_TYPOGRAPHY.title, lineHeight: 1, minWidth: 0 }} noWrap>
          {currentPageTitle}
        </Typography>
        <i
          className='ri-arrow-down-s-line'
          style={{ fontSize: '1rem', color: theme.palette.text.disabled, flexShrink: 0 }}
        />
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

export function BuilderToolbar({
  tenantName,
  isFullscreen,
  onToggleFullscreen,
  tenantApproved
}: Props) {
  const theme = useTheme()
  const { data: session } = useSession()
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
    autosaveEnabled,
    setAutosaveEnabled,
    restoreVersionToDraft,
    setVersions,
    resetToEmpty,
    versions,
    blocks,
    currentPageSlug,
    currentPageTitle,
    builderScope,
    libraryTemplateId,
    tenantSlug,
    siteStyles
  } = useBuilder()

  const workspace = useSiteWorkspaceOptional()
  const { hasTemplates } = usePublishedTemplates()

  const isBaseTemplateBuilder = builderScope === 'base_template'
  const isLibraryTemplateBuilder = builderScope === 'library_template'
  const isSystemBuilder = isBaseTemplateBuilder || isLibraryTemplateBuilder
  const canBrowseTemplates = !isSystemBuilder && Boolean(workspace) && hasTemplates
  const canResetSite = !isSystemBuilder && Boolean(workspace?.isSiteStarted)

  // Prefer explicit prop; fall back to session so pending orgs never look "approved by default"
  const isTenantApproved =
    typeof tenantApproved === 'boolean' ? tenantApproved : session?.user?.tenantApproved === true
  const publishBlocked = !isLibraryTemplateBuilder && !isTenantApproved
  const publishDisabled =
    isPublishing || isSaving || publishBlocked || (!isLibraryTemplateBuilder && !hasUnpublishedChanges)
  const siteUrl = getPublicPageUrl(tenantSlug, currentPageSlug)
  const displayUrl = getPublicPageDisplayUrl(tenantSlug, currentPageSlug)

  const [versionsOpen, setVersionsOpen] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)

  const statusLabel = isPublishing
    ? 'Publishing'
    : isSaving
      ? 'Saving'
      : saveError
        ? 'Save failed'
        : hasUnpublishedChanges
          ? 'Unpublished'
          : isDirty
            ? 'Unsaved'
            : lastPublishedAt
              ? 'Live'
              : 'Saved'

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const statusDetail = isPublishing || isSaving
    ? statusLabel
    : saveError
      ? saveError
      : lastSavedAt
        ? `Last saved ${formatTime(lastSavedAt)}`
        : lastPublishedAt
          ? `Published ${formatTime(lastPublishedAt)}`
          : statusLabel

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
          ...builderToolbarSx(theme)
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 1.5 },
            minHeight: BUILDER_TOP_BAR_HEIGHT,
            py: { xs: 0.75, sm: 0 },
            px: { xs: 1.25, sm: 2, md: 2.5 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flex: '1 1 160px' }}>
            {isSystemBuilder ? (
              <Tooltip title={isLibraryTemplateBuilder ? 'Back to template' : 'Back to design studio'}>
                <IconButton
                  component={Link}
                  href={
                    isLibraryTemplateBuilder && libraryTemplateId
                      ? `/super-admin/templates/${libraryTemplateId}`
                      : '/super-admin/studio'
                  }
                  size='small'
                  aria-label={isLibraryTemplateBuilder ? 'Back to template' : 'Back to design studio'}
                  sx={builderToolbarIconButtonSx(theme)}
                >
                  <i className='ri-arrow-left-line' />
                </IconButton>
              </Tooltip>
            ) : null}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.25,
                display: { xs: isNarrow ? 'none' : 'flex', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
                color: 'primary.main'
              }}
            >
              <i className='ri-global-line' style={{ fontSize: '0.95rem' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
              <Typography
                variant='body2'
                sx={{
                  ...BUILDER_TYPOGRAPHY.title,
                  lineHeight: 1,
                  display: { xs: 'none', md: 'block' },
                  maxWidth: 180
                }}
                noWrap
              >
                {tenantName}
              </Typography>
              <Box
                aria-hidden
                sx={{
                  color: 'text.disabled',
                  px: 0.5,
                  fontSize: '0.95rem',
                  display: { xs: 'none', md: 'block' },
                  userSelect: 'none'
                }}
              >
                /
              </Box>
              <PageSwitcher />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 }, flexShrink: 0, ml: 'auto' }}>
            <SaveStatusIndicator label={statusLabel} tone={statusTone} detail={statusDetail} />

            <ToolbarDivider />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.125 }}>

              {!isSystemBuilder ? (
                <LiveSiteButton siteUrl={siteUrl} displayUrl={displayUrl} hasUnpublishedChanges={hasUnpublishedChanges} />
              ) : null}

              {!isCompact && !isLibraryTemplateBuilder ? (
                <ToolbarIconButton
                  title='Version history'
                  icon='ri-history-line'
                  onClick={() => setVersionsOpen(true)}
                  ariaLabel='Version history'
                />
              ) : null}

              <ToolbarIconButton
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                icon={isFullscreen ? 'ri-fullscreen-exit-line' : 'ri-fullscreen-line'}
                onClick={onToggleFullscreen}
                ariaLabel={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              />
            </Box>

            <ToolbarDivider />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {!isNarrow && (
                <Box
                  component='button'
                  type='button'
                  onClick={() => void savePage()}
                  disabled={isSaving || isPublishing}
                  sx={{
                    height: 32,
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`,
                    background: 'none',
                    cursor: isSaving || isPublishing ? 'not-allowed' : 'pointer',
                    opacity: isSaving || isPublishing ? 0.5 : 1,
                    ...BUILDER_TYPOGRAPHY.action,
                    color: 'text.secondary',
                    px: 1.5,
                    borderRadius: 1.25,
                    transition: 'color 0.15s, background-color 0.15s, border-color 0.15s',
                    '&:hover': {
                      color: 'text.primary',
                      backgroundColor: alpha(theme.palette.text.primary, 0.05),
                      borderColor: alpha(theme.palette.text.primary, 0.2)
                    }
                  }}
                >
                  Save
                </Box>
              )}

              <Tooltip
                title={
                  publishBlocked
                    ? 'Publishing unlocks after a super admin approves your organization. You can still edit and preview.'
                    : !hasUnpublishedChanges && !isLibraryTemplateBuilder
                      ? 'Nothing new to publish'
                      : 'Publish this page to your live site'
                }
              >
                <span>
                  <Box
                    component='button'
                    type='button'
                    onClick={() => {
                      if (publishDisabled) return
                      void publishPage()
                    }}
                    // Keep native `disabled` off when locked so custom lock styles stay visible
                    disabled={!publishBlocked && publishDisabled}
                    aria-disabled={publishDisabled}
                    sx={{
                      height: 32,
                      minWidth: publishBlocked ? 118 : 84,
                      border: publishBlocked
                        ? `1px dashed ${alpha(theme.palette.warning.main, 0.75)}`
                        : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      cursor: publishDisabled ? 'not-allowed' : 'pointer',
                      ...BUILDER_TYPOGRAPHY.action,
                      fontWeight: 600,
                      px: 1.75,
                      borderRadius: 1.25,
                      backgroundColor: publishBlocked
                        ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.22 : 0.14)
                        : 'text.primary',
                      color: publishBlocked
                        ? theme.palette.mode === 'dark'
                          ? theme.palette.warning.light
                          : theme.palette.warning.dark
                        : 'background.paper',
                      boxShadow: publishBlocked ? 'none' : undefined,
                      transition: 'opacity 0.15s, background-color 0.15s, border-color 0.15s',
                      opacity: publishBlocked ? 1 : publishDisabled ? 0.45 : 1,
                      pointerEvents: 'auto',
                      '&:hover': {
                        opacity: publishBlocked ? 1 : publishDisabled ? 0.45 : 0.86,
                        backgroundColor: publishBlocked
                          ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.28 : 0.2)
                          : undefined
                      }
                    }}
                  >
                    {publishBlocked ? <i className='ri-lock-2-line' style={{ fontSize: '0.95rem' }} /> : null}
                    {isPublishing
                      ? isLibraryTemplateBuilder
                        ? 'Saving…'
                        : 'Publishing'
                      : isLibraryTemplateBuilder
                        ? 'Save to library'
                        : 'Publish'}
                  </Box>
                </span>
              </Tooltip>

              <ToolbarIconButton
                title='More actions'
                icon='ri-more-2-fill'
                onClick={e => setMenuAnchor(e.currentTarget)}
                ariaLabel='More actions'
              />
            </Box>
          </Box>
        </Box>

        <Collapse in={Boolean(saveError || publishError || publishBlocked)}>
          <Box sx={{ px: { xs: 1.25, sm: 2 }, pb: 0.75 }}>
            <Alert
              severity={publishBlocked && !publishError && !saveError ? 'info' : 'error'}
              variant='outlined'
              sx={{ py: 0, borderRadius: 1, fontSize: '0.75rem' }}
            >
              {publishError ??
                saveError ??
                'Preview anytime — publishing unlocks after super admin approval. Manual edits are free; AI uses credits.'}
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
        {isNarrow ? (
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
        ) : undefined}
        <MenuItem
          onClick={e => {
            e.preventDefault()
            setAutosaveEnabled(!autosaveEnabled)
          }}
        >
          <ListItemIcon>
            <i className='ri-save-3-line' />
          </ListItemIcon>
          <ListItemText primary='Autosave' secondary='Save draft automatically' />
          <Switch
            edge='end'
            size='small'
            checked={autosaveEnabled}
            onClick={e => e.stopPropagation()}
            onChange={e => setAutosaveEnabled(e.target.checked)}
          />
        </MenuItem>
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
        {!isLibraryTemplateBuilder ? (
          <MenuItem
            onClick={() => {
              handleMenuClose()
              setVersionsOpen(true)
            }}
          >
            <ListItemIcon>
              <i className='ri-history-line' />
            </ListItemIcon>
            <ListItemText
              primary='Restore published version'
              secondary='Current page only'
            />
          </MenuItem>
        ) : null}
        {canBrowseTemplates || workspace ? (
          <>
            <Divider sx={{ my: 0.5 }} />
            {canBrowseTemplates ? (
              <MenuItem
                onClick={() => {
                  handleMenuClose()
                  workspace!.openTemplatePicker(workspace!.isSiteStarted ? 'replace' : 'onboarding')
                }}
              >
                <ListItemIcon>
                  <i className='ri-layout-grid-line' />
                </ListItemIcon>
                <ListItemText
                  primary='Browse template library'
                  secondary='Apply a published layout to your draft'
                />
              </MenuItem>
            ) : null}
            {workspace ? (
              <MenuItem
                onClick={() => {
                  handleMenuClose()
                  workspace.openAiWizard()
                }}
              >
                <ListItemIcon>
                  <i className='ri-sparkling-line' />
                </ListItemIcon>
                <ListItemText
                  primary='Generate website'
                  secondary='Build from your brand using our master layout'
                />
              </MenuItem>
            ) : null}
          </>
        ) : null}
        {!isSystemBuilder ? (
          <>
            <Divider sx={{ my: 0.5 }} />
            {canResetSite ? (
              <MenuItem
                onClick={() => {
                  handleMenuClose()
                  workspace!.openStartFreshDialog()
                }}
              >
                <ListItemIcon>
                  <i className='ri-refresh-line' />
                </ListItemIcon>
                <ListItemText
                  primary='Start from scratch…'
                  secondary='Reset draft site to blank or starter'
                />
              </MenuItem>
            ) : null}
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
              <ListItemText
                primary='Clear current page'
                secondary='Draft only, this page'
              />
            </MenuItem>
          </>
        ) : null}
      </Menu>

      <VersionHistoryDialog
        open={versionsOpen}
        onClose={() => setVersionsOpen(false)}
        pageSlug={currentPageSlug}
        pageTitle={currentPageTitle}
        builderScope={builderScope}
        libraryTemplateId={libraryTemplateId}
        versions={versions}
        siteStyles={siteStyles}
        isDirty={isDirty}
        onRestore={restoreVersionToDraft}
        onVersionsChange={setVersions}
      />
    </>
  )
}
