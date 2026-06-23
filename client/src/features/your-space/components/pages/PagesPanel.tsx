'use client'

import { useCallback, useState } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import {
  BUILDER_PROPERTY_PANEL_SX,
  BUILDER_TYPOGRAPHY,
  builderPanelHeaderSx
} from '../../constants/builderLayout'
import { builderSoftCardSx } from '../../constants/builderChrome'
import { useBuilder } from '../../context/BuilderContext'
import { getPagePathLabel } from '../../utils/pageLinkHelpers'
import type { SitePageSummary } from '@/models/site-page'
import { PropertyTextField } from '../property/PropertyTextField'
import { CompactButton } from '../property/PropertyPanelUi'

type Props = {
  onClose: () => void
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

  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        flexShrink: 0,
        backgroundColor: color
      }}
    />
  )
}

export function PagesPanel({ onClose }: Props) {
  const theme = useTheme()
  const {
    tenantSlug,
    pages,
    currentPageSlug,
    isPageSwitching,
    switchPage,
    createPage,
    deletePage,
    updatePageMeta
  } = useBuilder()

  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null)

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) {
      return
    }

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
    setEditDescription(page.description)
  }

  const saveEdit = async () => {
    if (!editingSlug) {
      return
    }

    await updatePageMeta(editingSlug, { title: editTitle, description: editDescription })
    setEditingSlug(null)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmSlug) {
      return
    }

    await deletePage(deleteConfirmSlug)
    setDeleteConfirmSlug(null)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
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
          <IconButton size='small' onClick={onClose} aria-label='Close pages panel' sx={{ width: 28, height: 28 }}>
            <i className='ri-close-line' style={{ fontSize: '0.95rem' }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5, ...BUILDER_PROPERTY_PANEL_SX }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {pages.map(page => {
            const isActive = page.slug === currentPageSlug

            return (
              <Box
                key={page.slug}
                sx={{
                  p: 1.25,
                  borderRadius: 1.25,
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
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
                      style={{ fontSize: '0.875rem' }}
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                      <Typography
                        component='p'
                        sx={{
                          ...BUILDER_TYPOGRAPHY.title,
                          m: 0,
                          color: isActive ? 'primary.main' : 'text.primary'
                        }}
                        noWrap
                      >
                        {page.title}
                      </Typography>
                      {page.isHome && (
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
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <IconButton
                      size='small'
                      aria-label={`Edit ${page.title}`}
                      onClick={() => startEditing(page)}
                      sx={{ width: 24, height: 24, color: 'text.secondary' }}
                    >
                      <i className='ri-pencil-line' style={{ fontSize: '0.75rem' }} />
                    </IconButton>
                    {!page.isHome && (
                      <IconButton
                        size='small'
                        aria-label={`Delete ${page.title}`}
                        onClick={() => setDeleteConfirmSlug(page.slug)}
                        sx={{ width: 24, height: 24, color: 'text.secondary' }}
                      >
                        <i className='ri-delete-bin-line' style={{ fontSize: '0.75rem' }} />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <CompactButton
            startIcon={<i className='ri-add-line' style={{ fontSize: '0.875rem' }} />}
            onClick={() => setCreateOpen(true)}
          >
            Add page
          </CompactButton>
        </Box>
      </Box>

      {/* Create page dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>New page</DialogTitle>
        <DialogContent sx={BUILDER_PROPERTY_PANEL_SX}>
          <Box sx={{ pt: 0.5 }}>
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
          <CompactButton onClick={() => void handleCreate()}>
            {creating ? 'Creating...' : 'Create page'}
          </CompactButton>
        </DialogActions>
      </Dialog>

      {/* Edit page dialog */}
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
          <CompactButton onClick={() => void saveEdit()}>Save</CompactButton>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteConfirmSlug)} onClose={() => setDeleteConfirmSlug(null)} maxWidth='xs' fullWidth>
        <DialogTitle sx={BUILDER_TYPOGRAPHY.title}>Delete page?</DialogTitle>
        <DialogContent>
          <Typography sx={BUILDER_TYPOGRAPHY.subtle}>
            This page and its content will be permanently removed. Links pointing to this page will stop working.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <CompactButton onClick={() => setDeleteConfirmSlug(null)}>Cancel</CompactButton>
          <CompactButton onClick={() => void confirmDelete()}>Delete</CompactButton>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
