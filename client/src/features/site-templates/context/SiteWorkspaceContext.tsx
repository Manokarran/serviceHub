'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type TemplatePickerMode = 'onboarding' | 'replace'

type SiteWorkspaceContextValue = {
  isSiteStarted: boolean
  extraPageCount: number
  openTemplatePicker: (mode?: TemplatePickerMode) => void
  closeTemplatePicker: () => void
  isTemplatePickerOpen: boolean
  templatePickerMode: TemplatePickerMode
  openStartFreshDialog: () => void
  closeStartFreshDialog: () => void
  isStartFreshOpen: boolean
  openAiWizard: () => void
  closeAiWizard: () => void
  isAiWizardOpen: boolean
}

const SiteWorkspaceContext = createContext<SiteWorkspaceContextValue | null>(null)

type ProviderProps = {
  isSiteStarted: boolean
  extraPageCount: number
  children: ReactNode
}

export function SiteWorkspaceProvider({ isSiteStarted, extraPageCount, children }: ProviderProps) {
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false)
  const [templatePickerMode, setTemplatePickerMode] = useState<TemplatePickerMode>('onboarding')
  const [isStartFreshOpen, setIsStartFreshOpen] = useState(false)
  const [isAiWizardOpen, setIsAiWizardOpen] = useState(false)

  const openTemplatePicker = useCallback(
    (mode: TemplatePickerMode = isSiteStarted ? 'replace' : 'onboarding') => {
      setTemplatePickerMode(mode)
      setIsTemplatePickerOpen(true)
    },
    [isSiteStarted]
  )

  const closeTemplatePicker = useCallback(() => {
    setIsTemplatePickerOpen(false)
  }, [])

  const openStartFreshDialog = useCallback(() => {
    setIsStartFreshOpen(true)
  }, [])

  const closeStartFreshDialog = useCallback(() => {
    setIsStartFreshOpen(false)
  }, [])

  const openAiWizard = useCallback(() => {
    setIsAiWizardOpen(true)
  }, [])

  const closeAiWizard = useCallback(() => {
    setIsAiWizardOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      isSiteStarted,
      extraPageCount,
      openTemplatePicker,
      closeTemplatePicker,
      isTemplatePickerOpen,
      templatePickerMode,
      openStartFreshDialog,
      closeStartFreshDialog,
      isStartFreshOpen,
      openAiWizard,
      closeAiWizard,
      isAiWizardOpen
    }),
    [
      closeAiWizard,
      closeStartFreshDialog,
      closeTemplatePicker,
      extraPageCount,
      isAiWizardOpen,
      isSiteStarted,
      isStartFreshOpen,
      isTemplatePickerOpen,
      openAiWizard,
      openStartFreshDialog,
      openTemplatePicker,
      templatePickerMode
    ]
  )

  return <SiteWorkspaceContext.Provider value={value}>{children}</SiteWorkspaceContext.Provider>
}

export function useSiteWorkspace() {
  const context = useContext(SiteWorkspaceContext)

  if (!context) {
    throw new Error('useSiteWorkspace must be used within SiteWorkspaceProvider')
  }

  return context
}

export function useSiteWorkspaceOptional() {
  return useContext(SiteWorkspaceContext)
}

/** @deprecated Use useSiteWorkspace */
export function useTemplatePicker() {
  const { openTemplatePicker, closeTemplatePicker, isTemplatePickerOpen } = useSiteWorkspace()

  return { openTemplatePicker, closeTemplatePicker, isTemplatePickerOpen }
}
