'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode
} from 'react'

import {
  addBasePageFromTemplateAction,
  createSitePageAction,
  deleteSitePageAction,
  duplicateSitePageAction,
  getSitePageAction,
  listSitePageVersionsAction,
  publishAllSitePagesAction,
  saveSitePageDraftAction,
  updateSitePageMetaAction
} from '@/app/actions/site-page.actions'
import type { BuilderScope } from '@/lib/site-template/resolve-builder-tenant'
import type { PublishedVersionSummary, SitePageSummary } from '@/models/site-page/site-page.types'
import { toPlainJson } from '@/lib/utils/plain-json'
import { isHomePageSlug } from '@/lib/utils/page-slug'

import { createStarterBlocks, getStorageKey } from '../constants'
import { DEFAULT_SITE_STYLES, SITE_THEME_PRESETS } from '../constants/siteStylePresets'
import type { Block, BlockPropsPatch, BlockType, BuilderMode, BuilderSidebarPanel, BuilderViewport } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { blocksEqual } from '../utils/blocksEqual'
import { normalizeBlocks } from '../utils/blockMigration'
import { cloneBlockWithNewIds, createBlock } from '../utils/blockFactory'
import {
  addBlockToTree,
  deleteBlockFromTree,
  findBlockInTree,
  moveBlockInTree,
  resolveDropTarget,
  resolvePasteTargetAfterBlock,
  updateBlockInTree,
  type BlockLocation,
  type NestTargetHints
} from '../utils/blockTreeUtils'
import {
  collectFormatPaintPatches,
  copyBlockFormat,
  formatPaintRegionsEqual,
  type CopiedFormat,
  type FormatPaintMode,
  type FormatPaintRegion
} from '../utils/formatPaint'
import { mergeSiteStyles, resolveBuilderCanvasStyles } from '../utils/siteStylesHelpers'
import { reharmonizeBlockTreeToTheme } from '../utils/themePropagation'
import { applyAiBuilderPlan, type AiPlanApplyResult } from '../utils/aiPlanApply'
import type { AiBuilderPlan, AiBuilderRestyleScope } from '@/lib/ai-builder/types'
import { ensureNavLinksOnBlocks, titleForBasePageSlug } from '@/lib/ai-builder/suggested-base-pages'
import {
  BUILDER_AUTOSAVE_KEY,
  BUILDER_GRID_MODE_KEY,
  readBuilderAutosave,
  readBuilderGridMode
} from '../utils/builderContainerChrome'
import { siteStylesEqual } from '../utils/siteStylesEqual'
import { recordPaletteUse } from '../utils/paletteUsage'
import { useBuilderHistory } from '../hooks/useBuilderHistory'
import type { TenantLocation } from '@/lib/location/types'

type BuilderState = {
  blocks: Block[]
  publishedBlocks: Block[]
  siteStyles: SiteStyles
  publishedSiteStyles: SiteStyles
  selectedBlockId: string | null
  selectedNestedItemId: string | null
  selectedRegion: FormatPaintRegion | null
  mode: BuilderMode
  viewport: BuilderViewport
  showGrid: boolean
  autosaveEnabled: boolean
  sidebarPanel: BuilderSidebarPanel
  currentPageSlug: string
  pages: SitePageSummary[]
  currentPageTitle: string
  isPageSwitching: boolean
  isDirty: boolean
  isSaving: boolean
  isPublishing: boolean
  isLoading: boolean
  lastSavedAt: string | null
  lastPublishedAt: string | null
  saveError: string | null
  publishError: string | null
  versions: PublishedVersionSummary[]
}

export type BuilderDraftSnapshot = {
  blocks: Block[]
  siteStyles: SiteStyles
  selectedBlockId: string | null
}

type BuilderAction =
  | {
      type: 'SET_INITIAL'
      blocks: Block[]
      publishedBlocks: Block[]
      siteStyles?: SiteStyles
      publishedSiteStyles?: SiteStyles
      savedAt?: string | null
      publishedAt?: string | null
      versions?: PublishedVersionSummary[]
      currentPageSlug?: string
      currentPageTitle?: string
      pages?: SitePageSummary[]
    }
  | { type: 'SET_BLOCKS'; blocks: Block[]; savedAt?: string | null }
  | { type: 'ADD_BLOCK'; block: Block; target: BlockLocation }
  | { type: 'UPDATE_BLOCK'; id: string; props: BlockPropsPatch }
  | { type: 'UPDATE_BLOCKS'; patches: Array<{ id: string; props: BlockPropsPatch }> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'MOVE_BLOCK'; activeId: string; overId: string | number; nestHints?: NestTargetHints }
  | { type: 'SELECT_BLOCK'; id: string | null; region?: FormatPaintRegion | null }
  | { type: 'SELECT_NESTED_ITEM'; id: string | null }
  | { type: 'SET_MODE'; mode: BuilderMode }
  | { type: 'SET_VIEWPORT'; viewport: BuilderViewport }
  | { type: 'SET_SHOW_GRID'; showGrid: boolean }
  | { type: 'SET_AUTOSAVE'; autosaveEnabled: boolean }
  | { type: 'SET_SIDEBAR_PANEL'; panel: BuilderSidebarPanel }
  | { type: 'UPDATE_SITE_STYLES'; siteStyles: SiteStyles }
  | { type: 'APPLY_THEME'; themeId: string; restyleControls?: AiBuilderRestyleScope }
  | { type: 'APPLY_AI_RESULT'; blocks: Block[]; siteStyles: SiteStyles; selectedBlockId: string | null }
  | { type: 'RESTORE_DRAFT'; snapshot: BuilderDraftSnapshot; isDirty?: boolean }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_PUBLISHING'; isPublishing: boolean }
  | { type: 'SET_PAGE_SWITCHING'; isPageSwitching: boolean }
  | {
      type: 'SWITCH_PAGE'
      slug: string
      title: string
      blocks: Block[]
      publishedBlocks: Block[]
      savedAt: string | null
      publishedAt: string | null
      versions: PublishedVersionSummary[]
    }
  | { type: 'SET_PAGES'; pages: SitePageSummary[] }
  | { type: 'MARK_SAVED'; savedAt: string }
  | {
      type: 'MARK_PUBLISHED'
      publishedAt: string
      publishedBlocks: Block[]
      publishedSiteStyles: SiteStyles
      versions: PublishedVersionSummary[]
    }
  | { type: 'SET_SAVE_ERROR'; error: string | null }
  | { type: 'SET_PUBLISH_ERROR'; error: string | null }
  | { type: 'SET_VERSIONS'; versions: PublishedVersionSummary[] }
  | { type: 'RESET_TO_STARTER' }
  | { type: 'RESET_TO_EMPTY' }

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_INITIAL':
      return {
        ...state,
        blocks: normalizeBlocks(action.blocks),
        publishedBlocks: normalizeBlocks(action.publishedBlocks),
        siteStyles: action.siteStyles ?? state.siteStyles,
        publishedSiteStyles: action.publishedSiteStyles ?? action.siteStyles ?? state.publishedSiteStyles,
        isDirty: false,
        isLoading: false,
        lastSavedAt: action.savedAt ?? null,
        lastPublishedAt: action.publishedAt ?? null,
        versions: action.versions ?? state.versions,
        currentPageSlug: action.currentPageSlug ?? state.currentPageSlug,
        currentPageTitle: action.currentPageTitle ?? state.currentPageTitle,
        pages: action.pages ?? state.pages,
        selectedNestedItemId: null,
        selectedRegion: null,
        saveError: null,
        publishError: null
      }
    case 'SET_BLOCKS':
      return {
        ...state,
        blocks: normalizeBlocks(action.blocks),
        isDirty: false,
        isLoading: false,
        lastSavedAt: action.savedAt ?? state.lastSavedAt,
        saveError: null
      }
    case 'ADD_BLOCK':
      return {
        ...state,
        blocks: addBlockToTree(state.blocks, action.block, action.target),
        selectedBlockId: action.block.id,
        selectedNestedItemId: null,
        selectedRegion: null,
        isDirty: true,
        saveError: null,
        publishError: null
      }
    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: updateBlockInTree(state.blocks, action.id, action.props),
        isDirty: true,
        saveError: null,
        publishError: null
      }
    case 'UPDATE_BLOCKS': {
      const blocks = action.patches.reduce(
        (next, patch) => updateBlockInTree(next, patch.id, patch.props),
        state.blocks
      )

      return {
        ...state,
        blocks,
        isDirty: true,
        saveError: null,
        publishError: null
      }
    }
    case 'DELETE_BLOCK':
      return {
        ...state,
        blocks: deleteBlockFromTree(state.blocks, action.id),
        selectedBlockId: state.selectedBlockId === action.id ? null : state.selectedBlockId,
        selectedNestedItemId: state.selectedBlockId === action.id ? null : state.selectedNestedItemId,
        selectedRegion: state.selectedBlockId === action.id ? null : state.selectedRegion,
        isDirty: true,
        saveError: null,
        publishError: null
      }
    case 'MOVE_BLOCK':
      return {
        ...state,
        blocks: moveBlockInTree(state.blocks, action.activeId, action.overId, action.nestHints),
        isDirty: true,
        saveError: null,
        publishError: null
      }
    case 'SELECT_BLOCK':
      return {
        ...state,
        selectedBlockId: action.id,
        selectedNestedItemId: action.id && action.id === state.selectedBlockId ? state.selectedNestedItemId : null,
        selectedRegion: action.id ? (action.region ?? null) : null
      }
    case 'SELECT_NESTED_ITEM':
      return { ...state, selectedNestedItemId: action.id }
    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        selectedBlockId: action.mode === 'preview' ? null : state.selectedBlockId,
        selectedNestedItemId: action.mode === 'preview' ? null : state.selectedNestedItemId,
        selectedRegion: action.mode === 'preview' ? null : state.selectedRegion
      }
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport }
    case 'SET_SHOW_GRID':
      return { ...state, showGrid: action.showGrid }
    case 'SET_AUTOSAVE':
      return { ...state, autosaveEnabled: action.autosaveEnabled }
    case 'SET_SIDEBAR_PANEL':
      return { ...state, sidebarPanel: action.panel }
    case 'UPDATE_SITE_STYLES':
      return { ...state, siteStyles: action.siteStyles, isDirty: true, saveError: null, publishError: null }

    case 'APPLY_THEME': {
      const preset = SITE_THEME_PRESETS.find(entry => entry.id === action.themeId)

      if (!preset) {
        return state
      }

      const scope = action.restyleControls ?? 'match'

      const blocks =
        scope === 'none'
          ? state.blocks
          : reharmonizeBlockTreeToTheme(
              state.blocks,
              state.siteStyles,
              preset.styles,
              scope === 'rebuild' ? 'force' : 'conservative'
            ).blocks

      return { ...state, blocks, siteStyles: preset.styles, isDirty: true, saveError: null, publishError: null }
    }

    case 'APPLY_AI_RESULT':
      return {
        ...state,
        blocks: action.blocks,
        siteStyles: action.siteStyles,
        selectedBlockId: action.selectedBlockId,
        selectedNestedItemId: null,
        selectedRegion: null,
        isDirty: true,
        saveError: null,
        publishError: null
      }

    case 'RESTORE_DRAFT':
      return {
        ...state,
        blocks: action.snapshot.blocks,
        siteStyles: action.snapshot.siteStyles,
        selectedBlockId: action.snapshot.selectedBlockId,
        selectedNestedItemId: null,
        selectedRegion: null,
        // Undo back to the last saved snapshot clears the dirty flag.
        isDirty: action.isDirty ?? true,
        saveError: null,
        publishError: null
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'SET_SAVING':
      return { ...state, isSaving: action.isSaving }
    case 'SET_PUBLISHING':
      return { ...state, isPublishing: action.isPublishing }
    case 'SET_PAGE_SWITCHING':
      return { ...state, isPageSwitching: action.isPageSwitching }
    case 'SWITCH_PAGE':
      return {
        ...state,
        currentPageSlug: action.slug,
        currentPageTitle: action.title,
        blocks: normalizeBlocks(action.blocks),
        publishedBlocks: normalizeBlocks(action.publishedBlocks),
        selectedBlockId: null,
        selectedNestedItemId: null,
        selectedRegion: null,
        isDirty: false,
        isPageSwitching: false,
        isLoading: false,
        lastSavedAt: action.savedAt,
        lastPublishedAt: action.publishedAt,
        versions: action.versions,
        saveError: null,
        publishError: null
      }
    case 'SET_PAGES':
      return { ...state, pages: action.pages }
    case 'MARK_SAVED':
      return { ...state, isDirty: false, isSaving: false, lastSavedAt: action.savedAt, saveError: null }
    case 'MARK_PUBLISHED':
      return {
        ...state,
        isDirty: false,
        isSaving: false,
        isPublishing: false,
        publishedBlocks: action.publishedBlocks,
        publishedSiteStyles: action.publishedSiteStyles,
        siteStyles: action.publishedSiteStyles,
        lastPublishedAt: action.publishedAt,
        lastSavedAt: action.publishedAt,
        versions: action.versions,
        publishError: null,
        pages: state.pages.map(page => ({
          ...page,
          hasUnpublishedChanges: false,
          publishedAt: action.publishedAt
        }))
      }
    case 'SET_SAVE_ERROR':
      return { ...state, isSaving: false, saveError: action.error }
    case 'SET_PUBLISH_ERROR':
      return { ...state, isPublishing: false, publishError: action.error }
    case 'SET_VERSIONS':
      return { ...state, versions: action.versions }
    case 'RESET_TO_STARTER':
      return {
        ...state,
        blocks: createStarterBlocks(),
        selectedBlockId: null,
        selectedNestedItemId: null,
        selectedRegion: null,
        isDirty: true,
        saveError: null,
        publishError: null
      }
    case 'RESET_TO_EMPTY':
      return {
        ...state,
        blocks: [],
        selectedBlockId: null,
        selectedNestedItemId: null,
        selectedRegion: null,
        isDirty: true,
        saveError: null,
        publishError: null
      }
    default:
      return state
  }
}

type BuilderContextValue = BuilderState & {
  tenantSlug: string
  tenantLocation: TenantLocation | null
  builderScope: BuilderScope
  libraryTemplateId: string | null
  selectedBlock: Block | null
  hasUnpublishedChanges: boolean
  addBlock: (type: BlockType, target?: BlockLocation, paletteId?: string) => Block
  updateBlock: (id: string, props: BlockPropsPatch) => void
  deleteBlock: (id: string) => void

  /** The block currently held in the copy clipboard (null if empty). */
  copiedBlock: Block | null

  /** Copy a block to the clipboard. */
  copyBlock: (block: Block) => void

  /** Paste the clipboard block after a given block id (root-level). Clears clipboard after paste. */
  pasteBlock: (afterBlockId?: string) => void

  /** Copied visual format (not the block itself) for format paint. */
  copiedFormat: CopiedFormat | null

  /** Word-style format painter: off, apply once, or keep applying until cancelled. */
  formatPaintMode: FormatPaintMode

  /** Copy matching visual properties from a control. Does not arm the painter. */
  copyFormat: (block: Block) => void

  /** Copy format and arm the painter so the next control click applies it. */
  startFormatPaint: (block: Block, mode?: Exclude<FormatPaintMode, 'off'>) => void

  /** Apply the copied format onto a target control or panel. Records one undo step. */
  applyCopiedFormat: (targetId?: string, targetRegion?: FormatPaintRegion | null) => boolean

  /** Leave paint mode without clearing the copied format. */
  cancelFormatPaint: () => void
  moveBlock: (activeId: string, overId: string | number, nestHints?: NestTargetHints) => void
  selectBlock: (id: string | null, options?: { region?: FormatPaintRegion | null }) => void
  selectedRegion: FormatPaintRegion | null
  selectNestedItem: (id: string | null) => void
  setMode: (mode: BuilderMode) => void
  setViewport: (viewport: BuilderViewport) => void
  setShowGrid: (showGrid: boolean) => void
  setAutosaveEnabled: (enabled: boolean) => void
  setSidebarPanel: (panel: BuilderSidebarPanel) => void
  updateSiteStyles: (partial: Partial<SiteStyles>) => void
  applyThemePreset: (themeId: string, restyleControls?: AiBuilderRestyleScope) => void

  /** Apply a whole AI plan against one snapshot so operations can build on each other. */
  applyAiPlan: (plan: AiBuilderPlan, refToId: Record<string, string>) => AiPlanApplyResult

  /**
   * Land a confirmed redesign: one control's subtree when targetBlockId is set, otherwise
   * the whole page plus its tokens.
   */
  applyAiDesign: (input: { blocks: Block[]; siteStyles: SiteStyles | null; targetBlockId: string | null }) => boolean
  restoreDraft: (snapshot: BuilderDraftSnapshot) => void

  /** Page-draft undo/redo for unsaved (and autosaved) session edits on the open page. */
  canUndo: boolean
  canRedo: boolean
  undo: () => boolean
  redo: () => boolean
  savePage: () => Promise<void>
  publishPage: () => Promise<void>
  switchPage: (slug: string) => Promise<void>
  createPage: (
    title: string,
    options?: { slug?: string }
  ) => Promise<{ success: true; page: SitePageSummary } | { success: false; error: string }>
  /**
   * Clone a missing base page (About / Contact / …) into this site, theme-matched
   * to the current draft styles, then switch to it.
   */
  addBasePageFromTemplate: (
    slug: string
  ) => Promise<
    | { success: true; page: SitePageSummary; themed: boolean; source: 'base_template' | 'starter' }
    | { success: false; error: string }
  >
  duplicatePage: (
    sourceSlug: string,
    newTitle: string
  ) => Promise<{ success: true; page: SitePageSummary } | { success: false; error: string }>
  deletePage: (slug: string) => Promise<void>
  updatePageMeta: (slug: string, input: { title?: string; description?: string }) => Promise<void>
  refreshPages: () => Promise<void>

  /** Replace current page draft with blocks from another page (paste-blocks-to-page). */
  pasteBlocksFromPage: (sourceSlug: string) => Promise<void>
  restoreVersionToDraft: (blocks: Block[], savedAt: string) => void
  setVersions: (versions: PublishedVersionSummary[]) => void
  resetToStarter: () => void
  resetToEmpty: () => void
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

type BuilderProviderProps = {
  tenantSlug: string
  tenantLocation?: TenantLocation | null
  builderScope?: BuilderScope
  libraryTemplateId?: string | null
  initialPageSlug: string
  initialPages: SitePageSummary[]
  initialDraftBlocks: Block[] | null
  initialPublishedBlocks: Block[]
  initialPageTitle: string
  initialSavedAt: string | null
  initialPublishedAt: string | null
  initialDraftSiteStyles: SiteStyles | null
  initialPublishedSiteStyles: SiteStyles | null
  initialVersions: PublishedVersionSummary[]
  children: ReactNode
}

function loadBlocksFromLocalStorage(tenantSlug: string, pageSlug: string): Block[] | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(getStorageKey(tenantSlug, pageSlug))

    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as Block[]

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch {
    return null
  }

  return null
}

export function BuilderProvider({
  tenantSlug,
  tenantLocation = null,
  builderScope = 'organization',
  libraryTemplateId = null,
  initialPageSlug,
  initialPages,
  initialDraftBlocks,
  initialPublishedBlocks,
  initialPageTitle,
  initialSavedAt,
  initialPublishedAt,
  initialDraftSiteStyles,
  initialPublishedSiteStyles,
  initialVersions,
  children
}: BuilderProviderProps) {
  const [state, dispatch] = useReducer(builderReducer, {
    blocks: [],
    publishedBlocks: initialPublishedBlocks,
    // Prefer draft, then published — and recover from a white Plain draft when live is themed.
    siteStyles: resolveBuilderCanvasStyles(initialDraftSiteStyles, initialPublishedSiteStyles),
    publishedSiteStyles: mergeSiteStyles(
      initialPublishedSiteStyles ?? initialDraftSiteStyles ?? {},
      DEFAULT_SITE_STYLES
    ),
    selectedBlockId: null,
    selectedNestedItemId: null,
    selectedRegion: null,
    mode: 'edit',
    viewport: 'desktop',
    showGrid: readBuilderGridMode(),
    autosaveEnabled: readBuilderAutosave(),
    sidebarPanel: 'blocks',
    currentPageSlug: initialPageSlug,
    currentPageTitle: initialPageTitle,
    pages: initialPages,
    isPageSwitching: false,
    isDirty: false,
    isSaving: false,
    isPublishing: false,
    isLoading: true,
    lastSavedAt: initialSavedAt,
    lastPublishedAt: initialPublishedAt,
    saveError: null,
    publishError: null,
    versions: initialVersions
  })

  const blocksRef = useRef(state.blocks)
  const siteStylesRef = useRef(state.siteStyles)
  const publishedSiteStylesRef = useRef(state.publishedSiteStyles)
  const currentPageSlugRef = useRef(state.currentPageSlug)
  const isDirtyRef = useRef(state.isDirty)
  const selectedBlockIdRef = useRef(state.selectedBlockId)
  const selectedRegionRef = useRef(state.selectedRegion)

  useEffect(() => {
    selectedBlockIdRef.current = state.selectedBlockId
  }, [state.selectedBlockId])

  useEffect(() => {
    selectedRegionRef.current = state.selectedRegion
  }, [state.selectedRegion])

  useEffect(() => {
    blocksRef.current = state.blocks
  }, [state.blocks])

  useEffect(() => {
    siteStylesRef.current = state.siteStyles
  }, [state.siteStyles])

  useEffect(() => {
    publishedSiteStylesRef.current = state.publishedSiteStyles
  }, [state.publishedSiteStyles])

  useEffect(() => {
    currentPageSlugRef.current = state.currentPageSlug
  }, [state.currentPageSlug])

  useEffect(() => {
    isDirtyRef.current = state.isDirty
  }, [state.isDirty])

  const getDraftSnapshot = useCallback(
    (): BuilderDraftSnapshot => ({
      blocks: blocksRef.current,
      siteStyles: siteStylesRef.current,
      selectedBlockId: selectedBlockIdRef.current
    }),
    []
  )

  const {
    canUndo,
    canRedo,
    recordBeforeChange,
    undo: undoHistory,
    redo: redoHistory,
    clearHistory
  } = useBuilderHistory(getDraftSnapshot)

  /** Blocks + styles as of the last successful save / page load — undo floor for the dirty flag. */
  const cleanDraftRef = useRef<{ blocks: Block[]; siteStyles: SiteStyles } | null>(null)

  const markCleanBaseline = useCallback((blocks: Block[], siteStyles: SiteStyles, resetHistory = false) => {
    cleanDraftRef.current = { blocks, siteStyles }

    if (resetHistory) {
      clearHistory()
    }
  }, [clearHistory])

  const refreshPages = useCallback(async () => {
    const { listSitePagesAction } = await import('@/app/actions/site-page.actions')
    const result = await listSitePagesAction(builderScope, libraryTemplateId ?? undefined)

    if (result.success) {
      dispatch({ type: 'SET_PAGES', pages: result.pages })
    }
  }, [builderScope, libraryTemplateId])

  const persistDraft = useCallback(
    async (
      pageSlug: string,
      blocks: Block[],
      siteStyles: SiteStyles,
      options?: { resetHistory?: boolean }
    ): Promise<boolean> => {
      dispatch({ type: 'SET_SAVING', isSaving: true })

      const stylesChanged = !siteStylesEqual(siteStyles, publishedSiteStylesRef.current)

      const result = await saveSitePageDraftAction(
        pageSlug,
        blocks,
        isHomePageSlug(pageSlug) ? siteStyles : undefined,
        builderScope,
        libraryTemplateId ?? undefined
      )

      if (!result.success) {
        dispatch({ type: 'SET_SAVE_ERROR', error: result.error })

        return false
      }

      if (!isHomePageSlug(pageSlug) && stylesChanged) {
        const homePage = await getSitePageAction('home', builderScope, libraryTemplateId ?? undefined)

        if (homePage.success) {
          await saveSitePageDraftAction(
            'home',
            homePage.page.draftBlocks,
            siteStyles,
            builderScope,
            libraryTemplateId ?? undefined
          )
        }
      }

      dispatch({ type: 'MARK_SAVED', savedAt: result.savedAt })
      // Always move the dirty floor to this save. Manual save also clears undo past this point.
      markCleanBaseline(blocks, siteStyles, options?.resetHistory === true)
      localStorage.removeItem(getStorageKey(tenantSlug, pageSlug))
      void refreshPages()

      return true
    },
    [tenantSlug, refreshPages, builderScope, libraryTemplateId, markCleanBaseline]
  )

  useEffect(() => {
    let cancelled = false

    async function initialize() {
      dispatch({ type: 'SET_LOADING', isLoading: true })

      if (initialDraftBlocks) {
        if (!cancelled) {
          const styles = resolveBuilderCanvasStyles(initialDraftSiteStyles, initialPublishedSiteStyles)

          dispatch({
            type: 'SET_INITIAL',
            blocks: initialDraftBlocks,
            publishedBlocks: initialPublishedBlocks,
            siteStyles: styles,
            publishedSiteStyles: mergeSiteStyles(
              initialPublishedSiteStyles ?? initialDraftSiteStyles ?? {},
              DEFAULT_SITE_STYLES
            ),
            savedAt: initialSavedAt,
            publishedAt: initialPublishedAt,
            versions: initialVersions,
            currentPageSlug: initialPageSlug,
            currentPageTitle: initialPageTitle,
            pages: initialPages
          })
      markCleanBaseline(normalizeBlocks(initialDraftBlocks), styles, true)
        }

        return
      }

      const localBlocks = loadBlocksFromLocalStorage(tenantSlug, initialPageSlug)

      if (localBlocks) {
        if (!cancelled) {
          dispatch({
            type: 'SET_INITIAL',
            blocks: localBlocks,
            publishedBlocks: initialPublishedBlocks,
            savedAt: null,
            publishedAt: initialPublishedAt,
            versions: initialVersions,
            currentPageSlug: initialPageSlug,
            currentPageTitle: initialPageTitle,
            pages: initialPages
          })
          markCleanBaseline(normalizeBlocks(localBlocks), siteStylesRef.current, true)
        }

        const result = await saveSitePageDraftAction(
          initialPageSlug,
          localBlocks,
          isHomePageSlug(initialPageSlug) ? siteStylesRef.current : undefined,
          builderScope,
          libraryTemplateId ?? undefined
        )

        if (!cancelled) {
          if (result.success) {
            dispatch({ type: 'MARK_SAVED', savedAt: result.savedAt })
            markCleanBaseline(normalizeBlocks(localBlocks), siteStylesRef.current, true)
            localStorage.removeItem(getStorageKey(tenantSlug, initialPageSlug))
          } else {
            dispatch({ type: 'SET_SAVE_ERROR', error: result.error })
          }
        }

        return
      }

      if (!cancelled) {
        const starterBlocks = isHomePageSlug(initialPageSlug) ? createStarterBlocks() : []

        dispatch({
          type: 'SET_INITIAL',
          blocks: starterBlocks,
          publishedBlocks: initialPublishedBlocks,
          savedAt: null,
          publishedAt: initialPublishedAt,
          versions: initialVersions,
          currentPageSlug: initialPageSlug,
          currentPageTitle: initialPageTitle,
          pages: initialPages
        })
        markCleanBaseline(normalizeBlocks(starterBlocks), siteStylesRef.current, true)
      }
    }

    void initialize()

    return () => {
      cancelled = true
    }
  }, [
    initialDraftBlocks,
    initialPublishedBlocks,
    initialDraftSiteStyles,
    initialPublishedSiteStyles,
    initialSavedAt,
    initialPublishedAt,
    initialVersions,
    initialPageSlug,
    initialPageTitle,
    initialPages,
    tenantSlug,
    builderScope,
    libraryTemplateId,
    markCleanBaseline
  ])

  const hasUnpublishedChanges = useMemo(() => {
    const currentPageHasChanges =
      !blocksEqual(state.blocks, state.publishedBlocks) || !siteStylesEqual(state.siteStyles, state.publishedSiteStyles)

    const otherPagesHaveChanges = state.pages.some(
      page => page.slug !== state.currentPageSlug && page.hasUnpublishedChanges
    )

    return currentPageHasChanges || otherPagesHaveChanges
  }, [
    state.blocks,
    state.publishedBlocks,
    state.siteStyles,
    state.publishedSiteStyles,
    state.pages,
    state.currentPageSlug
  ])

  const selectedBlock = useMemo(
    () => (state.selectedBlockId ? findBlockInTree(state.blocks, state.selectedBlockId) : null),
    [state.blocks, state.selectedBlockId]
  )

  const addBlock = useCallback(
    (type: BlockType, target?: BlockLocation, paletteId?: string) => {
      const block = createBlock(type, siteStylesRef.current, paletteId, tenantLocation)
      const dropTarget = target ?? resolveDropTarget(blocksRef.current, 'canvas-drop-zone', type)

      recordBeforeChange({ label: `Add ${type}` })
      dispatch({ type: 'ADD_BLOCK', block, target: dropTarget })
      recordPaletteUse(paletteId)

      return block
    },
    [recordBeforeChange, tenantLocation]
  )

  const updateBlock = useCallback(
    (id: string, props: BlockPropsPatch) => {
      recordBeforeChange({ coalesceKey: `block:${id}`, label: 'Edit block' })
      dispatch({ type: 'UPDATE_BLOCK', id, props })
    },
    [recordBeforeChange]
  )

  const deleteBlock = useCallback(
    (id: string) => {
      recordBeforeChange({ label: 'Delete block' })
      dispatch({ type: 'DELETE_BLOCK', id })
    },
    [recordBeforeChange]
  )

  // Block clipboard — persists across page switches (component-level state, not in reducer)
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null)
  const [copiedFormat, setCopiedFormat] = useState<CopiedFormat | null>(null)
  const [formatPaintMode, setFormatPaintMode] = useState<FormatPaintMode>('off')
  const copiedFormatRef = useRef<CopiedFormat | null>(null)
  const formatPaintModeRef = useRef<FormatPaintMode>('off')

  useEffect(() => {
    copiedFormatRef.current = copiedFormat
  }, [copiedFormat])

  useEffect(() => {
    formatPaintModeRef.current = formatPaintMode
  }, [formatPaintMode])

  const copyBlock = useCallback((block: Block) => {
    // Snapshot so later edits to the original do not change the clipboard.
    setCopiedBlock(toPlainJson(block) as Block)
  }, [])

  const pasteBlock = useCallback(
    (afterBlockId?: string) => {
      if (!copiedBlock) return

      const clone = cloneBlockWithNewIds(copiedBlock)
      const anchorId = afterBlockId ?? selectedBlockIdRef.current ?? undefined
      const target = resolvePasteTargetAfterBlock(blocksRef.current, anchorId, clone.type)

      recordBeforeChange({ label: 'Paste block' })
      dispatch({ type: 'ADD_BLOCK', block: clone, target })
    },
    [copiedBlock, recordBeforeChange]
  )

  const copyFormat = useCallback((block: Block) => {
    const region =
      selectedBlockIdRef.current === block.id &&
      (block.type === 'section' || block.type === 'tabs' || block.type === 'carousel')
        ? selectedRegionRef.current
        : null
    const next = copyBlockFormat(block, region)
    copiedFormatRef.current = next
    setCopiedFormat(next)
  }, [])

  const startFormatPaint = useCallback((block: Block, mode: Exclude<FormatPaintMode, 'off'> = 'once') => {
    const region =
      selectedBlockIdRef.current === block.id &&
      (block.type === 'section' || block.type === 'tabs' || block.type === 'carousel')
        ? selectedRegionRef.current
        : null
    const next = copyBlockFormat(block, region)
    copiedFormatRef.current = next
    formatPaintModeRef.current = mode
    setCopiedFormat(next)
    setFormatPaintMode(mode)
  }, [])

  const cancelFormatPaint = useCallback(() => {
    formatPaintModeRef.current = 'off'
    setFormatPaintMode('off')
  }, [])

  const applyCopiedFormat = useCallback(
    (targetId?: string, targetRegion?: FormatPaintRegion | null) => {
      const copied = copiedFormatRef.current
      const id = targetId ?? selectedBlockIdRef.current
      const region = targetRegion !== undefined ? targetRegion : selectedRegionRef.current

      if (!copied || !id) {
        return false
      }

      const target = findBlockInTree(blocksRef.current, id)

      if (!target) {
        if (formatPaintModeRef.current === 'once') {
          formatPaintModeRef.current = 'off'
          setFormatPaintMode('off')
        }

        return false
      }

      const panelRegion =
        region && (copied.region || target.type === 'section' || target.type === 'tabs' || target.type === 'carousel')
          ? region
          : null
      const patches = collectFormatPaintPatches(copied, target, panelRegion)

      if (patches.length === 0) {
        return false
      }

      recordBeforeChange({ label: 'Apply format' })
      dispatch({ type: 'UPDATE_BLOCKS', patches })

      if (formatPaintModeRef.current === 'once') {
        formatPaintModeRef.current = 'off'
        setFormatPaintMode('off')
      }

      return true
    },
    [recordBeforeChange]
  )

  const moveBlockAction = useCallback(
    (activeId: string, overId: string | number, nestHints?: NestTargetHints) => {
      recordBeforeChange({ coalesceKey: `move:${activeId}`, label: 'Move block' })
      dispatch({ type: 'MOVE_BLOCK', activeId, overId, nestHints })
    },
    [recordBeforeChange]
  )

  const selectBlock = useCallback(
    (id: string | null, options?: { region?: FormatPaintRegion | null }) => {
      const region = options?.region ?? null
      selectedRegionRef.current = id ? region : null
      dispatch({ type: 'SELECT_BLOCK', id, region })

      if (!id) {
        if (formatPaintModeRef.current !== 'off') {
          formatPaintModeRef.current = 'off'
          setFormatPaintMode('off')
        }

        return
      }

      const copied = copiedFormatRef.current

      if (formatPaintModeRef.current === 'off' || !copied) {
        return
      }

      const sameControl = copied.sourceId === id
      const samePanel = Boolean(copied.region && region && formatPaintRegionsEqual(copied.region, region))

      if (sameControl && (!copied.region || samePanel)) {
        return
      }

      applyCopiedFormat(id, region)
    },
    [applyCopiedFormat]
  )

  const selectNestedItem = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_NESTED_ITEM', id })
  }, [])

  const setMode = useCallback(
    (mode: BuilderMode) => {
      if (mode !== 'edit' && formatPaintModeRef.current !== 'off') {
        formatPaintModeRef.current = 'off'
        setFormatPaintMode('off')
      }

      dispatch({ type: 'SET_MODE', mode })
    },
    []
  )

  const setViewport = useCallback((viewport: BuilderViewport) => {
    dispatch({ type: 'SET_VIEWPORT', viewport })
  }, [])

  const setShowGrid = useCallback((showGrid: boolean) => {
    dispatch({ type: 'SET_SHOW_GRID', showGrid })

    if (typeof window !== 'undefined') {
      localStorage.setItem(BUILDER_GRID_MODE_KEY, String(showGrid))
    }
  }, [])

  const setAutosaveEnabled = useCallback((autosaveEnabled: boolean) => {
    dispatch({ type: 'SET_AUTOSAVE', autosaveEnabled })

    if (typeof window !== 'undefined') {
      localStorage.setItem(BUILDER_AUTOSAVE_KEY, String(autosaveEnabled))
    }
  }, [])

  const setSidebarPanel = useCallback((panel: BuilderSidebarPanel) => {
    dispatch({ type: 'SET_SIDEBAR_PANEL', panel })
  }, [])

  const updateSiteStyles = useCallback(
    (partial: Partial<SiteStyles>) => {
      recordBeforeChange({ coalesceKey: 'site-styles', label: 'Update styles' })
      dispatch({ type: 'UPDATE_SITE_STYLES', siteStyles: mergeSiteStyles(partial, siteStylesRef.current) })
    },
    [recordBeforeChange]
  )

  const applyThemePreset = useCallback(
    (themeId: string, restyleControls?: AiBuilderRestyleScope) => {
      recordBeforeChange({ label: 'Apply theme' })
      dispatch({ type: 'APPLY_THEME', themeId, restyleControls })
    },
    [recordBeforeChange]
  )

  const applyAiPlan = useCallback(
    (plan: AiBuilderPlan, refToId: Record<string, string>) => {
      const result = applyAiBuilderPlan({
        blocks: blocksRef.current,
        siteStyles: siteStylesRef.current,
        selectedBlockId: selectedBlockIdRef.current,
        plan,
        refToId,
        tenantLocation
      })

      if (result.changes.length > 0) {
        recordBeforeChange({ label: 'AI plan' })
        dispatch({
          type: 'APPLY_AI_RESULT',
          blocks: result.blocks,
          siteStyles: result.siteStyles,
          selectedBlockId: result.selectedBlockId
        })
      }

      return result
    },
    [recordBeforeChange, tenantLocation]
  )

  const applyAiDesign = useCallback(
    (input: { blocks: Block[]; siteStyles: SiteStyles | null; targetBlockId: string | null }) => {
      const incoming = normalizeBlocks(input.blocks)

      if (input.targetBlockId) {
        const replacement = incoming[0]

        if (!replacement || !findBlockInTree(blocksRef.current, input.targetBlockId)) {
          return false
        }

        recordBeforeChange({ label: 'AI design' })
        dispatch({
          type: 'APPLY_AI_RESULT',
          blocks: updateBlockInTree(blocksRef.current, input.targetBlockId, replacement.props),
          siteStyles: siteStylesRef.current,
          selectedBlockId: input.targetBlockId
        })

        return true
      }

      if (!incoming.length) {
        return false
      }

      recordBeforeChange({ label: 'AI design' })
      dispatch({
        type: 'APPLY_AI_RESULT',
        blocks: incoming,
        siteStyles: input.siteStyles ?? siteStylesRef.current,
        selectedBlockId: null
      })

      return true
    },
    [recordBeforeChange]
  )

  const applyDraftSnapshot = useCallback((snapshot: BuilderDraftSnapshot) => {
    const clean = cleanDraftRef.current
    const matchesClean =
      clean != null &&
      blocksEqual(snapshot.blocks, clean.blocks) &&
      siteStylesEqual(snapshot.siteStyles, clean.siteStyles)

    dispatch({ type: 'RESTORE_DRAFT', snapshot, isDirty: !matchesClean })

    return { hitFloor: matchesClean }
  }, [])

  const restoreDraft = useCallback(
    (snapshot: BuilderDraftSnapshot) => {
      applyDraftSnapshot(snapshot)
    },
    [applyDraftSnapshot]
  )

  const undo = useCallback(() => undoHistory(applyDraftSnapshot), [applyDraftSnapshot, undoHistory])
  const redo = useCallback(() => {
    return redoHistory(snapshot => {
      applyDraftSnapshot(snapshot)
    })
  }, [applyDraftSnapshot, redoHistory])

  const savePage = useCallback(async () => {
    await persistDraft(currentPageSlugRef.current, blocksRef.current, siteStylesRef.current, {
      resetHistory: true
    })
  }, [persistDraft])

  const publishPage = useCallback(async () => {
    dispatch({ type: 'SET_PUBLISHING', isPublishing: true })
    dispatch({ type: 'SET_PUBLISH_ERROR', error: null })

    const pageSlug = currentPageSlugRef.current
    const blocks = blocksRef.current
    const siteStyles = siteStylesRef.current
    const pageSlugs = state.pages.map(page => page.slug)

    const saved = await persistDraft(pageSlug, blocks, siteStyles)

    if (!saved) {
      dispatch({ type: 'SET_PUBLISHING', isPublishing: false })

      return
    }

    const result = await publishAllSitePagesAction(builderScope, libraryTemplateId ?? undefined)

    if (!result.success) {
      dispatch({ type: 'SET_PUBLISH_ERROR', error: result.error })

      return
    }

    const versionsResult = await listSitePageVersionsAction(pageSlug, builderScope, libraryTemplateId ?? undefined)
    const versions = versionsResult.success ? versionsResult.versions : result.versions

    dispatch({
      type: 'MARK_PUBLISHED',
      publishedAt: result.publishedAt,
      publishedBlocks: blocks,
      publishedSiteStyles: siteStyles,
      versions
    })

    for (const slug of pageSlugs) {
      localStorage.removeItem(getStorageKey(tenantSlug, slug))
    }

    void refreshPages()
  }, [persistDraft, tenantSlug, refreshPages, state.pages, builderScope, libraryTemplateId])

  const switchPage = useCallback(
    async (slug: string) => {
      if (slug === currentPageSlugRef.current) {
        return
      }

      dispatch({ type: 'SET_PAGE_SWITCHING', isPageSwitching: true })

      if (isDirtyRef.current) {
        await persistDraft(currentPageSlugRef.current, blocksRef.current, siteStylesRef.current)
      }

      const result = await getSitePageAction(slug, builderScope, libraryTemplateId ?? undefined)

      if (!result.success) {
        dispatch({ type: 'SET_PAGE_SWITCHING', isPageSwitching: false })
        dispatch({ type: 'SET_SAVE_ERROR', error: result.error })

        return
      }

      const versionsResult = await listSitePageVersionsAction(slug, builderScope, libraryTemplateId ?? undefined)
      const versions = versionsResult.success ? versionsResult.versions : []

      const nextBlocks = normalizeBlocks(toPlainJson(result.page.draftBlocks) as Block[])

      dispatch({
        type: 'SWITCH_PAGE',
        slug: result.page.slug,
        title: result.page.title,
        blocks: nextBlocks,
        publishedBlocks: toPlainJson(result.page.publishedBlocks) as Block[],
        savedAt: result.page.draftUpdatedAt,
        publishedAt: result.page.publishedAt,
        versions
      })
      markCleanBaseline(nextBlocks, siteStylesRef.current, true)
      cancelFormatPaint()

      void refreshPages()
    },
    [cancelFormatPaint, markCleanBaseline, persistDraft, refreshPages, builderScope, libraryTemplateId]
  )

  const createPage = useCallback(
    async (title: string, options?: { slug?: string }) => {
      const result = await createSitePageAction({ title, ...options }, builderScope, libraryTemplateId ?? undefined)

      if (result.success) {
        void refreshPages()
      }

      return result
    },
    [refreshPages, builderScope, libraryTemplateId]
  )

  const addBasePageFromTemplate = useCallback(
    async (slug: string) => {
      // Persist the open page first so nav updates from the server do not fight a dirty draft.
      await persistDraft(currentPageSlugRef.current, blocksRef.current, siteStylesRef.current)

      const result = await addBasePageFromTemplateAction(slug, siteStylesRef.current, builderScope)

      if (!result.success) {
        return result
      }

      // Patch local nav before switchPage re-saves, so we do not wipe the server nav stitch.
      const link = {
        label: result.page.title || titleForBasePageSlug(result.page.slug),
        href: result.page.slug
      }
      const patched = ensureNavLinksOnBlocks(blocksRef.current, [link])

      dispatch({ type: 'SET_BLOCKS', blocks: patched })
      blocksRef.current = patched

      await refreshPages()
      await switchPage(result.page.slug)

      return result
    },
    [persistDraft, refreshPages, switchPage, builderScope]
  )

  const duplicatePage = useCallback(
    async (sourceSlug: string, newTitle: string) => {
      const result = await duplicateSitePageAction(sourceSlug, newTitle, builderScope, libraryTemplateId ?? undefined)

      if (result.success) {
        void refreshPages()
      }

      return result
    },
    [refreshPages, builderScope, libraryTemplateId]
  )

  const pasteBlocksFromPage = useCallback(
    async (sourceSlug: string) => {
      const result = await getSitePageAction(sourceSlug, builderScope, libraryTemplateId ?? undefined)

      if (!result.success) {
        return
      }

      const sourceBlocks = normalizeBlocks(toPlainJson(result.page.draftBlocks) as Block[])

      recordBeforeChange({ label: 'Paste page content' })
      dispatch({ type: 'SET_BLOCKS', blocks: sourceBlocks, savedAt: state.lastSavedAt ?? new Date().toISOString() })
    },
    [recordBeforeChange, state.lastSavedAt, builderScope, libraryTemplateId]
  )

  const deletePage = useCallback(
    async (slug: string) => {
      const result = await deleteSitePageAction(slug, builderScope, libraryTemplateId ?? undefined)

      if (!result.success) {
        dispatch({ type: 'SET_SAVE_ERROR', error: result.error })

        return
      }

      if (slug === currentPageSlugRef.current) {
        await switchPage('home')
      }

      void refreshPages()
    },
    [switchPage, refreshPages, builderScope, libraryTemplateId]
  )

  const updatePageMeta = useCallback(
    async (slug: string, input: { title?: string; description?: string }) => {
      const result = await updateSitePageMetaAction(slug, input, builderScope, libraryTemplateId ?? undefined)

      if (result.success) {
        if (slug === currentPageSlugRef.current && input.title) {
          dispatch({
            type: 'SWITCH_PAGE',
            slug,
            title: result.page.title,
            blocks: blocksRef.current,
            publishedBlocks: state.publishedBlocks,
            savedAt: state.lastSavedAt,
            publishedAt: state.lastPublishedAt,
            versions: state.versions
          })
        }

        void refreshPages()
      } else {
        dispatch({ type: 'SET_SAVE_ERROR', error: result.error })
      }
    },
    [
      refreshPages,
      state.lastPublishedAt,
      state.lastSavedAt,
      state.publishedBlocks,
      state.versions,
      builderScope,
      libraryTemplateId
    ]
  )

  const restoreVersionToDraft = useCallback(
    (blocks: Block[], savedAt: string) => {
      recordBeforeChange({ label: 'Restore published version' })
      dispatch({ type: 'SET_BLOCKS', blocks: toPlainJson(blocks), savedAt })
    },
    [recordBeforeChange]
  )

  const setVersions = useCallback((versions: PublishedVersionSummary[]) => {
    dispatch({ type: 'SET_VERSIONS', versions })
  }, [])

  const resetToStarter = useCallback(() => {
    recordBeforeChange({ label: 'Reset to starter' })
    dispatch({ type: 'RESET_TO_STARTER' })
  }, [recordBeforeChange])

  const resetToEmpty = useCallback(() => {
    recordBeforeChange({ label: 'Clear page' })
    dispatch({ type: 'RESET_TO_EMPTY' })
  }, [recordBeforeChange])

  useEffect(() => {
    if (
      !state.autosaveEnabled ||
      !state.isDirty ||
      state.isLoading ||
      state.isPageSwitching ||
      state.isSaving ||
      state.isPublishing
    ) {
      return
    }

    const timer = setTimeout(() => {
      void persistDraft(state.currentPageSlug, state.blocks, state.siteStyles)
    }, 1500)

    return () => clearTimeout(timer)
  }, [
    state.autosaveEnabled,
    state.blocks,
    state.siteStyles,
    state.isDirty,
    state.isLoading,
    state.isPageSwitching,
    state.isSaving,
    state.isPublishing,
    state.currentPageSlug,
    persistDraft
  ])

  const value = useMemo<BuilderContextValue>(
    () => ({
      ...state,
      tenantSlug,
      tenantLocation,
      builderScope,
      libraryTemplateId,
      hasUnpublishedChanges,
      selectedBlock,
      addBlock,
      updateBlock,
      deleteBlock,
      copiedBlock,
      copyBlock,
      pasteBlock,
      copiedFormat,
      formatPaintMode,
      copyFormat,
      startFormatPaint,
      applyCopiedFormat,
      cancelFormatPaint,
      moveBlock: moveBlockAction,
      selectBlock,
      selectNestedItem,
      setMode,
      setViewport,
      setShowGrid,
      setAutosaveEnabled,
      setSidebarPanel,
      updateSiteStyles,
      applyThemePreset,
      applyAiPlan,
      applyAiDesign,
      restoreDraft,
      canUndo,
      canRedo,
      undo,
      redo,
      savePage,
      publishPage,
      switchPage,
      createPage,
      addBasePageFromTemplate,
      duplicatePage,
      deletePage,
      updatePageMeta,
      refreshPages,
      pasteBlocksFromPage,
      restoreVersionToDraft,
      setVersions,
      resetToStarter,
      resetToEmpty
    }),
    [
      state,
      tenantSlug,
      tenantLocation,
      builderScope,
      libraryTemplateId,
      hasUnpublishedChanges,
      selectedBlock,
      addBlock,
      updateBlock,
      deleteBlock,
      copiedBlock,
      copyBlock,
      pasteBlock,
      copiedFormat,
      formatPaintMode,
      copyFormat,
      startFormatPaint,
      applyCopiedFormat,
      cancelFormatPaint,
      moveBlockAction,
      selectBlock,
      selectNestedItem,
      setMode,
      setViewport,
      setShowGrid,
      setAutosaveEnabled,
      setSidebarPanel,
      updateSiteStyles,
      applyThemePreset,
      applyAiPlan,
      applyAiDesign,
      restoreDraft,
      canUndo,
      canRedo,
      undo,
      redo,
      savePage,
      publishPage,
      switchPage,
      createPage,
      addBasePageFromTemplate,
      duplicatePage,
      deletePage,
      updatePageMeta,
      refreshPages,
      pasteBlocksFromPage,
      restoreVersionToDraft,
      setVersions,
      resetToStarter,
      resetToEmpty
    ]
  )

  return <BuilderContext.Provider value={value}>{children}</BuilderContext.Provider>
}

export function useBuilder() {
  const context = useContext(BuilderContext)

  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider')
  }

  return context
}

export function useBuilderOptional() {
  return useContext(BuilderContext)
}
