import { redirect, notFound } from 'next/navigation'

import { STARTER_BLOCKS } from '@/features/your-space/constants'
import { createAboutPageBlocks, createContactPageBlocks, createPricingPageBlocks } from '@/features/your-space/constants/pageTemplates'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { WebsiteBuilder } from '@/features/your-space/components/WebsiteBuilder'
import { auth } from '@/lib/auth'
import { isSuperAdminEmail } from '@/lib/auth/super-admin'
import { isHomePageSlug } from '@/lib/utils/page-slug'
import { siteTemplateService } from '@/services/site-template'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ p?: string }>
}

export default async function LibraryTemplateEditPage({ params, searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user || !isSuperAdminEmail(session.user.email)) {
    redirect('/home')
  }

  const { id } = await params
  const { p: pageParam } = await searchParams
  const template = await siteTemplateService.getTemplate(id)

  if (!template || template.status === 'archived') {
    notFound()
  }

  let pages = await siteTemplateService.listTemplatePages(id)

  if (!pages.length) {
    await siteTemplateService.createTemplatePage(id, { title: 'Home', slug: 'home' })
    await siteTemplateService.saveTemplatePageDraft(id, 'home', STARTER_BLOCKS as Block[])
    await siteTemplateService.createTemplatePage(id, { title: 'About', slug: 'about' })
    await siteTemplateService.saveTemplatePageDraft(id, 'about', createAboutPageBlocks() as Block[])
    await siteTemplateService.createTemplatePage(id, { title: 'Pricing', slug: 'pricing' })
    await siteTemplateService.saveTemplatePageDraft(id, 'pricing', createPricingPageBlocks() as Block[])
    await siteTemplateService.createTemplatePage(id, { title: 'Contact', slug: 'contact' })
    await siteTemplateService.saveTemplatePageDraft(id, 'contact', createContactPageBlocks() as Block[])
    pages = await siteTemplateService.listTemplatePages(id)
  }

  const initialPageSlug = pageParam?.trim() || 'home'
  const activeSlug = pages.some(page => page.slug === initialPageSlug)
    ? initialPageSlug
    : pages.find(page => isHomePageSlug(page.slug))?.slug ?? pages[0]?.slug ?? 'home'

  const sitePage = await siteTemplateService.getTemplatePage(id, activeSlug)

  return (
    <WebsiteBuilder
      tenantSlug={`library-template-${id}`}
      tenantName={template.name}
      builderScope='library_template'
      libraryTemplateId={id}
      initialPageSlug={activeSlug}
      initialPages={pages}
      initialPageTitle={sitePage.title}
      initialDraftBlocks={sitePage.draftBlocks as Block[]}
      initialPublishedBlocks={sitePage.publishedBlocks as Block[]}
      initialSavedAt={sitePage.draftUpdatedAt}
      initialPublishedAt={sitePage.publishedAt}
      initialDraftSiteStyles={sitePage.draftSiteStyles as SiteStyles | null}
      initialPublishedSiteStyles={sitePage.publishedSiteStyles as SiteStyles | null}
      initialVersions={[]}
      isSiteStarted
      extraPageCount={pages.filter(page => !isHomePageSlug(page.slug)).length}
    />
  )
}
