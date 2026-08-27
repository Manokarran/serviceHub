import { createStarterBlocks } from '@/features/your-space/constants'
import { DEFAULT_SITE_STYLES } from '@/features/your-space/constants/siteStylePresets'
import { isHomePageSlug } from '@/lib/utils/page-slug'
import { toPlainJson } from '@/lib/utils/plain-json'
import type { ISitePageBlock } from '@/models/site-page'
import { sitePageRepository } from '@/repositories/site-page.repository'
import { tenantRepository } from '@/repositories/tenant.repository'

export type SiteWorkspaceStatus = {
  isSiteStarted: boolean
  hasPublishedSite: boolean
  pageCount: number
  appliedTemplateId: string | null
}

export type ResetSiteDraftsMode = 'blank' | 'starter'

export class SiteWorkspaceService {
  async getStatus(tenantId: string): Promise<SiteWorkspaceStatus> {
    const tenant = await tenantRepository.findById(tenantId)
    const pages = await sitePageRepository.listByTenant(tenantId)
    const hasPublishedSite = pages.some(page => Boolean(page.publishedAt))
    const appliedTemplateId = tenant?.settings?.appliedTemplateId?.trim() || null

    if (tenant?.settings?.siteStartedAt) {
      return {
        isSiteStarted: true,
        hasPublishedSite,
        pageCount: pages.length,
        appliedTemplateId
      }
    }

    if (hasPublishedSite || appliedTemplateId) {
      await this.markSiteStarted(tenantId, appliedTemplateId ? { appliedTemplateId } : undefined)

      return {
        isSiteStarted: true,
        hasPublishedSite,
        pageCount: pages.length,
        appliedTemplateId
      }
    }

    return {
      isSiteStarted: false,
      hasPublishedSite,
      pageCount: pages.length,
      appliedTemplateId
    }
  }

  async markSiteStarted(tenantId: string, options?: { appliedTemplateId?: string }) {
    const tenant = await tenantRepository.findById(tenantId)

    if (tenant?.settings?.siteStartedAt) {
      if (options?.appliedTemplateId) {
        await tenantRepository.updateSettings(tenantId, {
          appliedTemplateId: options.appliedTemplateId
        })
      }

      return
    }

    await tenantRepository.updateSettings(tenantId, {
      siteStartedAt: new Date(),
      ...(options?.appliedTemplateId ? { appliedTemplateId: options.appliedTemplateId } : {})
    })
  }

  async resetSiteDrafts(
    tenantId: string,
    options: { mode: ResetSiteDraftsMode; removeExtraPages: boolean }
  ): Promise<{ homeSlug: string }> {
    const { sitePageService } = await import('@/services/site-page')

    await sitePageService.ensureHomePage(tenantId)

    const pages = await sitePageRepository.listByTenant(tenantId)
    const homeBlocks =
      options.mode === 'starter'
        ? (toPlainJson(createStarterBlocks()) as unknown as ISitePageBlock[])
        : []
    const homeStyles =
      options.mode === 'starter'
        ? (toPlainJson(DEFAULT_SITE_STYLES) as unknown as Record<string, unknown>)
        : null

    for (const page of pages) {
      if (isHomePageSlug(page.slug)) {
        continue
      }

      if (options.removeExtraPages) {
        await sitePageRepository.deletePage(tenantId, page.slug)
      } else {
        await sitePageRepository.saveDraft(tenantId, [], page.slug)
      }
    }

    await sitePageRepository.saveDraft(tenantId, homeBlocks, 'home', homeStyles)

    return { homeSlug: 'home' }
  }
}

export const siteWorkspaceService = new SiteWorkspaceService()
