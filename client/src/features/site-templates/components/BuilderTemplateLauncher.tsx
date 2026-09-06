'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import {
  consumePendingBuildIntent,
  getArrivalBuildIntent,
  type PendingBuildIntent
} from '@/features/register/utils/pending-build-intent'
import { BuilderArrivalWelcome } from '@/features/your-space/components/BuilderArrivalWelcome'

import { SiteWorkspaceProvider, useSiteWorkspace } from '../context/SiteWorkspaceContext'
import { usePublishedTemplates } from '../hooks/usePublishedTemplates'
import { hasSeenTemplateSetup, markTemplateSetupSeen } from '../utils/template-setup-storage'
import { AiSiteWizardDialog } from './ai-wizard/AiSiteWizardDialog'
import { SiteResetDialog } from './SiteResetDialog'
import { TemplatePickerDialog } from './TemplatePickerDialog'

type LauncherProps = {
  tenantSlug: string
  isSiteStarted: boolean
  extraPageCount: number
  children: React.ReactNode
}

function BuilderTemplateLauncherInner({ tenantSlug, isSiteStarted, extraPageCount, children }: LauncherProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { templates, loading, hasTemplates } = usePublishedTemplates()

  const {
    isTemplatePickerOpen,
    templatePickerMode,
    openTemplatePicker,
    closeTemplatePicker,
    isStartFreshOpen,
    openStartFreshDialog,
    closeStartFreshDialog,
    isAiWizardOpen,
    openAiWizard,
    closeAiWizard
  } = useSiteWorkspace()

  const autoPromptHandled = useRef(false)
  const [arrivalIntent, setArrivalIntent] = useState<PendingBuildIntent | null>(null)

  // Detected before templates finish loading so the register hand-off stays seamless.
  useEffect(() => {
    setArrivalIntent(getArrivalBuildIntent())
  }, [])

  const setupRequested = searchParams.get('setup') === '1'
  const aiSetupRequested = searchParams.get('aiSetup') === '1'
  const replaceRequested = searchParams.get('replaceTemplate') === '1'
  const startFreshRequested = searchParams.get('startFresh') === '1'

  useEffect(() => {
    if (loading || autoPromptHandled.current) {
      return
    }

    const pendingIntent = getArrivalBuildIntent()

    // Registration already chose AI / template / blank — don't reopen onboarding pickers.
    if (pendingIntent) {
      markTemplateSetupSeen(tenantSlug)

      if (pendingIntent.type !== 'ai') {
        consumePendingBuildIntent()
      }

      autoPromptHandled.current = true

      return
    }

    if (replaceRequested && hasTemplates) {
      openTemplatePicker('replace')
      autoPromptHandled.current = true

      return
    }

    if (aiSetupRequested) {
      openAiWizard()
      autoPromptHandled.current = true

      return
    }

    if (startFreshRequested && isSiteStarted) {
      openStartFreshDialog()
      autoPromptHandled.current = true

      return
    }

    if (setupRequested && hasTemplates) {
      openTemplatePicker(isSiteStarted ? 'replace' : 'onboarding')
      autoPromptHandled.current = true

      return
    }

    if (!isSiteStarted && hasTemplates && !hasSeenTemplateSetup(tenantSlug)) {
      openTemplatePicker('onboarding')
    }

    autoPromptHandled.current = true
  }, [
    hasTemplates,
    isSiteStarted,
    loading,
    openStartFreshDialog,
    openTemplatePicker,
    openAiWizard,
    replaceRequested,
    aiSetupRequested,
    setupRequested,
    startFreshRequested,
    tenantSlug
  ])

  const clearQueryFlags = () => {
    if (!setupRequested && !replaceRequested && !aiSetupRequested && !startFreshRequested) {
      return
    }

    router.replace('/your-space', { scroll: false })
  }

  const handlePickerClose = () => {
    markTemplateSetupSeen(tenantSlug)
    clearQueryFlags()
    closeTemplatePicker()
  }

  const handleApplied = () => {
    markTemplateSetupSeen(tenantSlug)
    clearQueryFlags()
    router.refresh()
  }

  const handleAiWizardClose = () => {
    markTemplateSetupSeen(tenantSlug)
    clearQueryFlags()
    closeAiWizard()
  }

  const handleAiCreated = () => {
    markTemplateSetupSeen(tenantSlug)
    clearQueryFlags()
    closeAiWizard()
    router.refresh()
  }

  return (
    <>
      {children}
      <BuilderArrivalWelcome intent={arrivalIntent} />
      <TemplatePickerDialog
        open={isTemplatePickerOpen}
        templates={templates}
        loading={loading}
        isReplaceMode={templatePickerMode === 'replace'}
        onClose={handlePickerClose}
        onApplied={handleApplied}
        title={templatePickerMode === 'replace' ? 'Browse template library' : 'Choose a template'}
        subtitle={
          templatePickerMode === 'replace'
            ? 'Preview any layout in full, then apply it to your draft. Your live site stays unchanged until you publish.'
            : 'Pick a published layout from the library, preview the full site, then customize it in the builder.'
        }
      />
      <SiteResetDialog
        open={isStartFreshOpen}
        onClose={() => {
          clearQueryFlags()
          closeStartFreshDialog()
        }}
        extraPageCount={extraPageCount}
      />
      <AiSiteWizardDialog
        open={isAiWizardOpen}
        templates={templates}
        onClose={handleAiWizardClose}
        onCreated={handleAiCreated}
      />
    </>
  )
}

export function BuilderTemplateLauncher(props: LauncherProps) {
  return (
    <SiteWorkspaceProvider isSiteStarted={props.isSiteStarted} extraPageCount={props.extraPageCount}>
      <BuilderTemplateLauncherInner {...props} />
    </SiteWorkspaceProvider>
  )
}
