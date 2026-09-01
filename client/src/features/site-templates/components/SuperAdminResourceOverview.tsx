import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

import type {
  AdminMongoMetrics,
  AdminOpenAiMetrics,
  AdminResourceOverview
} from '@/services/admin/admin-resource.service'

type Props = {
  overview: AdminResourceOverview
}

function formatBytes(bytes: number) {
  if (bytes <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)

  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function MetricRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant='body2' color='text.secondary'>
          {label}
        </Typography>
        {hint ? (
          <Typography variant='caption' color='text.disabled'>
            {hint}
          </Typography>
        ) : null}
      </Box>
      <Typography variant='body2' sx={{ fontWeight: 700, textAlign: 'right' }}>
        {value}
      </Typography>
    </Box>
  )
}

function ResourceCard({
  icon,
  title,
  subtitle,
  tone,
  children
}: {
  icon: string
  title: string
  subtitle: string
  tone: 'primary' | 'secondary'
  children: React.ReactNode
}) {
  const toneColor = tone === 'primary' ? '#8C57FF' : '#8A8D93'

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent className='flex flex-col gap-4 h-full'>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: toneColor,
              backgroundColor: alpha(toneColor, 0.12)
            }}
          >
            <i className={icon} style={{ fontSize: '1.3rem' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant='h6'>{title}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        {children}
      </CardContent>
    </Card>
  )
}

function OpenAiCard({ metrics }: { metrics: AdminOpenAiMetrics }) {
  if (metrics.status === 'unavailable') {
    return (
      <ResourceCard icon='ri-openai-fill' title='OpenAI usage' subtitle='Organization API activity' tone='secondary'>
        <Alert severity='info' variant='outlined'>
          {metrics.reason}
        </Alert>
        <Typography variant='caption' color='text.secondary'>
          OpenAI does not expose an account credit balance through its supported API. Configure an internal monthly
          budget to estimate remaining spend.
        </Typography>
      </ResourceCard>
    )
  }

  return (
    <ResourceCard
      icon='ri-openai-fill'
      title='OpenAI usage'
      subtitle={`Current month · ${metrics.periodLabel}`}
      tone='secondary'
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Billed spend
          </Typography>
          <Typography variant='h4' sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {formatUsd(metrics.spendUsd)}
          </Typography>
        </Box>
        <Chip
          size='small'
          color={metrics.warning ? 'warning' : 'success'}
          variant='outlined'
          label={metrics.warning ? 'Partial data' : 'Live'}
        />
      </Box>
      <Divider />
      <Box className='flex flex-col gap-2'>
        <MetricRow label='Requests' value={metrics.requests.toLocaleString()} />
        <MetricRow label='Tokens' value={metrics.totalTokens.toLocaleString()} hint={`${metrics.inputTokens.toLocaleString()} in · ${metrics.outputTokens.toLocaleString()} out`} />
        {metrics.monthlyBudgetUsd !== null ? (
          <MetricRow
            label='Estimated budget remaining'
            value={formatUsd(metrics.remainingBudgetUsd ?? 0)}
            hint={`${formatUsd(metrics.monthlyBudgetUsd)} monthly ceiling`}
          />
        ) : (
          <MetricRow label='Account balance' value='Unavailable' hint='Not exposed by OpenAI Admin API' />
        )}
      </Box>
      {metrics.warning ? <Alert severity='warning' variant='outlined' sx={{ py: 0 }}>{metrics.warning}</Alert> : null}
    </ResourceCard>
  )
}

function MongoCard({ metrics }: { metrics: AdminMongoMetrics }) {
  if (metrics.status === 'unavailable') {
    return (
      <ResourceCard icon='ri-database-2-line' title='MongoDB storage' subtitle='Connected database statistics' tone='primary'>
        <Alert severity='info' variant='outlined'>
          {metrics.reason}
        </Alert>
      </ResourceCard>
    )
  }

  return (
    <ResourceCard
      icon='ri-database-2-line'
      title='MongoDB storage'
      subtitle={`${metrics.databaseName} · connected database`}
      tone='primary'
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Storage used
          </Typography>
          <Typography variant='h4' sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {formatBytes(metrics.storageSizeBytes)}
          </Typography>
        </Box>
        <Chip size='small' color='success' variant='outlined' label='Connected' />
      </Box>
      <Divider />
      <Box className='flex flex-col gap-2'>
        <MetricRow label='Data size' value={formatBytes(metrics.dataSizeBytes)} />
        <MetricRow label='Index size' value={formatBytes(metrics.indexSizeBytes)} />
        <MetricRow label='Collections' value={metrics.collections.toLocaleString()} />
        <MetricRow
          label='Available storage'
          value={metrics.freeStorageBytes === null ? 'Not reported' : formatBytes(metrics.freeStorageBytes)}
          hint={metrics.freeStorageBytes === null ? 'MongoDB does not expose cluster disk free space here' : 'Reported by dbStats'}
        />
      </Box>
    </ResourceCard>
  )
}

export function SuperAdminResourceOverview({ overview }: Props) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <OpenAiCard metrics={overview.openAi} />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MongoCard metrics={overview.mongo} />
      </Grid>
    </Grid>
  )
}
