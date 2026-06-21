'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { PropertyPanelTab } from '../components/property/PropertyPanelUi'

type BuilderShellContextValue = {
  openPropertyPanel: (tab?: PropertyPanelTab) => void
}

const BuilderShellContext = createContext<BuilderShellContextValue | null>(null)

export function BuilderShellProvider({
  children,
  openPropertyPanel
}: {
  children: ReactNode
  openPropertyPanel: (tab?: PropertyPanelTab) => void
}) {
  return <BuilderShellContext.Provider value={{ openPropertyPanel }}>{children}</BuilderShellContext.Provider>
}

export function useBuilderShell() {
  return useContext(BuilderShellContext)
}
