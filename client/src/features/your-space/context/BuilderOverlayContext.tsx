'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'

import { BUILDER_Z_INDEX } from '../constants/builderLayout'
import {
  anyRectsOverlap,
  tileOverlayRects,
  type OverlayPanelId,
  type OverlayPanelLayout
} from '../utils/builderOverlayLayout'
import { rectsEqual, viewportPanelSize, type PanelRect, type PanelSize } from '../utils/builderPanelFrame'

export type OverlayPanelHandle = {
  id: OverlayPanelId
  visible: boolean
  overlay: boolean
  rect: PanelRect | null
  corner: 'left' | 'right'
  applyLayout: (rect: PanelRect, parent: PanelSize) => void
  restoreUser: (parent: PanelSize) => void
}

type OverlayLayoutReason = 'activate' | 'deactivate'

type BuilderOverlayContextValue = {
  register: (handle: OverlayPanelHandle) => void
  focus: (id: OverlayPanelId) => void
  isFocused: (id: OverlayPanelId) => boolean
  zIndexFor: (id: OverlayPanelId) => number
  relayout: (reason: OverlayLayoutReason, focusedId?: OverlayPanelId) => void
}

const BuilderOverlayContext = createContext<BuilderOverlayContextValue | null>(null)

function isActiveHandle(handle: OverlayPanelHandle | undefined): handle is OverlayPanelHandle & { rect: PanelRect } {
  return Boolean(handle?.visible && handle.overlay && handle.rect)
}

export function BuilderOverlayProvider({ children }: { children: ReactNode }) {
  const handlesRef = useRef(new Map<OverlayPanelId, OverlayPanelHandle>())
  const sharingRef = useRef(false)
  const [stack, setStack] = useState<OverlayPanelId[]>([])

  const relayout = useCallback((reason: OverlayLayoutReason, focusedId?: OverlayPanelId) => {
    const parent = viewportPanelSize()
    const active = [...handlesRef.current.values()].filter(isActiveHandle)

    if (active.length <= 1) {
      if (sharingRef.current) {
        sharingRef.current = false
        active.forEach(handle => handle.restoreUser(parent))
      }

      return
    }

    if (reason === 'deactivate') {
      return
    }

    if (!anyRectsOverlap(active.map(handle => handle.rect))) {
      return
    }

    const focused = focusedId ?? active[active.length - 1]?.id ?? active[0].id
    const tiled = tileOverlayRects(
      active.map(
        (handle): OverlayPanelLayout => ({
          id: handle.id,
          rect: handle.rect,
          corner: handle.corner
        })
      ),
      parent,
      focused
    )

    sharingRef.current = true

    tiled.forEach(item => {
      const handle = handlesRef.current.get(item.id)

      if (handle && !rectsEqual(handle.rect, item.rect)) {
        handle.applyLayout(item.rect, parent)
      }
    })
  }, [])

  const register = useCallback((handle: OverlayPanelHandle) => {
    handlesRef.current.set(handle.id, handle)
  }, [])

  const focus = useCallback((id: OverlayPanelId) => {
    setStack(current => {
      if (current[current.length - 1] === id) {
        return current
      }

      if (!current.includes(id)) {
        return [...current, id]
      }

      return [...current.filter(item => item !== id), id]
    })
  }, [])

  const isFocused = useCallback(
    (id: OverlayPanelId) => stack.length > 0 && stack[stack.length - 1] === id,
    [stack]
  )

  const zIndexFor = useCallback(
    (id: OverlayPanelId) => {
      const index = stack.indexOf(id)

      return BUILDER_Z_INDEX.dockOverlay + Math.max(0, index)
    },
    [stack]
  )

  useEffect(() => {
    const onResize = () => {
      if (sharingRef.current) {
        relayout('activate', stack[stack.length - 1])
      }
    }

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [relayout, stack])

  const value = useMemo(
    () => ({
      register,
      focus,
      isFocused,
      zIndexFor,
      relayout
    }),
    [register, focus, isFocused, zIndexFor, relayout]
  )

  return <BuilderOverlayContext.Provider value={value}>{children}</BuilderOverlayContext.Provider>
}

export function useBuilderOverlay() {
  return useContext(BuilderOverlayContext)
}

export function useRegisterOverlayPanel(handle: OverlayPanelHandle) {
  const overlay = useBuilderOverlay()
  const handleRef = useRef(handle)
  const overlayRef = useRef(overlay)

  handleRef.current = handle
  overlayRef.current = overlay

  if (overlay) {
    overlay.register(handle)
  }

  const active = handle.visible && handle.overlay
  const hasRect = Boolean(handle.rect)
  const id = handle.id

  useEffect(() => {
    return () => {
      overlayRef.current?.register({ ...handleRef.current, visible: false })
    }
  }, [id])

  useEffect(() => {
    const api = overlayRef.current

    if (!api) {
      return
    }

    if (!active) {
      api.relayout('deactivate')

      return
    }

    api.focus(id)
    api.relayout('activate', id)

    return () => api.relayout('deactivate')
  }, [active, hasRect, id])
}

export function OverlayPanelSync(handle: OverlayPanelHandle) {
  useRegisterOverlayPanel(handle)

  return null
}

