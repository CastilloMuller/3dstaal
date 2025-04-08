"use client"

import { useStructure } from "./structure-context"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

export default function OpeningEditor() {
  const { structure, selectedOpening, setSelectedOpening, updateOpening, removeOpening } = useStructure()

  if (!selectedOpening) return null

  const opening = structure.openings.find((o) => o.id === selectedOpening)
  if (!opening) return null

  // Get wall dimensions
  let wallWidth = 0
  const wallHeight = structure.gutterHeight

  if (opening.wall === "front" || opening.wall === "back") {
    wallWidth = structure.width
  } else {
    wallWidth = structure.length
  }

  const handleChange = (field: keyof typeof opening, value: any) => {
    updateOpening(selectedOpening, { [field]: value })
  }

  const handleClose = () => {
    setSelectedOpening(null)
  }

  const handleDelete = () => {
    removeOpening(selectedOpening)
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit {opening.type}</h3>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="opening-type">Type</Label>
            <Select value={opening.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="door">Door</SelectItem>
                <SelectItem value="window">Window</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opening-wall">Wall</Label>
            <Select value={opening.wall} onValueChange={(value: any) => handleChange("wall", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select wall" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Front</SelectItem>
                <SelectItem value="back">Back</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="opening-width">Width (m)</Label>
              <span className="text-sm">{opening.width.toFixed(2)}</span>
            </div>
            <Slider
              id="opening-width"
              min={0.5}
              max={Math.min(5, wallWidth - opening.distanceFromLeft)}
              step={0.1}
              value={[opening.width]}
              onValueChange={(value) => handleChange("width", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="opening-height">Height (m)</Label>
              <span className="text-sm">{opening.height.toFixed(2)}</span>
            </div>
            <Slider
              id="opening-height"
              min={0.5}
              max={Math.min(3, wallHeight - opening.distanceFromBottom)}
              step={0.1}
              value={[opening.height]}
              onValueChange={(value) => handleChange("height", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="distance-left">Distance from left (m)</Label>
              <span className="text-sm">{opening.distanceFromLeft.toFixed(2)}</span>
            </div>
            <Slider
              id="distance-left"
              min={0}
              max={Math.max(0, wallWidth - opening.width)}
              step={0.1}
              value={[opening.distanceFromLeft]}
              onValueChange={(value) => handleChange("distanceFromLeft", value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="distance-bottom">Distance from bottom (m)</Label>
              <span className="text-sm">{opening.distanceFromBottom.toFixed(2)}</span>
            </div>
            <Slider
              id="distance-bottom"
              min={0}
              max={Math.max(0, wallHeight - opening.height)}
              step={0.1}
              value={[opening.distanceFromBottom]}
              onValueChange={(value) => handleChange("distanceFromBottom", value[0])}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="destructive" onClick={handleDelete}>
            Delete {opening.type}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
