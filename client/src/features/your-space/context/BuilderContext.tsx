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
import type { Block, BlockType, BuilderMode, BuilderSidebarPanel, BuilderViewport } from '../types'
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
  updateBlockInTree,
  type BlockLocation,
  type NestTargetHints
} from '../utils/blockTreeUtils'
import { mergeSiteStyles } from '../utils/siteStylesHelpers'
import {
  BUILDER_AUTOSAVE_KEY,
  BUILDER_GRID_MODE_KEY,
  readBuilderAutosave,
  readBuilderGridMode
} from '../utils/builderContainerChrome'
import { siteStylesEqual } from '../utils/siteStylesEqual'
import { recordPaletteUse } from '../utils/paletteUsage'
import type { TenantLocation } from '@/lib/location/types'

type BuilderState = {
  blocks: Block[]
  publishedBlocks: Block[]
  siteStyles: SiteStyles
  publishedSiteStyles: SiteStyles
  selectedBlockId: string | null
  selectedNestedItemId: string | null
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
  | { type: 'UPDATE_BLOCK'; id: string; props: Partial<Block['props']> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'MOVE_BLOCK'; activeId: string; overId: string | number; nestHints?: NestTargetHints }
  | { type: 'SELECT_BLOCK'; id: string | null }
  | { type: 'SELECT_NESTED_ITEM'; id: string | null }
  | { type: 'SET_MODE'; mode: BuilderMode }
  | { type: 'SET_VIEWPORT'; viewport: BuilderViewport }
  | { type: 'SET_SHOW_GRID'; showGrid: boolean }
  | { type: 'SET_AUTOSAVE'; autosaveEnabled: boolean }
  | { type: 'SET_SIDEBAR_PANEL'; panel: BuilderSidebarPanel }
  | { type: 'UPDATE_SITE_STYLES'; siteStyles: SiteStyles }
  | { type: 'APPLY_THEME'; themeId: string }
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
    case 'DELETE_BLOCK':
      return {
        ...state,
        blocks: deleteBlockFromTree(state.blocks, action.id),
        selectedBlockId: state.selectedBlockId === action.id ? null : state.selectedBlockId,
        selectedNestedItemId: state.selectedBlockId === action.id ? null : state.selectedNestedItemId,
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
        selectedNestedItemId: action.id && action.id === state.selectedBlockId ? state.selectedNestedItemId : null
      }
    case 'SELECT_NESTED_ITEM':
      return { ...state, selectedNestedItemId: action.id }
    case 'SET_MODE':
      return {
        ...state,
        mode: action.mode,
        selectedBlockId: action.mode === 'preview' ? null : state.selectedBlockId,
        selectedNestedItemId: action.mode === 'preview' ? null : state.selectedNestedItemId
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

      return { ...state, siteStyles: preset.styles, isDirty: true, saveError: null, publishError: null }
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
  updateBlock: (id: string, props: Partial<Block['props']>) => void
  deleteBlock: (id: string) => void
  /** The block currently held in the copy clipboard (null if empty). */
  copiedBlock: Block | null
  /** Copy a block to the clipboard. */
  copyBlock: (block: Block) => void
  /** Paste the clipboard block after a given block id (root-level). Clears clipboard after paste. */
  pasteBlock: (afterBlockId?: string) => void
  moveBlock: (activeId: string, overId: string | number, nestHints?: NestTargetHints) => void
  selectBlock: (id: string | null) => void
  selectNestedItem: (id: string | null) => void
  setMode: (mode: BuilderMode) => void
  setViewport: (viewport: BuilderViewport) => void
  setShowGrid: (showGrid: boolean) => void
  setAutosaveEnabled: (enabled: boolean) => void
  setSidebarPanel: (panel: BuilderSidebarPanel) => void
  updateSiteStyles: (partial: Partial<SiteStyles>) => void
  applyThemePreset: (themeId: string) => void
  savePage: () => Promise<void>
  publishPage: () => Promise<void>
  switchPage: (slug: string) => Promise<void>
  createPage: (
    title: string,
    options?: { slug?: string }
  ) => Promise<{ success: true; page: SitePageSummary } | { success: false; error: string }>
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
    siteStyles: mergeSiteStyles(initialDraftSiteStyles ?? {}, DEFAULT_SITE_STYLES),
    publishedSiteStyles: mergeSiteStyles(
      initialPublishedSiteStyles ?? initialDraftSiteStyles ?? {},
      DEFAULT_SITE_STYLES
    ),
    selectedBlockId: null,
    selectedNestedItemId: null,
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

  const refreshPages = useCallback(async () => {
    const { listSitePagesAction } = await import('@/app/actions/site-page.actions')
    const result = await listSitePagesAction(builderScope, libraryTemplateId ?? undefined)

    if (result.success) {
      dispatch({ type: 'SET_PAGES', pages: result.pages })
    }
  }, [builderScope, libraryTemplateId])

  const persistDraft = useCallback(
    async (pageSlug: string, blocks: Block[], siteStyles: SiteStyles): Promise<boolean> => {
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
      localStorage.removeItem(getStorageKey(tenantSlug, pageSlug))
      void refreshPages()

      return true
    },
    [tenantSlug, refreshPages, builderScope, libraryTemplateId]
  )

  useEffect(() => {
    let cancelled = false

    async function initialize() {
      dispatch({ type: 'SET_LOADING', isLoading: true })

      if (initialDraftBlocks) {
        if (!cancelled) {
          dispatch({
            type: 'SET_INITIAL',
            blocks: initialDraftBlocks,
            publishedBlocks: initialPublishedBlocks,
            siteStyles: mergeSiteStyles(initialDraftSiteStyles ?? {}, DEFAULT_SITE_STYLES),
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
    libraryTemplateId
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

      dispatch({ type: 'ADD_BLOCK', block, target: dropTarget })
      recordPaletteUse(paletteId)

      return block
    },
    [tenantLocation]
  )

  const updateBlock = useCallback((id: string, props: Partial<Block['props']>) => {
    dispatch({ type: 'UPDATE_BLOCK', id, props })
  }, [])

  const deleteBlock = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BLOCK', id })
  }, [])

  // Block clipboard — persists across page switches (component-level state, not in reducer)
  const [copiedBlock, setCopiedBlock] = useState<Block | null>(null)

  const copyBlock = useCallback((block: Block) => {
    setCopiedBlock(block)
  }, [])

  const pasteBlock = useCallback(
    (afterBlockId?: string) => {
      if (!copiedBlock) return

      const clone = cloneBlockWithNewIds(copiedBlock)

      // Find root-level index to insert after; fall back to end
      let index = blocksRef.current.length

      if (afterBlockId) {
        const rootIndex = blocksRef.current.findIndex(b => b.id === afterBlockId)

        if (rootIndex !== -1) {
          index = rootIndex + 1
        }
      }

      dispatch({ type: 'ADD_BLOCK', block: clone, target: { container: 'root', index } })
    },
    [copiedBlock]
  )

  const moveBlockAction = useCallback((activeId: string, overId: string | number, nestHints?: NestTargetHints) => {
    dispatch({ type: 'MOVE_BLOCK', activeId, overId, nestHints })
  }, [])

  const selectBlock = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_BLOCK', id })
  }, [])

  const selectNestedItem = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_NESTED_ITEM', id })
  }, [])

  const setMode = useCallback((mode: BuilderMode) => {
    dispatch({ type: 'SET_MODE', mode })
  }, [])

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

  const updateSiteStyles = useCallback((partial: Partial<SiteStyles>) => {
    dispatch({ type: 'UPDATE_SITE_STYLES', siteStyles: mergeSiteStyles(partial, siteStylesRef.current) })
  }, [])

  const applyThemePreset = useCallback((themeId: string) => {
    dispatch({ type: 'APPLY_THEME', themeId })
  }, [])

  const savePage = useCallback(async () => {
    await persistDraft(currentPageSlugRef.current, blocksRef.current, siteStylesRef.current)
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

      dispatch({
        type: 'SWITCH_PAGE',
        slug: result.page.slug,
        title: result.page.title,
        blocks: toPlainJson(result.page.draftBlocks) as Block[],
        publishedBlocks: toPlainJson(result.page.publishedBlocks) as Block[],
        savedAt: result.page.draftUpdatedAt,
        publishedAt: result.page.publishedAt,
        versions
      })

      void refreshPages()
    },
    [persistDraft, refreshPages, builderScope, libraryTemplateId]
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

      dispatch({ type: 'SET_BLOCKS', blocks: sourceBlocks, savedAt: state.lastSavedAt ?? new Date().toISOString() })
    },
    [state.lastSavedAt, builderScope, libraryTemplateId]
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

  const restoreVersionToDraft = useCallback((blocks: Block[], savedAt: string) => {
    dispatch({ type: 'SET_BLOCKS', blocks: toPlainJson(blocks), savedAt })
  }, [])

  const setVersions = useCallback((versions: PublishedVersionSummary[]) => {
    dispatch({ type: 'SET_VERSIONS', versions })
  }, [])

  const resetToStarter = useCallback(() => {
    dispatch({ type: 'RESET_TO_STARTER' })
  }, [])

  const resetToEmpty = useCallback(() => {
    dispatch({ type: 'RESET_TO_EMPTY' })
  }, [])

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
      savePage,
      publishPage,
      switchPage,
      createPage,
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
      savePage,
      publishPage,
      switchPage,
      createPage,
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
