import 'server-only'

import { optional } from '@/lib/utils/env-helpers'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export function isOpenAiConfigured(): boolean {
  return Boolean(optional(process.env.OPENAI_API_KEY, ''))
}

export function getOpenAiModel(): string {
  return optional(process.env.OPENAI_MODEL, 'gpt-4.1-nano')
}

type ChatMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function createJsonCompletion<T>(params: {
  system: string
  user: string
  temperature?: number
}): Promise<T> {
  const apiKey = optional(process.env.OPENAI_API_KEY, '')

  if (!apiKey) {
    throw new Error('OpenAI is not configured. Add OPENAI_API_KEY to your environment.')
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: params.system },
    { role: 'user', content: params.user }
  ]

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: getOpenAiModel(),
      messages,
      temperature: params.temperature ?? 0.65,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('[openai] request failed', response.status, body)
    throw new Error('AI request failed. Please try again in a moment.')
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const content = payload.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('AI returned an empty response.')
  }

  return JSON.parse(content) as T
}
