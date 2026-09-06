export type PendingBuildIntent =
  | {
      type: 'ai'
      prompt: string
      companyName: string
    }
  | {
      /** AI draft already applied during registration — builder should land on the finished site. */
      type: 'ai-ready'
      companyName: string
      designConcept?: string
    }
  | {
      type: 'template'
      templateId: string
      companyName: string
    }
  | {
      type: 'blank'
      companyName: string
    }

const STORAGE_KEY = 'servicehub-pending-build-intent'

/**
 * The builder mounts several readers of this intent and the AI chat consumes it as soon as
 * it opens. Remembering the last consumed value lets later readers still tell that this page
 * load came straight from registration.
 */
let lastConsumed: PendingBuildIntent | null = null

export function savePendingBuildIntent(intent: PendingBuildIntent) {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(intent))
}

export function peekPendingBuildIntent(): PendingBuildIntent | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    return JSON.parse(raw) as PendingBuildIntent
  } catch {
    return null
  }
}

export function consumePendingBuildIntent(): PendingBuildIntent | null {
  const intent = peekPendingBuildIntent()

  if (intent) {
    lastConsumed = intent
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return intent
}

/** The intent this page load arrived with, whether or not it has already been consumed. */
export function getArrivalBuildIntent(): PendingBuildIntent | null {
  return peekPendingBuildIntent() ?? lastConsumed
}

export function clearPendingBuildIntent() {
  if (typeof window === 'undefined') {
    return
  }

  sessionStorage.removeItem(STORAGE_KEY)
}
