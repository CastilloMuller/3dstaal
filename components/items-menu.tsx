"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, MapPin, X } from "lucide-react"

export type ItemType = "sectionaaldeur" | "loopdeur" | "raam"

export type ItemData = {
  id: string
  type: ItemType
  width: number
  height: number
  wall: "front" | "back" | "left" | "right"
  position: number // Position along the wall (from left)
  elevation: number // Height from ground (for windows)
  name?: string // Optioneel veld voor de naam van het item
}

// Wijzig de ItemsMenuProps type om een onPreviewItem callback toe te voegen
type ItemsMenuProps = {
  walls: { id: string; width: number }[]
  onAddItem: (item: Omit<ItemData, "id">) => void
  onPreviewItem: (item: Omit<ItemData, "id"> | null) => void
  panelThickness?: string // Voeg panelThickness toe als optionele prop
}

// Update de functie signature om de nieuwe prop te accepteren
export default function ItemsMenu({ walls, onAddItem, onPreviewItem, panelThickness = "60mm" }: ItemsMenuProps) {
  const [selectedWall, setSelectedWall] = useState<string | null>(null)
  const [itemType, setItemType] = useState<ItemType>("sectionaaldeur")
  const [width, setWidth] = useState(3000) // Default width for sectionaaldeur
  const [height, setHeight] = useState(3000) // Default height for sectionaaldeur
  const [position, setPosition] = useState(0)
  const [elevation, setElevation] = useState(0)
  const [itemName, setItemName] = useState<string>("")
  const [itemCounts, setItemCounts] = useState({ sectionaaldeur: 0, loopdeur: 0, raam: 0 })

  // Nieuwe state voor de workflow
  const [isPlaced, setIsPlaced] = useState(false)

  // Bereken de paneeldikte in meters
  const panelThicknessValue = Number.parseInt(panelThickness.replace("mm", "")) / 1000

  // Voeg automatische naamgeneratie toe voor items
  const generateItemName = (type: ItemType, count: number) => {
    if (count === 1) {
      return type === "raam" ? "Raam" : type === "loopdeur" ? "Loopdeur" : "Sectionaaldeur"
    } else {
      return `${type === "raam" ? "Raam" : type === "loopdeur" ? "Loopdeur" : "Sectionaaldeur"} ${count}`
    }
  }

  // Wijzig de handleItemTypeChange functie om de standaardwaarden aan te passen voor deuren en ramen
  const handleItemTypeChange = (type: ItemType) => {
    setItemType(type)

    // Set default dimensions based on item type
    if (type === "sectionaaldeur") {
      setWidth(3000)
      setHeight(3000)
      setElevation(0)
    } else if (type === "loopdeur") {
      setWidth(1000)
      setHeight(2300)
      setElevation(0)
    } else if (type === "raam") {
      setWidth(1000)
      setHeight(1000)
      setElevation(1000)
    }

    // Genereer een nieuwe naam op basis van het type
    const count = itemCounts[type] + 1
    setItemName(generateItemName(type, count))

    setIsPlaced(false)
    onPreviewItem(null)
  }

  // Wijzig de generateItemName functie om een default naam te geven aan items

  // Vervang de bestaande generateItemName functie met deze verbeterde versie:

  // Functie om automatisch een naam te genereren voor het item
  // const generateItemName = (type: ItemType) => {
  //   const count = itemCounts[type] + 1
  //   if (count === 1) {
  //     setItemName(type === "raam" ? "Raam" : type === "loopdeur" ? "Loopdeur" : "Sectionaaldeur")
  //   } else {
  //     setItemName(`${type === "raam" ? "Raam" : type === 'loopdeur" : "Loopdeur" : "Sectionaaldeur'} ${count}`)
  //   }
  // }

  // Get the selected wall data
  const selectedWallData = walls.find((wall) => wall.id === selectedWall)
  const wallWidth = selectedWallData?.width || 0

  // Calculate max position based on wall width and item width
  const maxPosition = Math.max(0, wallWidth - width / 1000)

  // Vervang de handlePlaceItem functie
  const handlePlaceItem = () => {
    if (!selectedWall) return

    // Bereken de middenpositie
    const middlePosition = (wallWidth - width / 1000) / 2
    setPosition(middlePosition)
    setIsPlaced(true)

    // Maak een preview item aan en stuur het naar de parent component
    const previewItem = {
      type: itemType,
      width: width,
      height: height,
      wall: selectedWall as any,
      position: middlePosition,
      elevation: elevation,
      name: itemName,
    }

    // Gebruik de callback functie in plaats van postMessage
    onPreviewItem(previewItem)
  }

  // Vervang de handlePositionChange functie
  const handlePositionChange = (newPosition: number) => {
    setPosition(newPosition)

    // Update het preview item
    if (selectedWall && isPlaced) {
      const updatedPreviewItem = {
        type: itemType,
        width: width,
        height: height,
        wall: selectedWall as any,
        position: newPosition,
        elevation: elevation,
        name: itemName,
      }

      // Gebruik de callback functie in plaats van postMessage
      onPreviewItem(updatedPreviewItem)
    }
  }

  // Update de handleAddItem functie om de itemCounts bij te werken
  const handleAddItem = () => {
    if (!selectedWall || !isPlaced) return

    // Update de item counts
    setItemCounts((prev) => ({
      ...prev,
      [itemType]: prev[itemType] + 1,
    }))

    onAddItem({
      type: itemType,
      width: width,
      height: height,
      wall: selectedWall as any,
      position: position,
      elevation: elevation,
      name: itemName,
    })

    // Reset naar standaardwaarden na toevoegen
    handleItemTypeChange(itemType)
    setPosition(0)
    setIsPlaced(false)

    // Verwijder het preview item
    onPreviewItem(null)
  }

  // Vervang de handleWallChange functie
  const handleWallChange = (wall: string) => {
    setSelectedWall(wall)
    setIsPlaced(false)

    // Verwijder het preview item
    onPreviewItem(null)
  }

  // Vervang de handleCancelPlacement functie
  const handleCancelPlacement = () => {
    setIsPlaced(false)

    // Verwijder het preview item
    onPreviewItem(null)
  }

  // Bereken de afstanden voor weergave
  const calculateDistances = () => {
    if (!selectedWall || !isPlaced) return null

    const itemWidthMeters = width / 1000

    // Afstanden naar staal (zonder panelen)
    const distanceToLeftSteel = position
    const distanceToRightSteel = wallWidth - position - itemWidthMeters

    // Afstanden inclusief panelen
    const distanceToLeftWithPanel = position + panelThicknessValue
    const distanceToRightWithPanel = wallWidth - position - itemWidthMeters + panelThicknessValue

    return {
      distanceToLeftSteel,
      distanceToRightSteel,
      distanceToLeftWithPanel,
      distanceToRightWithPanel,
    }
  }

  // Bereken de afstanden
  const distances = calculateDistances()

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Deuren & Ramen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wall-select">Selecteer Wand</Label>
              <Select value={selectedWall || ""} onValueChange={handleWallChange}>
                <SelectTrigger id="wall-select">
                  <SelectValue placeholder="Kies een wand" />
                </SelectTrigger>
                <SelectContent>
                  {walls.map((wall) => (
                    <SelectItem key={wall.id} value={wall.id}>
                      {wall.id === "front"
                        ? "Voorkant"
                        : wall.id === "back"
                          ? "Achterkant"
                          : wall.id === "left"
                            ? "Linkerkant"
                            : "Rechterkant"}
                      ({Math.round(wall.width * 1000)}mm)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-type">Type</Label>
              <Select
                value={itemType}
                onValueChange={(value: ItemType) => {
                  handleItemTypeChange(value)
                  setIsPlaced(false)
                  // Verwijder het preview item
                  onPreviewItem(null)
                }}
              >
                <SelectTrigger id="item-type">
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
              <Label htmlFor="item-name">Naam</Label>
              <Input
                id="item-name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Naam van het item"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="height">Hoogte (mm)</Label>
                <span className="text-sm">{height}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="height"
                  type="number"
                  min="500"
                  max="3500"
                  step="10"
                  value={height}
                  onChange={(e) => {
                    setHeight(Number(e.target.value))
                    setIsPlaced(false)
                    // Verwijder het preview item
                    onPreviewItem(null)
                  }}
                  className="w-24"
                />
                <Slider
                  id="height-slider"
                  min={500}
                  max={3500}
                  step={10}
                  value={[height]}
                  onValueChange={(value) => {
                    setHeight(value[0])
                    setIsPlaced(false)
                    // Verwijder het preview item
                    onPreviewItem(null)
                  }}
                  className="flex-1"
                  disabled={!selectedWall}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="width">Breedte (mm)</Label>
                <span className="text-sm">{width}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="width"
                  type="number"
                  min="500"
                  max={Math.min(6000, wallWidth * 1000)}
                  step="10"
                  value={width}
                  onChange={(e) => {
                    const newWidth = Number(e.target.value)
                    setWidth(newWidth)
                    setIsPlaced(false)
                    // Verwijder het preview item
                    onPreviewItem(null)
                  }}
                  className="w-24"
                />
                <Slider
                  id="width-slider"
                  min={500}
                  max={Math.min(6000, wallWidth * 1000)}
                  step={10}
                  value={[width]}
                  onValueChange={(value) => {
                    setWidth(value[0])
                    setIsPlaced(false)
                    // Verwijder het preview item
                    onPreviewItem(null)
                  }}
                  className="flex-1"
                  disabled={!selectedWall}
                />
              </div>
            </div>
          </div>
        </div>

        {itemType === "raam" && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="elevation">Hoogte vanaf vloer (mm)</Label>
              <span className="text-sm">{elevation}</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="elevation"
                type="number"
                min="0"
                max="2500"
                step="10"
                value={elevation}
                onChange={(e) => {
                  setElevation(Number(e.target.value))
                  setIsPlaced(false)
                  // Verwijder het preview item
                  onPreviewItem(null)
                }}
                className="w-24"
              />
              <Slider
                id="elevation-slider"
                min={0}
                max={2500}
                step={10}
                value={[elevation]}
                onValueChange={(value) => {
                  setElevation(value[0])
                  setIsPlaced(false)
                  // Verwijder het preview item
                  onPreviewItem(null)
                }}
                className="flex-1"
                disabled={!selectedWall}
              />
            </div>
          </div>
        )}

        {!isPlaced ? (
          <Button className="w-full mt-6" onClick={handlePlaceItem} disabled={!selectedWall}>
            <MapPin className="mr-2 h-4 w-4" />
            Plaats
          </Button>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="position">Positie vanaf links (mm)</Label>
                <span className="text-sm">{Math.round(position * 1000)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="position"
                  type="number"
                  min={0}
                  max={Math.round(maxPosition * 1000)}
                  step={10}
                  value={Math.round(position * 1000)}
                  onChange={(e) => handlePositionChange(Number(e.target.value) / 1000)}
                  className="w-24"
                />
                <Slider
                  id="position-slider"
                  min={0}
                  max={maxPosition}
                  step={0.01}
                  value={[position]}
                  onValueChange={(value) => handlePositionChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Toon afstanden informatie */}
            {distances && (
              <div className="p-3 bg-gray-50 rounded-md text-sm space-y-2">
                <h4 className="font-medium">Afstanden:</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground">Naar staal links:</p>
                    <p className="font-medium">{Math.round(distances.distanceToLeftSteel * 1000)}mm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Naar staal rechts:</p>
                    <p className="font-medium">{Math.round(distances.distanceToRightSteel * 1000)}mm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Incl. paneel links:</p>
                    <p className="font-medium">{Math.round(distances.distanceToLeftWithPanel * 1000)}mm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Incl. paneel rechts:</p>
                    <p className="font-medium">{Math.round(distances.distanceToRightWithPanel * 1000)}mm</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCancelPlacement}>
                <X className="mr-2 h-4 w-4" />
                Annuleren
              </Button>

              <Button className="flex-1" onClick={handleAddItem}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Toevoegen
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
