"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, X } from "lucide-react"
import type { ItemData, ItemType } from "./items-menu"

// Voeg automatische naamgeneratie toe voor items
const generateItemName = (type: ItemType, id: string) => {
  const itemNumber = id.split("-")[1] || "1"
  return `${type === "raam" ? "Raam" : type === "loopdeur" ? "Loopdeur" : "Sectionaaldeur"} ${itemNumber}`
}

type ItemEditorProps = {
  item: ItemData
  wallWidth: number
  onUpdate: (id: string, data: Partial<ItemData>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

// Update de component om een naam te genereren als deze niet bestaat
export default function ItemEditor({ item, wallWidth, onUpdate, onDelete, onClose }: ItemEditorProps) {
  const [width, setWidth] = useState(item.width)
  const [height, setHeight] = useState(item.height)
  const [position, setPosition] = useState(item.position)
  const [elevation, setElevation] = useState(item.elevation)
  const [itemType, setItemType] = useState<ItemType>(item.type)
  const [itemName, setItemName] = useState(item.name || generateItemName(item.type, item.id))

  // Update local state when item changes
  useEffect(() => {
    setWidth(item.width)
    setHeight(item.height)
    setPosition(item.position)
    setElevation(item.elevation)
    setItemType(item.type)
    setItemName(item.name || generateItemName(item.type, item.id))
  }, [item])

  // Voeg een functie toe om de naam bij te werken
  const handleNameChange = (name: string) => {
    setItemName(name)
    onUpdate(item.id, { name })
  }

  const handleItemTypeChange = (type: ItemType) => {
    setItemType(type)
    onUpdate(item.id, { type })

    // Set default dimensions based on item type
    if (type === "sectionaaldeur") {
      setWidth(3000)
      setHeight(3000)
      setElevation(0)
      onUpdate(item.id, { width: 3000, height: 3000, elevation: 0 })
    } else if (type === "loopdeur") {
      setWidth(1000)
      setHeight(2300)
      setElevation(0)
      onUpdate(item.id, { width: 1000, height: 2300, elevation: 0 })
    } else if (type === "raam") {
      setWidth(2000)
      setHeight(1000)
      setElevation(1000)
      onUpdate(item.id, { width: 2000, height: 1000, elevation: 1000 })
    }
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    onUpdate(item.id, { width: newWidth })

    // Adjust position if needed to keep item within wall
    if (position + newWidth / 1000 > wallWidth) {
      const newPosition = Math.max(0, wallWidth - newWidth / 1000)
      setPosition(newPosition)
      onUpdate(item.id, { position: newPosition })
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    onUpdate(item.id, { height: newHeight })
  }

  const handlePositionChange = (newPosition: number) => {
    setPosition(newPosition)
    onUpdate(item.id, { position: newPosition })
  }

  const handleElevationChange = (newElevation: number) => {
    setElevation(newElevation)
    onUpdate(item.id, { elevation: newElevation })
  }

  const handleDelete = () => {
    onDelete(item.id)
    onClose()
  }

  const maxPosition = wallWidth - width / 1000

  // Update de UI om een naamveld toe te voegen
  return (
    <Card className="w-full max-w-3xl mx-auto mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          Bewerk {getItemTypeName(itemType)} #{item.id.split("-")[1]}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-item-name">Naam</Label>
              <Input
                id="edit-item-name"
                type="text"
                value={itemName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Naam van het item"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-item-type">Type</Label>
              <Select value={itemType} onValueChange={(value: ItemType) => handleItemTypeChange(value)}>
                <SelectTrigger id="edit-item-type">
                  <SelectValue placeholder="Kies een type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sectionaaldeur">Sectionaaldeur</SelectItem>
                  <SelectItem value="loopdeur">Loopdeur</SelectItem>
                  <SelectItem value="raam">Raam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-width">Breedte (mm)</Label>
                <span className="text-sm">{width}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-width"
                  type="number"
                  min="500"
                  max={Math.min(6000, wallWidth * 1000)}
                  step="10"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-24"
                />
                <Slider
                  id="edit-width-slider"
                  min={500}
                  max={Math.min(6000, wallWidth * 1000)}
                  step={10}
                  value={[width]}
                  onValueChange={(value) => handleWidthChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-height">Hoogte (mm)</Label>
                <span className="text-sm">{height}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-height"
                  type="number"
                  min="500"
                  max="3500"
                  step="10"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-24"
                />
                <Slider
                  id="edit-height-slider"
                  min={500}
                  max={3500}
                  step={10}
                  value={[height]}
                  onValueChange={(value) => handleHeightChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-position">Positie vanaf links (mm)</Label>
                <span className="text-sm">{Math.round(position * 1000)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-position"
                  type="number"
                  min={0}
                  max={Math.round(maxPosition * 1000)}
                  step={10}
                  value={Math.round(position * 1000)}
                  onChange={(e) => handlePositionChange(Number(e.target.value) / 1000)}
                  className="w-24"
                />
                <Slider
                  id="edit-position-slider"
                  min={0}
                  max={maxPosition}
                  step={0.01}
                  value={[position]}
                  onValueChange={(value) => handlePositionChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {itemType === "raam" && (
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-elevation">Hoogte vanaf vloer (mm)</Label>
                <span className="text-sm">{elevation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-elevation"
                  type="number"
                  min="0"
                  max="2500"
                  step="10"
                  value={elevation}
                  onChange={(e) => handleElevationChange(Number(e.target.value))}
                  className="w-24"
                />
                <Slider
                  id="edit-elevation-slider"
                  min={0}
                  max={2500}
                  step={10}
                  value={[elevation]}
                  onValueChange={(value) => handleElevationChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Verwijderen
          </Button>

          <Button variant="default" onClick={onClose}>
            Opslaan
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function getItemTypeName(type: ItemType): string {
  switch (type) {
    case "sectionaaldeur":
      return "Sectionaaldeur"
    case "loopdeur":
      return "Loopdeur"
    case "raam":
      return "Raam"
    default:
      return "Item"
  }
}

