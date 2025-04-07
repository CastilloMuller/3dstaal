"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type Opening = {
  id: string
  type: "door" | "window"
  wall: "front" | "back" | "left" | "right"
  width: number
  height: number
  distanceFromLeft: number
  distanceFromBottom: number
}

export type StructureData = {
  width: number
  length: number
  gutterHeight: number
  roofAngle: number
  openings: Opening[]
}

type StructureContextType = {
  structure: StructureData
  updateStructure: (data: Partial<StructureData>) => void
  addOpening: (opening: Omit<Opening, "id">) => void
  updateOpening: (id: string, data: Partial<Omit<Opening, "id">>) => void
  removeOpening: (id: string) => void
  selectedWall: string | null
  setSelectedWall: (wall: string | null) => void
  selectedOpening: string | null
  setSelectedOpening: (id: string | null) => void
}

const defaultStructure: StructureData = {
  width: 6,
  length: 8,
  gutterHeight: 3,
  roofAngle: 15,
  openings: [],
}

const StructureContext = createContext<StructureContextType | undefined>(undefined)

export function StructureProvider({ children }: { children: ReactNode }) {
  const [structure, setStructure] = useState<StructureData>(defaultStructure)
  const [selectedWall, setSelectedWall] = useState<string | null>(null)
  const [selectedOpening, setSelectedOpening] = useState<string | null>(null)

  const updateStructure = (data: Partial<StructureData>) => {
    setStructure((prev) => ({ ...prev, ...data }))
  }

  const addOpening = (opening: Omit<Opening, "id">) => {
    const newOpening = {
      ...opening,
      id: `opening-${Date.now()}`,
    }

    setStructure((prev) => ({
      ...prev,
      openings: [...prev.openings, newOpening],
    }))

    setSelectedOpening(newOpening.id)
  }

  const updateOpening = (id: string, data: Partial<Omit<Opening, "id">>) => {
    setStructure((prev) => ({
      ...prev,
      openings: prev.openings.map((opening) => (opening.id === id ? { ...opening, ...data } : opening)),
    }))
  }

  const removeOpening = (id: string) => {
    setStructure((prev) => ({
      ...prev,
      openings: prev.openings.filter((opening) => opening.id !== id),
    }))

    if (selectedOpening === id) {
      setSelectedOpening(null)
    }
  }

  return (
    <StructureContext.Provider
      value={{
        structure,
        updateStructure,
        addOpening,
        updateOpening,
        removeOpening,
        selectedWall,
        setSelectedWall,
        selectedOpening,
        setSelectedOpening,
      }}
    >
      {children}
    </StructureContext.Provider>
  )
}

export function useStructure() {
  const context = useContext(StructureContext)
  if (context === undefined) {
    throw new Error("useStructure must be used within a StructureProvider")
  }
  return context
}

