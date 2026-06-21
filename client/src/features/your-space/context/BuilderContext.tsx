'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'

import {
  publishSitePageAction,
  saveSitePageDraftAction
} from '@/app/actions/site-page.actions'
import type { PublishedVersionSummary } from '@/models/site-page'
import { toPlainJson } from '@/lib/utils/plain-json'

import { createStarterBlocks, getStorageKey } from '../constants'
import { DEFAULT_SITE_STYLES, SITE_THEME_PRESETS } from '../constants/siteStylePresets'
import type { Block, BlockType, BuilderMode, BuilderSidebarPanel, BuilderViewport } from '../types'
import type { SiteStyles } from '../types/siteStyles'
import { blocksEqual } from '../utils/blocksEqual'
import { normalizeBlocks } from '../utils/blockMigration'
import { createBlock } from '../utils/blockFactory'
import {
  addBlockToTree,
  deleteBlockFromTree,
  findBlockInTree,
  moveBlockInTree,
  resolveDropTarget,
  updateBlockInTree,
  type BlockLocation
} from '../utils/blockTreeUtils'
import { mergeSiteStyles } from '../utils/siteStylesHelpers'
import { siteStylesEqual } from '../utils/siteStylesEqual'

type BuilderState = {
  blocks: Block[]
  publishedBlocks: Block[]
  siteStyles: SiteStyles
  publishedSiteStyles: SiteStyles
  selectedBlockId: string | null
  mode: BuilderMode
  viewport: BuilderViewport
  sidebarPanel: BuilderSidebarPanel
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
    }
  | { type: 'SET_BLOCKS'; blocks: Block[]; savedAt?: string | null }
  | { type: 'ADD_BLOCK'; block: Block; target: BlockLocation }
  | { type: 'UPDATE_BLOCK'; id: string; props: Partial<Block['props']> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'MOVE_BLOCK'; activeId: string; overId: string | number }
  | { type: 'SELECT_BLOCK'; id: string | null }
  | { type: 'SET_MODE'; mode: BuilderMode }
  | { type: 'SET_VIEWPORT'; viewport: BuilderViewport }
  | { type: 'SET_SIDEBAR_PANEL'; panel: BuilderSidebarPanel }
  | { type: 'UPDATE_SITE_STYLES'; siteStyles: SiteStyles }
  | { type: 'APPLY_THEME'; themeId: string }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_PUBLISHING'; isPublishing: boolean }
  | { type: 'MARK_SAVED'; savedAt: string }
  | { type: 'MARK_PUBLISHED'; publishedAt: string; publishedBlocks: Block[]; publishedSiteStyles: SiteStyles; versions: PublishedVersionSummary[] }
  | { type: 'SET_SAVE_ERROR'; error: string | null }
  | { type: 'SET_PUBLISH_ERROR'; error: string | null }
  | { type: 'SET_VERSIONS'; versions: PublishedVersionSummary[] }
  | { type: 'RESET_TO_STARTER' }

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
        isDirty: true,
        saveError: null,
        publishError: null
      }
    case 'MOVE_BLOCK':
      return {
        ...state,
        blocks: moveBlockInTree(state.blocks, action.activeId, action.overId),
        isDirty: true,
        saveError: null,
        publishError: null
      }
    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.id }
    case 'SET_MODE':
      return { ...state, mode: action.mode, selectedBlockId: action.mode === 'preview' ? null : state.selectedBlockId }
    case 'SET_VIEWPORT':
      return { ...state, viewport: action.viewport }
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
        publishError: null
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
  selectedBlock: Block | null
  hasUnpublishedChanges: boolean
  addBlock: (type: BlockType, target?: BlockLocation, paletteId?: string) => Block
  updateBlock: (id: string, props: Partial<Block['props']>) => void
  deleteBlock: (id: string) => void
  moveBlock: (activeId: string, overId: string | number) => void
  selectBlock: (id: string | null) => void
  setMode: (mode: BuilderMode) => void
  setViewport: (viewport: BuilderViewport) => void
  setSidebarPanel: (panel: BuilderSidebarPanel) => void
  updateSiteStyles: (partial: Partial<SiteStyles>) => void
  applyThemePreset: (themeId: string) => void
  savePage: () => Promise<void>
  publishPage: () => Promise<void>
  restoreVersionToDraft: (blocks: Block[], savedAt: string) => void
  setVersions: (versions: PublishedVersionSummary[]) => void
  resetToStarter: () => void
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

type BuilderProviderProps = {
  tenantSlug: string
  initialDraftBlocks: Block[] | null
  initialPublishedBlocks: Block[]
  initialSavedAt: string | null
  initialPublishedAt: string | null
  initialDraftSiteStyles: SiteStyles | null
  initialPublishedSiteStyles: SiteStyles | null
  initialVersions: PublishedVersionSummary[]
  children: ReactNode
}

function loadBlocksFromLocalStorage(tenantSlug: string): Block[] | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(getStorageKey(tenantSlug))

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
  initialDraftBlocks,
  initialPublishedBlocks,
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
    mode: 'edit',
    viewport: 'desktop',
    sidebarPanel: 'blocks',
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

  useEffect(() => {
    blocksRef.current = state.blocks
  }, [state.blocks])

  useEffect(() => {
    siteStylesRef.current = state.siteStyles
  }, [state.siteStyles])

  const persistDraft = useCallback(async (blocks: Block[], siteStyles: SiteStyles) => {
    dispatch({ type: 'SET_SAVING', isSaving: true })

    const result = await saveSitePageDraftAction(blocks, siteStyles)

    if (result.success) {
      dispatch({ type: 'MARK_SAVED', savedAt: result.savedAt })
      localStorage.removeItem(getStorageKey(tenantSlug))
    } else {
      dispatch({ type: 'SET_SAVE_ERROR', error: result.error })
    }
  }, [tenantSlug])

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
            versions: initialVersions
          })
        }

        return
      }

      const localBlocks = loadBlocksFromLocalStorage(tenantSlug)

      if (localBlocks) {
        if (!cancelled) {
          dispatch({
            type: 'SET_INITIAL',
            blocks: localBlocks,
            publishedBlocks: initialPublishedBlocks,
            savedAt: null,
            publishedAt: initialPublishedAt,
            versions: initialVersions
          })
        }

        const result = await saveSitePageDraftAction(localBlocks, siteStylesRef.current)

        if (!cancelled) {
          if (result.success) {
            dispatch({ type: 'MARK_SAVED', savedAt: result.savedAt })
            localStorage.removeItem(getStorageKey(tenantSlug))
          } else {
            dispatch({ type: 'SET_SAVE_ERROR', error: result.error })
          }
        }

        return
      }

      if (!cancelled) {
        dispatch({
          type: 'SET_INITIAL',
          blocks: createStarterBlocks(),
          publishedBlocks: initialPublishedBlocks,
          savedAt: null,
          publishedAt: initialPublishedAt,
          versions: initialVersions
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
    tenantSlug
  ])

  const hasUnpublishedChanges = useMemo(
    () =>
      !blocksEqual(state.blocks, state.publishedBlocks) ||
      !siteStylesEqual(state.siteStyles, state.publishedSiteStyles),
    [state.blocks, state.publishedBlocks, state.siteStyles, state.publishedSiteStyles]
  )

  const selectedBlock = useMemo(
    () => (state.selectedBlockId ? findBlockInTree(state.blocks, state.selectedBlockId) : null),
    [state.blocks, state.selectedBlockId]
  )

  const addBlock = useCallback((type: BlockType, target?: BlockLocation, paletteId?: string) => {
    const block = createBlock(type, siteStylesRef.current, paletteId)
    const dropTarget = target ?? resolveDropTarget(blocksRef.current, 'canvas-drop-zone', type)

    dispatch({ type: 'ADD_BLOCK', block, target: dropTarget })

    return block
  }, [])

  const updateBlock = useCallback((id: string, props: Partial<Block['props']>) => {
    dispatch({ type: 'UPDATE_BLOCK', id, props })
  }, [])

  const deleteBlock = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BLOCK', id })
  }, [])

  const moveBlockAction = useCallback((activeId: string, overId: string | number) => {
    dispatch({ type: 'MOVE_BLOCK', activeId, overId })
  }, [])

  const selectBlock = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_BLOCK', id })
  }, [])

  const setMode = useCallback((mode: BuilderMode) => {
    dispatch({ type: 'SET_MODE', mode })
  }, [])

  const setViewport = useCallback((viewport: BuilderViewport) => {
    dispatch({ type: 'SET_VIEWPORT', viewport })
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
    await persistDraft(blocksRef.current, siteStylesRef.current)
  }, [persistDraft])

  const publishPage = useCallback(async () => {
    dispatch({ type: 'SET_PUBLISHING', isPublishing: true })

    const blocks = blocksRef.current
    const siteStyles = siteStylesRef.current
    const result = await publishSitePageAction(blocks, siteStyles)

    if (result.success) {
      dispatch({
        type: 'MARK_PUBLISHED',
        publishedAt: result.publishedAt,
        publishedBlocks: blocks,
        publishedSiteStyles: siteStyles,
        versions: result.versions
      })
      localStorage.removeItem(getStorageKey(tenantSlug))
    } else {
      dispatch({ type: 'SET_PUBLISH_ERROR', error: result.error })
    }
  }, [tenantSlug])

  const restoreVersionToDraft = useCallback((blocks: Block[], savedAt: string) => {
    dispatch({ type: 'SET_BLOCKS', blocks: toPlainJson(blocks), savedAt })
  }, [])

  const setVersions = useCallback((versions: PublishedVersionSummary[]) => {
    dispatch({ type: 'SET_VERSIONS', versions })
  }, [])

  const resetToStarter = useCallback(() => {
    dispatch({ type: 'RESET_TO_STARTER' })
  }, [])

  useEffect(() => {
    if (!state.isDirty || state.isLoading || state.blocks.length === 0) {
      return
    }

    const timer = setTimeout(() => {
      void persistDraft(state.blocks, state.siteStyles)
    }, 1500)

    return () => clearTimeout(timer)
  }, [state.blocks, state.siteStyles, state.isDirty, state.isLoading, persistDraft])

  const value = useMemo<BuilderContextValue>(
    () => ({
      ...state,
      tenantSlug,
      hasUnpublishedChanges,
      selectedBlock,
      addBlock,
      updateBlock,
      deleteBlock,
      moveBlock: moveBlockAction,
      selectBlock,
      setMode,
      setViewport,
      setSidebarPanel,
      updateSiteStyles,
      applyThemePreset,
      savePage,
      publishPage,
      restoreVersionToDraft,
      setVersions,
      resetToStarter
    }),
    [
      state,
      tenantSlug,
      hasUnpublishedChanges,
      selectedBlock,
      addBlock,
      updateBlock,
      deleteBlock,
      moveBlockAction,
      selectBlock,
      setMode,
      setViewport,
      setSidebarPanel,
      updateSiteStyles,
      applyThemePreset,
      savePage,
      publishPage,
      restoreVersionToDraft,
      setVersions,
      resetToStarter
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
