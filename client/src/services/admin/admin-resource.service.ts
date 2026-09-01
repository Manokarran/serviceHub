import 'server-only'

import { serverEnv } from '@/config/env'
import { connectDB } from '@/lib/db/connect'

type OpenAiApiResult = {
  payload: unknown
  warning: string | null
}

export type AdminOpenAiMetrics =
  | {
      status: 'available'
      periodLabel: string
      requests: number
      inputTokens: number
      outputTokens: number
      totalTokens: number
      spendUsd: number
      monthlyBudgetUsd: number | null
      remainingBudgetUsd: number | null
      warning: string | null
      checkedAt: string
    }
  | {
      status: 'unavailable'
      reason: string
    }

export type AdminMongoMetrics =
  | {
      status: 'available'
      databaseName: string
      collections: number
      dataSizeBytes: number
      storageSizeBytes: number
      indexSizeBytes: number
      freeStorageBytes: number | null
      checkedAt: string
    }
  | {
      status: 'unavailable'
      reason: string
    }

export type AdminResourceOverview = {
  openAi: AdminOpenAiMetrics
  mongo: AdminMongoMetrics
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function readOptionalNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key]

  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readArray(record: Record<string, unknown>, key: string): unknown[] {
  const value = record[key]

  return Array.isArray(value) ? value : []
}

async function fetchOpenAiJson(path: string, params: URLSearchParams): Promise<OpenAiApiResult> {
  const response = await fetch(`https://api.openai.com${path}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${serverEnv.openAiAdminApiKey}`,
      ...(serverEnv.openAiOrganizationId ? { 'OpenAI-Organization': serverEnv.openAiOrganizationId } : {})
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(8_000)
  })

  if (!response.ok) {
    return {
      payload: null,
      warning: `OpenAI returned ${response.status} for ${path}.`
    }
  }

  return { payload: await response.json(), warning: null }
}

function parseSpend(payload: unknown): number {
  if (!isRecord(payload)) {
    return 0
  }

  return readArray(payload, 'data').reduce<number>((total, bucket) => {
    if (!isRecord(bucket)) {
      return total
    }

    return total + readArray(bucket, 'results').reduce<number>((bucketTotal, result) => {
      if (!isRecord(result)) {
        return bucketTotal
      }

      const amount = result.amount

      if (!isRecord(amount)) {
        return bucketTotal
      }

      return bucketTotal + readNumber(amount, 'value')
    }, 0)
  }, 0)
}

type OpenAiUsageTotals = {
  requests: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

function parseUsage(payload: unknown): OpenAiUsageTotals {
  if (!isRecord(payload)) {
    return { requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  }

  return readArray(payload, 'data').reduce<OpenAiUsageTotals>(
    (totals, bucket) => {
      if (!isRecord(bucket)) {
        return totals
      }

      for (const result of readArray(bucket, 'results')) {
        if (!isRecord(result)) {
          continue
        }

        totals.requests += readNumber(result, 'num_model_requests')
        totals.inputTokens += readNumber(result, 'input_tokens')
        totals.outputTokens += readNumber(result, 'output_tokens')
        totals.totalTokens += readNumber(result, 'input_tokens') + readNumber(result, 'output_tokens')
      }

      return totals
    },
    { requests: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  )
}

async function getOpenAiMetrics(): Promise<AdminOpenAiMetrics> {
  if (!serverEnv.openAiAdminApiKey) {
    return {
      status: 'unavailable',
      reason: 'Add an OpenAI Organization Admin API key to view usage. A regular project key cannot access these endpoints.'
    }
  }

  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

  const params = new URLSearchParams({
    start_time: String(Math.floor(monthStart.getTime() / 1000)),
    end_time: String(Math.floor(now.getTime() / 1000)),
    bucket_width: '1d',
    limit: '31'
  })

  const [costs, usage] = await Promise.all([
    fetchOpenAiJson('/v1/organization/costs', params),
    fetchOpenAiJson('/v1/organization/usage/completions', params)
  ])

  const warnings = [costs.warning, usage.warning].filter((warning): warning is string => Boolean(warning))

  if (costs.warning && usage.warning) {
    return {
      status: 'unavailable',
      reason: 'OpenAI usage is unavailable. Confirm that OPENAI_ADMIN_API_KEY is an Organization Admin key.'
    }
  }

  const spendUsd = parseSpend(costs.payload)
  const usageTotals = parseUsage(usage.payload)
  const monthlyBudgetUsd = serverEnv.openAiMonthlyBudgetUsd

  return {
    status: 'available',
    periodLabel: monthStart.toLocaleDateString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    ...usageTotals,
    spendUsd,
    monthlyBudgetUsd,
    remainingBudgetUsd: monthlyBudgetUsd === null ? null : Math.max(0, monthlyBudgetUsd - spendUsd),
    warning: warnings[0] ?? null,
    checkedAt: now.toISOString()
  }
}

async function getMongoMetrics(): Promise<AdminMongoMetrics> {
  try {
    const connection = await connectDB()
    const database = connection.connection.db

    if (!database) {
      return { status: 'unavailable', reason: 'The MongoDB database handle is not ready.' }
    }

    const stats = await database.stats()

    return {
      status: 'available',
      databaseName: database.databaseName,
      collections: readNumber(stats, 'collections'),
      dataSizeBytes: readNumber(stats, 'dataSize'),
      storageSizeBytes: readNumber(stats, 'storageSize'),
      indexSizeBytes: readNumber(stats, 'indexSize'),
      freeStorageBytes: readOptionalNumber(stats, 'freeStorageSize'),
      checkedAt: new Date().toISOString()
    }
  } catch {
    return {
      status: 'unavailable',
      reason: 'MongoDB statistics are unavailable. The connected user may not have database statistics permission.'
    }
  }
}

export async function getAdminResourceOverview(): Promise<AdminResourceOverview> {
  const [openAiResult, mongoResult] = await Promise.allSettled([getOpenAiMetrics(), getMongoMetrics()])

  const openAi: AdminOpenAiMetrics =
    openAiResult.status === 'fulfilled'
      ? openAiResult.value
      : {
          status: 'unavailable',
          reason: 'OpenAI usage could not be reached. Try again later or verify the Organization Admin key.'
        }

  const mongo: AdminMongoMetrics =
    mongoResult.status === 'fulfilled'
      ? mongoResult.value
      : {
          status: 'unavailable',
          reason: 'MongoDB statistics are unavailable right now.'
        }

  return { openAi, mongo }
}
