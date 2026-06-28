'use client'

import { useEffect, useState } from 'react'

import { listPublishedSiteTemplatesAction } from '@/app/actions/site-template.actions'
import type { SiteTemplateSummary } from '@/models/site-template'

export function usePublishedTemplates() {
  const [templates, setTemplates] = useState<SiteTemplateSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void listPublishedSiteTemplatesAction().then(result => {
      if (cancelled) {
        return
      }

      if (result.success) {
        setTemplates(result.templates)
      } else {
        setError(result.error)
      }

      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return { templates, loading, error, hasTemplates: templates.length > 0 }
}
