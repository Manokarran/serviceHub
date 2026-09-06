'use client'

import { useMemo, useState, useTransition } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import {
  deleteTenantRegistrationAction,
  rejectTenantRegistrationAction
} from '@/app/actions/tenant-approval.actions'
import {
  approveTenantRegistrationWithCreditsAction,
  grantTenantCreditsAction
} from '@/app/actions/credits.actions'
import type { TenantApprovalStatus } from '@/lib/constants/tenant'
import type { TenantRegistrationRequest } from '@/services/tenant/tenant-admin.service'

type FilterTab = TenantApprovalStatus | 'all'

type Props = {
  initialRequests: TenantRegistrationRequest[]
  pendingCount: number
}

const FILTERS: { value: FilterTab; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' }
]

function approvalChipColor(status: TenantApprovalStatus): 'warning' | 'success' | 'default' {
  if (status === 'pending') return 'warning'
  if (status === 'approved') return 'success'

  return 'default'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

export function RegistrationRequestsClient({ initialRequests, pendingCount }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterTab>('pending')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<TenantRegistrationRequest | null>(null)
  const [approveTarget, setApproveTarget] = useState<TenantRegistrationRequest | null>(null)
  const [grantTarget, setGrantTarget] = useState<TenantRegistrationRequest | null>(null)
  const [bonusCredits, setBonusCredits] = useState('0')
  const [grantAmount, setGrantAmount] = useState('20')

  const visible = useMemo(() => {
    if (filter === 'all') return initialRequests

    return initialRequests.filter(row => row.approvalStatus === filter)
  }, [filter, initialRequests])

  const runAction = (action: () => Promise<{ success: boolean; error?: string }>) => {
    setError(null)
    startTransition(async () => {
      const result = await action()

      if (!result.success) {
        setError(result.error ?? 'Something went wrong.')

        return
      }

      setDeleteTarget(null)
      setApproveTarget(null)
      setGrantTarget(null)
      setBonusCredits('0')
      setGrantAmount('20')
      router.refresh()
    })
  }

  return (
    <Box className='flex flex-col gap-4'>
      <Box className='flex flex-wrap items-center justify-between gap-3'>
        <Box>
          <Typography variant='h4' className='mbe-1'>
            Registration requests
          </Typography>
          <Typography color='text.secondary'>
            Approve publishing, top up AI credits, revoke access, or permanently delete a tenant and all linked data.
          </Typography>
        </Box>
        <Chip
          color={pendingCount > 0 ? 'warning' : 'default'}
          label={`${pendingCount} pending`}
          icon={<i className='ri-time-line' />}
        />
      </Box>

      {error ? <Alert severity='error'>{error}</Alert> : null}

      <Paper variant='outlined'>
        <Tabs
          value={filter}
          onChange={(_, value: FilterTab) => setFilter(value)}
          variant='scrollable'
          allowScrollButtonsMobile
        >
          {FILTERS.map(item => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>

        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color='text.secondary' sx={{ py: 3, textAlign: 'center' }}>
                    No organizations in this list.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              visible.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant='body2' fontWeight={600}>
                      {row.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {process.env.NEXT_PUBLIC_ROOT_DOMAIN
                        ? `${row.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                        : `/site/${row.slug}`}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.owner ? (
                      <>
                        <Typography variant='body2'>{row.owner.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {row.owner.email}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        No owner linked
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      label={row.approvalStatus}
                      color={approvalChipColor(row.approvalStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' fontWeight={600}>
                      {row.creditsBalance}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{formatDate(row.createdAt)}</Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Box className='flex flex-wrap justify-end gap-2'>
                      {row.approvalStatus !== 'approved' ? (
                        <Button
                          size='small'
                          variant='contained'
                          color='success'
                          disabled={pending}
                          onClick={() => {
                            setBonusCredits('0')
                            setApproveTarget(row)
                          }}
                        >
                          Approve
                        </Button>
                      ) : null}
                      <Button
                        size='small'
                        variant='outlined'
                        disabled={pending}
                        onClick={() => {
                          setGrantAmount('20')
                          setGrantTarget(row)
                        }}
                      >
                        Add credits
                      </Button>
                      {row.approvalStatus === 'pending' ? (
                        <Button
                          size='small'
                          variant='outlined'
                          color='warning'
                          disabled={pending}
                          onClick={() => runAction(() => rejectTenantRegistrationAction(row.id))}
                        >
                          Cancel request
                        </Button>
                      ) : null}
                      {row.approvalStatus === 'approved' ? (
                        <Button
                          size='small'
                          variant='outlined'
                          color='warning'
                          disabled={pending}
                          onClick={() => runAction(() => rejectTenantRegistrationAction(row.id))}
                        >
                          Remove approval
                        </Button>
                      ) : null}
                      <Button
                        size='small'
                        variant='outlined'
                        color='error'
                        disabled={pending}
                        onClick={() => setDeleteTarget(row)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={Boolean(approveTarget)} onClose={() => (pending ? null : setApproveTarget(null))}>
        <DialogTitle>Approve {approveTarget?.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            They can already edit, preview, and use AI credits. Approval unlocks publishing to the live site. Optionally
            add bonus credits now.
          </DialogContentText>
          <TextField
            fullWidth
            type='number'
            label='Bonus credits on approval'
            value={bonusCredits}
            onChange={event => setBonusCredits(event.target.value)}
            helperText={`Current balance: ${approveTarget?.creditsBalance ?? 0}`}
            inputProps={{ min: 0, max: 100000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={pending} onClick={() => setApproveTarget(null)}>
            Cancel
          </Button>
          <Button
            color='success'
            variant='contained'
            disabled={pending || !approveTarget}
            onClick={() => {
              if (!approveTarget) return
              const bonus = Math.max(0, Math.floor(Number(bonusCredits) || 0))

              runAction(() => approveTenantRegistrationWithCreditsAction(approveTarget.id, bonus))
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(grantTarget)} onClose={() => (pending ? null : setGrantTarget(null))}>
        <DialogTitle>Add credits — {grantTarget?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Current balance: <strong>{grantTarget?.creditsBalance ?? 0}</strong>
          </DialogContentText>
          <TextField
            fullWidth
            type='number'
            label='Credits to add'
            value={grantAmount}
            onChange={event => setGrantAmount(event.target.value)}
            inputProps={{ min: 1, max: 100000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={pending} onClick={() => setGrantTarget(null)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={pending || !grantTarget}
            onClick={() => {
              if (!grantTarget) return
              const amount = Math.floor(Number(grantAmount) || 0)

              if (amount < 1) {
                setError('Enter at least 1 credit.')

                return
              }

              runAction(() => grantTenantCreditsAction({ tenantId: grantTarget.id, amount }))
            }}
          >
            Add credits
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => (pending ? null : setDeleteTarget(null))}>
        <DialogTitle>Delete organization?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes <strong>{deleteTarget?.name}</strong> and all linked users, website pages,
            services, bookings, customers, and leads. The public site for{' '}
            <strong>
              {process.env.NEXT_PUBLIC_ROOT_DOMAIN
                ? `${deleteTarget?.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
                : `/site/${deleteTarget?.slug}`}
            </strong>{' '}
            will redirect to the landing page. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={pending} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            color='error'
            variant='contained'
            disabled={pending || !deleteTarget}
            onClick={() => {
              if (!deleteTarget) return
              runAction(() => deleteTenantRegistrationAction(deleteTarget.id))
            }}
          >
            Delete forever
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
