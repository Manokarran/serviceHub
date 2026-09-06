'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

import type { PropertyPanelTab } from '../components/property/PropertyPanelUi'
import type { QuickAddLocation } from '../utils/quickAddHelpers'

export type AiInsertIntent = {
  location: QuickAddLocation
  index: number
  label: string
}

export type AiInsertPending = {
  prompt: string
  intent: AiInsertIntent
}

type BuilderShellContextValue = {
  openPropertyPanel: (tab?: PropertyPanelTab) => void
  openAiChat: () => void
  aiInsertIntent: AiInsertIntent | null
  setAiInsertIntent: (intent: AiInsertIntent | null) => void
  clearAiInsertIntent: () => void
  aiInsertPending: AiInsertPending | null
  requestAiInsert: (pending: AiInsertPending) => void
  consumeAiInsertPending: () => AiInsertPending | null
}

const BuilderShellContext = createContext<BuilderShellContextValue | null>(null)

export function BuilderShellProvider({
  children,
  openPropertyPanel,
  openAiChat
}: {
  children: ReactNode
  openPropertyPanel: (tab?: PropertyPanelTab) => void
  openAiChat: () => void
}) {
  const [aiInsertIntent, setAiInsertIntent] = useState<AiInsertIntent | null>(null)
  const [aiInsertPending, setAiInsertPending] = useState<AiInsertPending | null>(null)
  const pendingRef = useRef<AiInsertPending | null>(null)

  pendingRef.current = aiInsertPending

  const clearAiInsertIntent = useCallback(() => {
    setAiInsertIntent(null)
  }, [])

  const requestAiInsert = useCallback(
    (pending: AiInsertPending) => {
      setAiInsertIntent(pending.intent)
      setAiInsertPending(pending)
      openAiChat()
    },
    [openAiChat]
  )

  const consumeAiInsertPending = useCallback(() => {
    const taken = pendingRef.current

    if (taken) {
      pendingRef.current = null
      setAiInsertPending(null)
    }

    return taken
  }, [])

  const value = useMemo(
    () => ({
      openPropertyPanel,
      openAiChat,
      aiInsertIntent,
      setAiInsertIntent,
      clearAiInsertIntent,
      aiInsertPending,
      requestAiInsert,
      consumeAiInsertPending
    }),
    [
      openPropertyPanel,
      openAiChat,
      aiInsertIntent,
      clearAiInsertIntent,
      aiInsertPending,
      requestAiInsert,
      consumeAiInsertPending
    ]
  )

  return <BuilderShellContext.Provider value={value}>{children}</BuilderShellContext.Provider>
}

export function useBuilderShell() {
  return useContext(BuilderShellContext)
}
