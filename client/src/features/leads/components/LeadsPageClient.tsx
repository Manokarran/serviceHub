'use client'

import { useMemo, useState, useTransition } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import {
  exportContactLeadsAction,
  getContactLeadsAction,
  updateContactSettingsAction,
  updateLeadStatusAction
} from '@/app/actions/contact.actions'
import type { ContactLeadFilter, ContactSubmissionSummary } from '@/models/contact-submission'
import type { ContactSettingsView } from '@/services/contact/contact.service'

type Props = {
  initialLeads: ContactSubmissionSummary[]
  initialSettings: ContactSettingsView
  initialCounts: { all: number; new: number; read: number; archived: number }
}

const FILTER_TABS: { value: ContactLeadFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'archived', label: 'Archived' }
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function statusChipColor(status: ContactSubmissionSummary['status']) {
  if (status === 'new') return 'primary'
  if (status === 'read') return 'default'
  return 'warning'
}

export function LeadsPageClient({ initialLeads, initialSettings, initialCounts }: Props) {
  const [leads, setLeads] = useState(initialLeads)
  const [settings, setSettings] = useState(initialSettings)
  const [counts, setCounts] = useState(initialCounts)
  const [filter, setFilter] = useState<ContactLeadFilter>('all')
  const [contactEmail, setContactEmail] = useState(initialSettings.contactNotificationEmail)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(initialSettings.contactAutoReplyEnabled)
  const [autoReplySubject, setAutoReplySubject] = useState(initialSettings.contactAutoReplySubject)
  const [autoReplyMessage, setAutoReplyMessage] = useState(initialSettings.contactAutoReplyMessage)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [menuLeadId, setMenuLeadId] = useState<string | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeRecipient = useMemo(
    () => contactEmail.trim() || settings.defaultOwnerEmail,
    [contactEmail, settings.defaultOwnerEmail]
  )

  const refreshLeads = (nextFilter: ContactLeadFilter = filter) => {
    startTransition(async () => {
      const result = await getContactLeadsAction(nextFilter)

      if (!result.success) {
        setError(result.error)
        return
      }

      setLeads(result.leads)
      setCounts(result.counts)
      setSettings(result.settings)
      setContactEmail(result.settings.contactNotificationEmail)
      setAutoReplyEnabled(result.settings.contactAutoReplyEnabled)
      setAutoReplySubject(result.settings.contactAutoReplySubject)
      setAutoReplyMessage(result.settings.contactAutoReplyMessage)
      setError(null)
    })
  }

  const handleFilterChange = (_: React.SyntheticEvent, value: ContactLeadFilter) => {
    setFilter(value)
    refreshLeads(value)
  }

  const handleSaveSettings = () => {
    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await updateContactSettingsAction({
        contactNotificationEmail: contactEmail,
        contactAutoReplyEnabled: autoReplyEnabled,
        contactAutoReplySubject: autoReplySubject,
        contactAutoReplyMessage: autoReplyMessage
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      setSettings(result.settings)
      setContactEmail(result.settings.contactNotificationEmail)
      setAutoReplyEnabled(result.settings.contactAutoReplyEnabled)
      setAutoReplySubject(result.settings.contactAutoReplySubject)
      setAutoReplyMessage(result.settings.contactAutoReplyMessage)
      setMessage('Contact settings saved.')
    })
  }

  const handleExport = () => {
    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await exportContactLeadsAction(filter)

      if (!result.success) {
        setError(result.error)
        return
      }

      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = result.filename
      link.click()
      URL.revokeObjectURL(url)
      setMessage('Leads exported.')
    })
  }

  const updateLeadStatus = (leadId: string, status: ContactSubmissionSummary['status']) => {
    setMenuAnchor(null)
    setMenuLeadId(null)

    startTransition(async () => {
      const result = await updateLeadStatusAction({ leadId, status })

      if (!result.success) {
        setError(result.error)
        return
      }

      const refreshed = await getContactLeadsAction(filter)

      if (refreshed.success) {
        setLeads(refreshed.leads)
        setCounts(refreshed.counts)
      }

      setMessage(`Lead marked as ${status}.`)
    })
  }

  return (
    <Box className='flex flex-col gap-6'>
      <Box>
        <Typography variant='h4' className='mbe-1'>
          Contact leads
        </Typography>
        <Typography color='text.secondary'>
          Messages from your public site contact form. Manage notifications, auto-replies, and lead status here.
        </Typography>
      </Box>

      {message ? <Alert severity='success' onClose={() => setMessage(null)}>{message}</Alert> : null}
      {error ? <Alert severity='error' onClose={() => setError(null)}>{error}</Alert> : null}

      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Typography variant='h6'>Notification & auto-reply</Typography>
          <Typography color='text.secondary' variant='body2'>
            Default recipient: {settings.defaultOwnerEmail || 'No owner email found'}
          </Typography>
          <TextField
            label='Company notification email (optional override)'
            value={contactEmail}
            onChange={event => setContactEmail(event.target.value)}
            placeholder={settings.defaultOwnerEmail}
            helperText={`Admin notifications go to: ${activeRecipient || 'configure an owner account first'}`}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch checked={autoReplyEnabled} onChange={event => setAutoReplyEnabled(event.target.checked)} />
            }
            label='Send auto-reply to visitors after they submit the form'
          />
          {autoReplyEnabled ? (
            <>
              <TextField
                label='Auto-reply subject'
                value={autoReplySubject}
                onChange={event => setAutoReplySubject(event.target.value)}
                fullWidth
              />
              <TextField
                label='Auto-reply message'
                value={autoReplyMessage}
                onChange={event => setAutoReplyMessage(event.target.value)}
                helperText='Use {{firstName}} and {{tenantName}} as placeholders'
                fullWidth
                multiline
                minRows={5}
              />
            </>
          ) : null}
          <Box className='flex gap-2 flex-wrap'>
            <Button variant='contained' onClick={handleSaveSettings} disabled={isPending}>
              Save settings
            </Button>
            <Button variant='outlined' onClick={() => refreshLeads()} disabled={isPending}>
              Refresh
            </Button>
            <Button
              variant='outlined'
              onClick={handleExport}
              disabled={isPending || leads.length === 0}
              startIcon={<i className='ri-download-2-line' />}
            >
              Export CSV
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mbe-4'>
            <Typography variant='h6'>Inbox</Typography>
            <Tabs value={filter} onChange={handleFilterChange} variant='scrollable' scrollButtons='auto'>
              {FILTER_TABS.map(tab => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={`${tab.label} (${counts[tab.value]})`}
                />
              ))}
            </Tabs>
          </Box>

          {leads.length === 0 ? (
            <Typography color='text.secondary'>
              No {filter === 'all' ? '' : `${filter} `}submissions yet. Add a Contact Form block in Your Space and
              publish your site.
            </Typography>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Signup</TableCell>
                    <TableCell>Message</TableCell>
                    <TableCell>Notified</TableCell>
                    <TableCell>Auto-reply</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map(lead => (
                    <TableRow key={lead.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(lead.createdAt)}</TableCell>
                      <TableCell>
                        <Chip label={lead.status} size='small' color={statusChipColor(lead.status)} variant='tonal' />
                      </TableCell>
                      <TableCell>
                        {lead.firstName} {lead.lastName}
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.phone || '—'}</TableCell>
                      <TableCell>{lead.wantsSignup ? 'Yes' : 'No'}</TableCell>
                      <TableCell sx={{ maxWidth: 240 }}>{lead.description}</TableCell>
                      <TableCell>{lead.emailSent ? 'Yes' : 'Saved only'}</TableCell>
                      <TableCell>{lead.autoReplySent ? 'Yes' : '—'}</TableCell>
                      <TableCell align='right'>
                        <Tooltip title='Update status'>
                          <IconButton
                            size='small'
                            onClick={event => {
                              setMenuAnchor(event.currentTarget)
                              setMenuLeadId(lead.id)
                            }}
                          >
                            <i className='ri-more-2-line' />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuLeadId)}
        onClose={() => {
          setMenuAnchor(null)
          setMenuLeadId(null)
        }}
      >
        <MenuItem disabled sx={{ opacity: 1, fontWeight: 600, fontSize: '0.75rem' }}>
          Mark as
        </MenuItem>
        <MenuItem onClick={() => menuLeadId && updateLeadStatus(menuLeadId, 'new')}>New</MenuItem>
        <MenuItem onClick={() => menuLeadId && updateLeadStatus(menuLeadId, 'read')}>Read</MenuItem>
        <MenuItem onClick={() => menuLeadId && updateLeadStatus(menuLeadId, 'archived')}>Archived</MenuItem>
      </Menu>
    </Box>
  )
}
