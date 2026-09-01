'use server'

import { z } from 'zod'

import { DEFAULT_SITE_STYLES } from '@/features/your-space/constants/siteStylePresets'
import type { Block } from '@/features/your-space/types'
import type { SiteStyles } from '@/features/your-space/types/siteStyles'
import { normalizeBlocks } from '@/features/your-space/utils/blockMigration'
import { mergeSiteStyles } from '@/features/your-space/utils/siteStylesHelpers'
import type { DesignProposal, RewordResult } from '@/lib/ai-design-studio/types'
import { auth } from '@/lib/auth'
import { formatActionError } from '@/lib/auth/resolve-session-user-id'
import { serializeForClient } from '@/lib/utils/plain-json'
import { aiDesignStudioService } from '@/services/ai-design-studio/ai-design-studio.service'

const MAX_BLOCKS = 200

/**
 * Blocks arrive from the live draft, which may hold unsaved edits, so the payload is the
 * source of truth. Only the envelope is validated here — the tree itself is sanitised by
 * the same migration the builder runs on load.
 */
const requestSchema = z.object({
  scope: z.enum(['control', 'page']),
  pageSlug: z.string().trim().min(1).max(120),
  targetBlockId: z.string().trim().max(120).nullable(),
  instruction: z.string().trim().max(600).default(''),
  blocks: z.array(z.object({ id: z.string(), type: z.string() }).passthrough()).min(1).max(MAX_BLOCKS)
})

const restyleSchema = requestSchema.extend({
  rewriteCopy: z.boolean().default(false),
  siteStyles: z.record(z.string(), z.unknown())
})

type ProposeResult = { success: true; proposal: DesignProposal } | { success: false; error: string }
type RewordActionResult = { success: true; result: RewordResult } | { success: false; error: string }

async function requireTenantId(): Promise<string> {
  const session = await auth()

  if (!session?.user?.tenantId) {
    throw new Error('You must be signed in with an organization.')
  }

  return session.user.tenantId
}

export async function proposeDesignRestyleAction(input: unknown): Promise<ProposeResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = restyleSchema.parse(input)

    const proposal = await aiDesignStudioService.proposeRestyle({
      scope: parsed.scope,
      pageSlug: parsed.pageSlug,
      blocks: normalizeBlocks(parsed.blocks as unknown as Block[]),
      siteStyles: mergeSiteStyles(parsed.siteStyles as Partial<SiteStyles>, DEFAULT_SITE_STYLES),
      targetBlockId: parsed.targetBlockId,
      instruction: parsed.instruction,
      rewriteCopy: parsed.rewriteCopy,
      tenantId
    })

    return { success: true, proposal: serializeForClient(proposal) }
  } catch (error) {
    console.error('[proposeDesignRestyleAction]', error)

    return { success: false, error: formatActionError(error, 'I could not put a redesign together.') }
  }
}

export async function rewordDesignScopeAction(input: unknown): Promise<RewordActionResult> {
  try {
    const tenantId = await requireTenantId()
    const parsed = requestSchema.parse(input)

    const result = await aiDesignStudioService.reword({
      scope: parsed.scope,
      pageSlug: parsed.pageSlug,
      blocks: normalizeBlocks(parsed.blocks as unknown as Block[]),
      targetBlockId: parsed.targetBlockId,
      instruction: parsed.instruction,
      tenantId
    })

    return { success: true, result: serializeForClient(result) }
  } catch (error) {
    console.error('[rewordDesignScopeAction]', error)

    return { success: false, error: formatActionError(error, 'I could not rewrite that copy.') }
  }
}
