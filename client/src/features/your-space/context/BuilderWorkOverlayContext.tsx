'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'

import {
  BuilderWorkCard,
  type BuilderWorkKind,
  type BuilderWorkPhase
} from '../components/BuilderWorkCard'

export type { BuilderWorkKind }

type RunOptions = {
  kind: BuilderWorkKind
  /** Theme name, business name, or short label shown under the headline. */
  title?: string
  work: () => void | Promise<void>
  /** Minimum time the “building” phase stays up so instant work still feels intentional. */
  minVisibleMs?: number
}

type BuilderWorkOverlayContextValue = {
  runBuilderWork: (options: RunOptions) => Promise<void>
  isWorkOverlayOpen: boolean
}

const BuilderWorkOverlayContext = createContext<BuilderWorkOverlayContextValue | null>(null)

const DEFAULT_MIN_MS: Record<BuilderWorkKind, number> = {
  theme: 1600,
  restyle: 1400,
  generate: 1800,
  plan: 1500
}

function sleep(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms)
  })
}

export function BuilderWorkOverlayProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<BuilderWorkPhase>('building')
  const [kind, setKind] = useState<BuilderWorkKind>('plan')
  const [title, setTitle] = useState<string | undefined>()
  const launchResolver = useRef<(() => void) | null>(null)

  const finishLaunch = useCallback(() => {
    setOpen(false)
    setPhase('building')
    launchResolver.current?.()
    launchResolver.current = null
  }, [])

  const runBuilderWork = useCallback(async ({ kind: nextKind, title: nextTitle, work, minVisibleMs }: RunOptions) => {
    const started = Date.now()

    setKind(nextKind)
    setTitle(nextTitle)
    setPhase('building')
    setOpen(true)

    try {
      await work()
    } catch (error) {
      setOpen(false)
      setPhase('building')
      throw error
    }

    const elapsed = Date.now() - started
    const minimum = minVisibleMs ?? DEFAULT_MIN_MS[nextKind]
    const remaining = Math.max(0, minimum - elapsed)

    if (remaining > 0) {
      await sleep(remaining)
    }

    setPhase('launching')

    await new Promise<void>(resolve => {
      launchResolver.current = resolve
    })
  }, [])

  const value = useMemo(
    () => ({
      runBuilderWork,
      isWorkOverlayOpen: open
    }),
    [open, runBuilderWork]
  )

  return (
    <BuilderWorkOverlayContext.Provider value={value}>
      {children}
      <BuilderWorkCard open={open} kind={kind} title={title} phase={phase} onLaunched={finishLaunch} />
    </BuilderWorkOverlayContext.Provider>
  )
}

export function useBuilderWorkOverlay() {
  const value = useContext(BuilderWorkOverlayContext)

  if (!value) {
    throw new Error('useBuilderWorkOverlay must be used within BuilderWorkOverlayProvider')
  }

  return value
}

/** Optional access when the provider may be absent (e.g. isolated stories). */
export function useOptionalBuilderWorkOverlay() {
  return useContext(BuilderWorkOverlayContext)
}
