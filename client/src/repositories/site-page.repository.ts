import { connectDB } from '@/lib/db'
import { MAX_PUBLISHED_VERSIONS } from '@/lib/constants/site-page'
import {
  SitePageModel,
  SitePageVersionModel,
  type ISitePageBlock,
  type ISitePageDocument,
  type ISitePageVersionDocument
} from '@/models/site-page'

function resolveDraftBlocks(page: ISitePageDocument): ISitePageBlock[] {
  if (page.draftBlocks?.length) {
    return page.draftBlocks
  }

  return page.blocks ?? []
}

function resolvePublishedBlocks(page: ISitePageDocument): ISitePageBlock[] {
  if (page.publishedBlocks?.length) {
    return page.publishedBlocks
  }

  return page.blocks ?? []
}

export class SitePageRepository {
  async findByTenantAndSlug(tenantId: string, slug = 'home'): Promise<ISitePageDocument | null> {
    await connectDB()

    const page = await SitePageModel.findOne({ tenantId, slug }).exec()

    if (!page) {
      return null
    }

    const draftBlocks = resolveDraftBlocks(page)
    const publishedBlocks = resolvePublishedBlocks(page)

    if (
      (!page.draftBlocks?.length && draftBlocks.length) ||
      (!page.publishedBlocks?.length && publishedBlocks.length)
    ) {
      page.draftBlocks = draftBlocks
      page.publishedBlocks = publishedBlocks
      await page.save()
    }

    return page
  }

  async saveDraft(
    tenantId: string,
    blocks: ISitePageBlock[],
    slug = 'home',
    siteStyles?: Record<string, unknown> | null
  ): Promise<ISitePageDocument> {
    await connectDB()

    const now = new Date()
    const update: Record<string, unknown> = {
      draftBlocks: blocks,
      draftUpdatedAt: now
    }

    if (siteStyles !== undefined) {
      update.draftSiteStyles = siteStyles
    }

    return SitePageModel.findOneAndUpdate(
      { tenantId, slug },
      {
        $set: update,
        $setOnInsert: { publishedBlocks: [], publishedAt: null }
      },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    ).exec() as Promise<ISitePageDocument>
  }

  async publishDraft(
    tenantId: string,
    blocks: ISitePageBlock[],
    slug = 'home',
    siteStyles?: Record<string, unknown> | null
  ): Promise<ISitePageDocument> {
    await connectDB()

    const now = new Date()
    const update: Record<string, unknown> = {
      draftBlocks: blocks,
      publishedBlocks: blocks,
      draftUpdatedAt: now,
      publishedAt: now
    }

    if (siteStyles !== undefined) {
      update.draftSiteStyles = siteStyles
      update.publishedSiteStyles = siteStyles
    }

    return SitePageModel.findOneAndUpdate(
      { tenantId, slug },
      { $set: update },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    ).exec() as Promise<ISitePageDocument>
  }

  async restoreDraft(tenantId: string, blocks: ISitePageBlock[], slug = 'home'): Promise<ISitePageDocument> {
    return this.saveDraft(tenantId, blocks, slug)
  }

  async listByTenant(tenantId: string): Promise<ISitePageDocument[]> {
    await connectDB()

    return SitePageModel.find({ tenantId }).sort({ sortOrder: 1, createdAt: 1 }).exec()
  }

  async replaceBlockSets(
    tenantId: string,
    slug: string,
    draftBlocks: ISitePageBlock[],
    publishedBlocks: ISitePageBlock[]
  ): Promise<void> {
    await connectDB()

    await SitePageModel.updateOne(
      { tenantId, slug },
      {
        $set: {
          draftBlocks,
          publishedBlocks
        }
      }
    ).exec()
  }

  async createPage(
    tenantId: string,
    slug: string,
    title: string,
    sortOrder: number,
    draftBlocks: ISitePageBlock[] = []
  ): Promise<ISitePageDocument> {
    await connectDB()

    return SitePageModel.create({
      tenantId,
      slug,
      title,
      sortOrder,
      description: slug === 'contact' ? 'Get in touch with us' : '',
      draftBlocks,
      publishedBlocks: [],
      publishedAt: null
    })
  }

  async updateMeta(
    tenantId: string,
    slug: string,
    updates: { title?: string; description?: string; sortOrder?: number }
  ): Promise<ISitePageDocument | null> {
    await connectDB()

    const update: Record<string, unknown> = {}

    if (updates.title !== undefined) {
      update.title = updates.title
    }

    if (updates.description !== undefined) {
      update.description = updates.description
    }

    if (updates.sortOrder !== undefined) {
      update.sortOrder = updates.sortOrder
    }

    if (Object.keys(update).length === 0) {
      return SitePageModel.findOne({ tenantId, slug }).exec()
    }

    return SitePageModel.findOneAndUpdate({ tenantId, slug }, { $set: update }, { returnDocument: 'after' }).exec()
  }

  async deletePage(tenantId: string, slug: string): Promise<boolean> {
    await connectDB()

    if (slug === 'home') {
      return false
    }

    const result = await SitePageModel.deleteOne({ tenantId, slug }).exec()

    return result.deletedCount > 0
  }

  async reorderPages(tenantId: string, orderedSlugs: string[]): Promise<void> {
    await connectDB()

    await Promise.all(
      orderedSlugs.map((slug, index) =>
        SitePageModel.updateOne({ tenantId, slug }, { $set: { sortOrder: index } }).exec()
      )
    )
  }
}

export class SitePageVersionRepository {
  async createVersion(
    tenantId: string,
    pageSlug: string,
    blocks: ISitePageBlock[],
    publishedBy?: string
  ): Promise<ISitePageVersionDocument> {
    await connectDB()

    const version = await SitePageVersionModel.create({
      tenantId,
      pageSlug,
      blocks,
      publishedAt: new Date(),
      publishedBy: publishedBy || undefined
    })

    await this.trimOldVersions(tenantId, pageSlug, MAX_PUBLISHED_VERSIONS)

    return version
  }

  async listVersions(tenantId: string, pageSlug = 'home', limit = MAX_PUBLISHED_VERSIONS) {
    await connectDB()

    return SitePageVersionModel.find({ tenantId, pageSlug })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean()
      .exec()
  }

  async findVersionById(tenantId: string, versionId: string): Promise<ISitePageVersionDocument | null> {
    await connectDB()

    return SitePageVersionModel.findOne({ _id: versionId, tenantId }).lean().exec()
  }

  private async trimOldVersions(tenantId: string, pageSlug: string, keep: number) {
    const versions = await SitePageVersionModel.find({ tenantId, pageSlug })
      .sort({ publishedAt: -1 })
      .select('_id')
      .exec()

    if (versions.length <= keep) {
      return
    }

    const idsToDelete = versions.slice(keep).map(version => version._id)

    await SitePageVersionModel.deleteMany({ _id: { $in: idsToDelete } }).exec()
  }
}

export const sitePageRepository = new SitePageRepository()
export const sitePageVersionRepository = new SitePageVersionRepository()
