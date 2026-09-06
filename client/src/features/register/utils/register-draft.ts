import type { PendingBuildIntent } from './pending-build-intent'

/** Intent captured before Google OAuth — company name may still be empty. */
export type RegisterDraftIntent =
  | { type: 'ai'; prompt: string }
  | { type: 'template'; templateId: string }
  | { type: 'blank' }

export type RegisterDraft = {
  intent: RegisterDraftIntent
  companyName?: string
  slug?: string
  promptText?: string
}

const STORAGE_KEY = 'servicehub-register-draft'

export function saveRegisterDraft(draft: RegisterDraft) {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function peekRegisterDraft(): RegisterDraft | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    return JSON.parse(raw) as RegisterDraft
  } catch {
    return null
  }
}

export function consumeRegisterDraft(): RegisterDraft | null {
  const draft = peekRegisterDraft()

  if (draft) {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return draft
}

export function clearRegisterDraft() {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.removeItem(STORAGE_KEY)
}

export function toPendingBuildIntent(draft: RegisterDraft, companyName: string): PendingBuildIntent {
  if (draft.intent.type === 'ai') {
    return { type: 'ai', prompt: draft.intent.prompt, companyName }
  }

  if (draft.intent.type === 'template') {
    return { type: 'template', templateId: draft.intent.templateId, companyName }
  }

  return { type: 'blank', companyName }
}
