'use client'

import { useEffect, useRef } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { markSiteStartedAction } from '@/app/actions/site-workspace.actions'

import { SiteWorkspaceProvider, useSiteWorkspace } from '../context/SiteWorkspaceContext'
import { usePublishedTemplates } from '../hooks/usePublishedTemplates'
import { hasSeenTemplateSetup, markTemplateSetupSeen } from '../utils/template-setup-storage'
import { SiteResetDialog } from './SiteResetDialog'
import { TemplatePickerDialog } from './TemplatePickerDialog'

type LauncherProps = {
  tenantSlug: string
  isSiteStarted: boolean
  extraPageCount: number
  children: React.ReactNode
}

function BuilderTemplateLauncherInner({
  tenantSlug,
  isSiteStarted,
  extraPageCount,
  children
}: LauncherProps) {
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
    closeStartFreshDialog
  } = useSiteWorkspace()
  const autoPromptHandled = useRef(false)

  const setupRequested = searchParams.get('setup') === '1'
  const replaceRequested = searchParams.get('replaceTemplate') === '1'
  const startFreshRequested = searchParams.get('startFresh') === '1'

  useEffect(() => {
    if (loading || autoPromptHandled.current) {
      return
    }

    if (replaceRequested && hasTemplates) {
      openTemplatePicker('replace')
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
    replaceRequested,
    setupRequested,
    startFreshRequested,
    tenantSlug
  ])

  const clearQueryFlags = () => {
    if (!setupRequested && !replaceRequested && !startFreshRequested) {
      return
    }

    router.replace('/your-space', { scroll: false })
  }

  const handlePickerClose = () => {
    markTemplateSetupSeen(tenantSlug)
    clearQueryFlags()
    closeTemplatePicker()
  }

  const handleScratch = async () => {
    markTemplateSetupSeen(tenantSlug)

    if (!isSiteStarted) {
      await markSiteStartedAction()
    }

    clearQueryFlags()
    closeTemplatePicker()
    router.refresh()
  }

  const handleApplied = () => {
    markTemplateSetupSeen(tenantSlug)
    clearQueryFlags()
    router.refresh()
  }

  return (
    <>
      {children}
      <TemplatePickerDialog
        open={isTemplatePickerOpen}
        templates={templates}
        loading={loading}
        isReplaceMode={templatePickerMode === 'replace'}
        onClose={handlePickerClose}
        onScratch={() => void handleScratch()}
        onApplied={handleApplied}
        title={templatePickerMode === 'replace' ? 'Replace site with template' : 'How would you like to start?'}
        subtitle={
          templatePickerMode === 'replace'
            ? 'Your draft pages will be replaced with the template layout. Your live site stays unchanged until you publish.'
            : 'Pick a professionally designed layout and customize it, or begin with a blank canvas.'
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
