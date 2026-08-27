'use client'

import { useCallback, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme, type Theme } from '@mui/material/styles'

import {
  BUILDER_PROPERTY_PANEL_SX,
  BUILDER_TYPOGRAPHY,
  builderPanelHeaderSx
} from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'
import { useBuilder } from '../../context/BuilderContext'
import { getPagePathLabel } from '../../utils/pageLinkHelpers'
import type { SitePageSummary } from '@/models/site-page/site-page.types'
import { PropertyTextField } from '../property/PropertyTextField'
import { CompactButton } from '../property/PropertyPanelUi'

type Props = {
  onClose?: () => void
  /** Compact layout for the always-visible page column in the builder sidebar */
  embedded?: boolean
}

function PageStatusDot({ page, isActive }: { page: SitePageSummary; isActive: boolean }) {
  const theme = useTheme()

  const color = isActive
    ? theme.palette.primary.main
    : page.hasUnpublishedChanges
      ? theme.palette.warning.main
      : page.publishedAt
        ? theme.palette.success.main
        : theme.palette.text.disabled

  const label = isActive
    ? 'Editing'
    : page.hasUnpublishedChanges
      ? 'Unpublished changes'
      : page.publishedAt
        ? 'Published'
        : 'Draft'

  return (
    <Tooltip title={label} placement='top' arrow>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          flexShrink: 0,
          backgroundColor: color,
          cursor: 'default'
        }}
      />
    </Tooltip>
  )
}

type MenuTarget = {
  anchor: HTMLElement
  page: SitePageSummary
}

export function PagesPanel({ onClose, embedded = false }: Props) {
  const theme = useTheme()
  const {
    tenantSlug,
    pages,
    currentPageSlug,
    isPageSwitching,
    switchPage,
    createPage,
    duplicatePage,
    deletePage,
    updatePageMeta,
    pasteBlocksFromPage
  } = useBuilder()

  // Context menu
  const [menuTarget, setMenuTarget] = useState<MenuTarget | null>(null)

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [duplicateOpen, setDuplicateOpen] = useState(false)
  const [duplicateSourceSlug, setDuplicateSourceSlug] = useState<string | null>(null)
  const [duplicateTitle, setDuplicateTitle] = useState('')
  const [duplicating, setDuplicating] = useState(false)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  const [pasteConfirmSlug, setPasteConfirmSlug] = useState<string | null>(null)
  const [pasting, setPasting] = useState(false)

  const openMenuRef = useRef<HTMLElement | null>(null)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    setCreateError(null)
    const result = await createPage(newTitle.trim())
    setCreating(false)
    if (result.success) {
      setCreateOpen(false)
      setNewTitle('')
      void switchPage(result.page.slug)
    } else {
      setCreateError(result.error)
    }
  }, [createPage, newTitle, switchPage])

  const startEditing = (page: SitePageSummary) => {
    setEditingSlug(page.slug)
    setEditTitle(page.title)
    setEditDescription(page.description ?? '')
    setMenuTarget(null)
  }

  const saveEdit = async () => {
    if (!editingSlug) return
    setSaving(true)
    await updatePageMeta(editingSlug, { title: editTitle, description: editDescription })
    setSaving(false)
    setEditingSlug(null)
  }

  const openDuplicate = (page: SitePageSummary) => {
    setDuplicateSourceSlug(page.slug)
    setDuplicateTitle(`${page.title} (copy)`)
    setDuplicateError(null)
    setDuplicateOpen(true)
    setMenuTarget(null)
  }

  const handleDuplicate = async () => {
    if (!duplicateSourceSlug || !duplicateTitle.trim()) return
    setDuplicating(true)
    setDuplicateError(null)
    const result = await duplicatePage(duplicateSourceSlug, duplicateTitle.trim())
    setDuplicating(false)
    if (result.success) {
      setDuplicateOpen(false)
      void switchPage(result.page.slug)
    } else {
      setDuplicateError(result.error)
    }
  }

  const openPasteConfirm = (page: SitePageSummary) => {
    setPasteConfirmSlug(page.slug)
    setMenuTarget(null)
  }

  const handlePaste = async () => {
    if (!pasteConfirmSlug) return
    setPasting(true)
    await pasteBlocksFromPage(pasteConfirmSlug)
    setPasting(false)
    setPasteConfirmSlug(null)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmSlug) return
    setDeleting(true)
    await deletePage(deleteConfirmSlug)
    setDeleting(false)
    setDeleteConfirmSlug(null)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Panel header */}
      {!embedded ? (
        <Box sx={builderPanelHeaderSx(theme)}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='subtitle2' sx={BUILDER_TYPOGRAPHY.title}>
                Site pages
              </Typography>
              <Typography variant='caption' sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled' }}>
                {pages.length} page{pages.length === 1 ? '' : 's'}
              </Typography>
            </Box>
            {onClose && (
              <IconButton size='small' onClick={onClose} aria-label='Close pages panel' sx={{ width: 28, height: 28 }}>
                <i className='ri-close-line' style={{ fontSize: '0.95rem' }} />
              </IconButton>
            )}
          </Box>
        </Box>
      ) : null}

      {/* Page list */}
      <Box sx={{ flex: 1, overflow: 'auto', p: embedded ? 1.5 : 1.5, ...BUILDER_PROPERTY_PANEL_SX }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: embedded ? 0.875 : 0.75 }}>
          {pages.map(page => {
            const isActive = page.slug === currentPageSlug

            return (
              <Box
                key={page.slug}
                sx={{
                  p: embedded ? 1.125 : 1.25,
                  borderRadius: embedded ? 1 : 1.25,
                  cursor: isPageSwitching ? 'wait' : 'pointer',
                  opacity: isPageSwitching && !isActive ? 0.6 : 1,
                  ...builderSoftCardSx(theme, isActive),
                  transition: 'all 0.12s'
                }}
                onClick={() => {
                  if (!isActive && !isPageSwitching) {
                    void switchPage(page.slug)
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: embedded ? 'center' : 'flex-start', gap: embedded ? 0.75 : 1 }}>
                  {/* Page icon */}
                  <Box
                    sx={{
                      width: embedded ? 24 : 28,
                      height: embedded ? 24 : 28,
                      borderRadius: 1,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: page.isHome
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.text.primary, 0.05),
                      color: page.isHome ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    <i
                      className={page.isHome ? 'ri-home-4-fill' : 'ri-file-3-line'}
                      style={{ fontSize: embedded ? '0.75rem' : '0.875rem' }}
                    />
                  </Box>

                  {/* Title + path */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: embedded ? 0 : 0.25 }}>
                      <Typography
                        component='p'
                        sx={{
                          ...BUILDER_TYPOGRAPHY.title,
                          fontSize: embedded ? '0.8125rem' : undefined,
                          m: 0,
                          color: isActive ? 'primary.main' : 'text.primary'
                        }}
                        noWrap
                      >
                        {page.title}
                      </Typography>
                      {page.isHome && !embedded && (
                        <Chip
                          label='Home'
                          size='small'
                          sx={{
                            height: 18,
                            ...BUILDER_TYPOGRAPHY.label,
                            fontSize: '0.5625rem',
                            '& .MuiChip-label': { px: 0.75 }
                          }}
                        />
                      )}
                      <PageStatusDot page={page} isActive={isActive} />
                    </Box>

                    {!embedded && (
                      <>
                        <Typography
                          component='p'
                          sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled', m: 0 }}
                          noWrap
                        >
                          {getPagePathLabel(tenantSlug, page.slug)}
                        </Typography>

                        {page.description && (
                          <Typography
                            component='p'
                            sx={{
                              ...BUILDER_TYPOGRAPHY.label,
                              fontWeight: 400,
                              color: 'text.secondary',
                              m: 0,
                              mt: 0.375
                            }}
                            noWrap
                          >
                            {page.description}
                          </Typography>
                        )}
                      </>
                    )}
                  </Box>

                  {/* ⋯ menu button */}
                  <Box sx={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <Tooltip title='Page options' placement='top'>
                      <IconButton
                        size='small'
                        aria-label={`Options for ${page.title}`}
                        onClick={event => {
                          openMenuRef.current = event.currentTarget
                          setMenuTarget({ anchor: event.currentTarget, page })
                        }}
                        sx={{
                          width: embedded ? 22 : 26,
                          height: embedded ? 22 : 26,
                          color: 'text.secondary',
                          borderRadius: 1,
                          opacity: embedded ? 0.5 : 0.7,
                          '&:hover': { opacity: 1, backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                        }}
                      >
                        <i className='ri-more-2-fill' style={{ fontSize: embedded ? '0.8rem' : '0.875rem' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>

        {/* Add page */}
        <Box sx={{ mt: embedded ? 1 : 1.5 }}>
          <CompactButton
            startIcon={<i className='ri-add-line' style={{ fontSize: embedded ? '0.8rem' : '0.875rem' }} />}
            onClick={() => setCreateOpen(true)}
          >
            Add page
          </CompactButton>
        </Box>
      </Box>

      {/* ── Context menu ─────────────────────────────────────────────────────── */}
      <Menu
        open={Boolean(menuTarget)}
        anchorEl={menuTarget?.anchor ?? null}
        onClose={() => setMenuTarget(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.14)}, 0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
              p: 0.5,
              '& .MuiList-root': { py: 0 }
            }
          }
        }}
      >
        {/* Open / switch */}
        {menuTarget && menuTarget.page.slug !== currentPageSlug && (
          <MenuItem
            dense
            onClick={() => { void switchPage(menuTarget.page.slug); setMenuTarget(null) }}
            sx={menuItemSx(theme)}
          >
            <ListItemIcon sx={{ minWidth: 28 }}><i className='ri-arrow-right-up-line' style={{ fontSize: '0.95rem' }} /></ListItemIcon>
            Open page
          </MenuItem>
        )}

        {/* Rename */}
        <MenuItem dense onClick={() => menuTarget && startEditing(menuTarget.page)} sx={menuItemSx(theme)}>
          <ListItemIcon sx={{ minWidth: 28 }}><i className='ri-pencil-line' style={{ fontSize: '0.95rem' }} /></ListItemIcon>
          Rename / settings
        </MenuItem>

        {/* Duplicate */}
        <MenuItem dense onClick={() => menuTarget && openDuplicate(menuTarget.page)} sx={menuItemSx(theme)}>
          <ListItemIcon sx={{ minWidth: 28 }}><i className='ri-file-copy-line' style={{ fontSize: '0.95rem' }} /></ListItemIcon>
          Duplicate page
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {/* Copy blocks to current page */}
        {menuTarget && menuTarget.page.slug !== currentPageSlug && (
          <MenuItem dense onClick={() => menuTarget && openPasteConfirm(menuTarget.page)} sx={menuItemSx(theme)}>
            <ListItemIcon sx={{ minWidth: 28 }}><i className='ri-clipboard-line' style={{ fontSize: '0.95rem' }} /></ListItemIcon>
            <Box>
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, display: 'block', color: 'inherit', m: 0 }}>
                Copy blocks here
              </Typography>
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, fontSize: '0.6875rem', color: 'text.disabled', display: 'block', m: 0 }}>
                Replace current page content
              </Typography>
            </Box>
          </MenuItem>
        )}

        {/* Delete */}
        {menuTarget && !menuTarget.page.isHome && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              dense
              onClick={() => { menuTarget && setDeleteConfirmSlug(menuTarget.page.slug); setMenuTarget(null) }}
              sx={{ ...menuItemSx(theme), color: theme.palette.error.main, '& .MuiListItemIcon-root': { color: theme.palette.error.main } }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}><i className='ri-delete-bin-line' style={{ fontSize: '0.95rem' }} /></ListItemIcon>
              Delete page
            </MenuItem>
          </>
        )}
      </Menu>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}

      {/* Create */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>New page</DialogTitle>
        <DialogContent sx={BUILDER_PROPERTY_PANEL_SX}>
          <Box sx={{ pt: 0.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PropertyTextField
              label='Page name'
              value={newTitle}
              onChange={setNewTitle}
              placeholder='About Us'
              helperText='A URL-friendly path is generated automatically'
            />
            {createError && (
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'error.main', mt: 1 }}>{createError}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <CompactButton onClick={() => setCreateOpen(false)}>Cancel</CompactButton>
          <CompactButton onClick={() => { if (newTitle.trim()) void handleCreate() }}>
            {creating ? 'Creating…' : 'Create page'}
          </CompactButton>
        </DialogActions>
      </Dialog>

      {/* Edit / rename */}
      <Dialog open={Boolean(editingSlug)} onClose={() => setEditingSlug(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>Page settings</DialogTitle>
        <DialogContent sx={BUILDER_PROPERTY_PANEL_SX}>
          <Box sx={{ pt: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <PropertyTextField label='Page name' value={editTitle} onChange={setEditTitle} />
            <PropertyTextField
              label='Description'
              value={editDescription}
              onChange={setEditDescription}
              placeholder='Optional — used for SEO'
              multiline
              rows={2}
            />
            {editingSlug && (
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'text.disabled' }}>
                URL: {getPagePathLabel(tenantSlug, editingSlug)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <CompactButton onClick={() => setEditingSlug(null)}>Cancel</CompactButton>
          <CompactButton onClick={() => { if (editTitle.trim()) void saveEdit() }}>
            {saving ? 'Saving…' : 'Save changes'}
          </CompactButton>
        </DialogActions>
      </Dialog>

      {/* Duplicate */}
      <Dialog open={duplicateOpen} onClose={() => setDuplicateOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>Duplicate page</DialogTitle>
        <DialogContent sx={BUILDER_PROPERTY_PANEL_SX}>
          <Box sx={{ pt: 0.5 }}>
            <PropertyTextField
              label='New page name'
              value={duplicateTitle}
              onChange={setDuplicateTitle}
              placeholder='Page copy'
              helperText='A new page will be created with the same blocks'
            />
            {duplicateError && (
              <Typography sx={{ ...BUILDER_TYPOGRAPHY.label, color: 'error.main', mt: 1 }}>{duplicateError}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <CompactButton onClick={() => setDuplicateOpen(false)}>Cancel</CompactButton>
          <CompactButton onClick={() => { if (duplicateTitle.trim()) void handleDuplicate() }}>
            {duplicating ? 'Duplicating…' : 'Duplicate'}
          </CompactButton>
        </DialogActions>
      </Dialog>

      {/* Paste / copy-blocks confirm */}
      <Dialog open={Boolean(pasteConfirmSlug)} onClose={() => setPasteConfirmSlug(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>Replace page content?</DialogTitle>
        <DialogContent>
          <Typography sx={BUILDER_TYPOGRAPHY.subtle}>
            All blocks on <strong>{pages.find(p => p.slug === currentPageSlug)?.title ?? 'this page'}</strong> will be replaced with blocks from{' '}
            <strong>{pages.find(p => p.slug === pasteConfirmSlug)?.title ?? 'the selected page'}</strong>. This will be saved as an unsaved draft — you can undo by discarding changes.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <CompactButton onClick={() => setPasteConfirmSlug(null)}>Cancel</CompactButton>
          <CompactButton onClick={() => void handlePaste()}>
            {pasting ? 'Copying…' : 'Copy blocks here'}
          </CompactButton>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteConfirmSlug)} onClose={() => setDeleteConfirmSlug(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>Delete page?</DialogTitle>
        <DialogContent>
          <Typography sx={BUILDER_TYPOGRAPHY.subtle}>
            <strong>{pages.find(p => p.slug === deleteConfirmSlug)?.title ?? 'This page'}</strong> and all its content will be permanently removed. Links pointing to it will stop working.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <CompactButton onClick={() => setDeleteConfirmSlug(null)}>Cancel</CompactButton>
          <CompactButton onClick={() => void confirmDelete()}>
            {deleting ? 'Deleting…' : 'Delete'}
          </CompactButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function menuItemSx(theme: Theme) {
  return {
    borderRadius: 1.25,
    gap: 0.5,
    px: 1,
    py: 0.7,
    fontSize: '0.8125rem',
    fontWeight: 500,
    transition: 'background-color 0.12s',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.07)
    }
  }
}
