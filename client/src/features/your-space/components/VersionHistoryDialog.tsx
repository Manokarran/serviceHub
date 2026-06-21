'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  listSitePageVersionsAction,
  restoreSitePageVersionAction
} from '@/app/actions/site-page.actions'
import type { PublishedVersionSummary } from '@/models/site-page'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'

import { BUILDER_TYPOGRAPHY } from '../constants/builderLayout'

type Props = {
  open: boolean
  onClose: () => void
  versions: PublishedVersionSummary[]
  onRestore: (blocks: import('../types').Block[], savedAt: string) => void
  onVersionsChange: (versions: PublishedVersionSummary[]) => void
}

function formatVersionDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(iso))
}

export function VersionHistoryDialog({ open, onClose, versions, onRestore, onVersionsChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const onVersionsChangeRef = useRef(onVersionsChange)

  onVersionsChangeRef.current = onVersionsChange

  useEffect(() => {
    if (!open) {
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const result = await listSitePageVersionsAction()

      if (cancelled) {
        return
      }

      if (result.success) {
        onVersionsChangeRef.current(result.versions)
      } else {
        setError(result.error)
      }

      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [open])

  const handleRestore = useCallback(
    async (versionId: string) => {
      setRestoringId(versionId)
      setError(null)

      const result = await restoreSitePageVersionAction(versionId)

      if (result.success) {
        onRestore(result.blocks, result.savedAt)
        onClose()
      } else {
        setError(result.error)
      }

      setRestoringId(null)
    },
    [onClose, onRestore]
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
        <Box>
          <Typography variant='h6' component='span'>
            Published versions
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block'>
            Last 5 published snapshots — restore loads into your draft
          </Typography>
        </Box>
        <IconButton onClick={onClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : versions.length === 0 ? (
          <Box sx={{ py: 6, px: 3, textAlign: 'center' }}>
            <Typography color='text.secondary'>No published versions yet. Publish your site to create the first snapshot.</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {versions.map((version, index) => (
              <ListItem
                key={version.id}
                divider
                secondaryAction={
                  <Button
                    size='small'
                    variant='outlined'
                    disabled={restoringId !== null}
                    onClick={() => void handleRestore(version.id)}
                    startIcon={
                      restoringId === version.id ? (
                        <CircularProgress size={14} color='inherit' />
                      ) : (
                        <i className='ri-history-line' />
                      )
                    }
                  >
                    Restore
                  </Button>
                }
                sx={{ py: 2, px: 3 }}
              >
                <ListItemText
                  primary={
                    <Typography variant='subtitle2' sx={BUILDER_TYPOGRAPHY.title}>
                      Version {versions.length - index}
                      {index === 0 ? ' · Latest published' : ''}
                    </Typography>
                  }
                  secondary={
                    <>
                      {formatVersionDate(version.publishedAt)}
                      {' · '}
                      {version.blockCount} block{version.blockCount === 1 ? '' : 's'}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        {error && (
          <Typography color='error.main' variant='body2' sx={{ p: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  )
}
