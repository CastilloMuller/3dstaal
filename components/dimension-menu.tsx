"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Update the props type to include gutterHeight, panelThickness and doorOpeningType
type DimensionMenuProps = {
  initialLength: number
  initialWidth: number
  initialRoofAngle: number
  initialGutterHeight: number
  initialName: string
  initialShowFront: boolean
  initialShowBack: boolean
  initialShowLeft: boolean
  initialShowRight: boolean
  initialPanelThickness: string
  initialDoorOpeningType: string
  onDimensionsChange: (length: number, width: number, roofAngle: number, gutterHeight: number) => void
  onNameChange: (name: string) => void
  onShowFrontChange: (show: boolean) => void
  onShowBackChange: (show: boolean) => void
  onShowLeftChange: (show: boolean) => void
  onShowRightChange: (show: boolean) => void
  onPanelThicknessChange: (thickness: string) => void
  onDoorOpeningTypeChange: (type: string) => void
}

// Voeg een berekening toe voor de nokhoogte
const calculatePeakHeight = (width: number, gutterHeight: number, roofAngle: number) => {
  const roofHeight = (width / 2) * Math.tan((roofAngle * Math.PI) / 180)
  return gutterHeight + roofHeight
}

// Update de component om de nokhoogte weer te geven
export default function DimensionMenu({
  initialLength,
  initialWidth,
  initialRoofAngle,
  initialGutterHeight,
  initialName,
  initialShowFront,
  initialShowBack,
  initialShowLeft,
  initialShowRight,
  initialPanelThickness,
  initialDoorOpeningType,
  onDimensionsChange,
  onNameChange,
  onShowFrontChange,
  onShowBackChange,
  onShowLeftChange,
  onShowRightChange,
  onPanelThicknessChange,
  onDoorOpeningTypeChange,
}: DimensionMenuProps) {
  // Add gutterHeight state
  const [length, setLength] = useState(initialLength)
  const [width, setWidth] = useState(initialWidth)
  const [roofAngle, setRoofAngle] = useState(initialRoofAngle)
  const [gutterHeight, setGutterHeight] = useState(initialGutterHeight)
  const [name, setName] = useState(initialName)
  const [panelThickness, setPanelThickness] = useState(initialPanelThickness)
  const [doorOpeningType, setDoorOpeningType] = useState(initialDoorOpeningType)

  // Bereken de nokhoogte
  const peakHeight = calculatePeakHeight(width, gutterHeight, roofAngle)

  // Update the handlers to include gutterHeight
  const handleLengthChange = (value: number) => {
    setLength(value)
    onDimensionsChange(value, width, roofAngle, gutterHeight)
  }

  const handleWidthChange = (value: number) => {
    setWidth(value)
    onDimensionsChange(length, value, roofAngle, gutterHeight)
  }

  const handleRoofAngleChange = (value: number) => {
    setRoofAngle(value)
    onDimensionsChange(length, width, value, gutterHeight)
  }

  const handleGutterHeightChange = (value: number) => {
    setGutterHeight(value)
    onDimensionsChange(length, width, roofAngle, value)
  }

  const handleNameChange = (value: string) => {
    setName(value)
    onNameChange(value)
  }

  const handlePanelThicknessChange = (value: string) => {
    setPanelThickness(value)
    onPanelThicknessChange(value)
  }

  const handleDoorOpeningTypeChange = (value: string) => {
    setDoorOpeningType(value)
    onDoorOpeningTypeChange(value)
  }

  // Add the gutterHeight UI controls after the roofAngle controls
  // Add this after the roofAngle div and before the orientation labels section
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Structuur Afmetingen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naam</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Voer een naam in"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="length">Lengte (mm)</Label>
                <span className="text-sm">{Math.round(length * 1000)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="length"
                  type="number"
                  min="4000"
                  max="40000"
                  step="100"
                  value={Math.round(length * 1000)}
                  onChange={(e) => handleLengthChange(Number(e.target.value) / 1000)}
                  className="w-24"
                />
                <Slider
                  id="length-slider"
                  min={4}
                  max={40}
                  step={0.1}
                  value={[length]}
                  onValueChange={(value) => handleLengthChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="width">Breedte (mm)</Label>
                <span className="text-sm">{Math.round(width * 1000)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="width"
                  type="number"
                  min="3000"
                  max="21000"
                  step="100"
                  value={Math.round(width * 1000)}
                  onChange={(e) => handleWidthChange(Number(e.target.value) / 1000)}
                  className="w-24"
                />
                <Slider
                  id="width-slider"
                  min={3}
                  max={21}
                  step={0.1}
                  value={[width]}
                  onValueChange={(value) => handleWidthChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md text-sm mt-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nokhoogte:</span>
                <span className="font-medium">{Math.round(peakHeight * 1000)}mm</span>
              </div>
            </div>

            {/* Voeg de nieuwe menu-items toe */}
            <div className="space-y-2">
              <Label htmlFor="panel-thickness">Dikte wandpanelen</Label>
              <Select value={panelThickness} onValueChange={handlePanelThicknessChange}>
                <SelectTrigger id="panel-thickness">
                  <SelectValue placeholder="Selecteer dikte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="40mm">40mm</SelectItem>
                  <SelectItem value="60mm">60mm</SelectItem>
                  <SelectItem value="80mm">80mm</SelectItem>
                  <SelectItem value="100mm">100mm</SelectItem>
                  <SelectItem value="120mm">120mm</SelectItem>
                  <SelectItem value="150mm">150mm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="door-opening-type">Openingen deuren</Label>
              <Select value={doorOpeningType} onValueChange={handleDoorOpeningTypeChange}>
                <SelectTrigger id="door-opening-type">
                  <SelectValue placeholder="Selecteer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dagmaten">Dagmaten</SelectItem>
                  <SelectItem value="Dagmaten + isolatie">Dagmaten + isolatie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="gutterHeight">Goothoogte (mm)</Label>
                <span className="text-sm">{Math.round(gutterHeight * 1000)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="gutterHeight"
                  type="number"
                  min="2000"
                  max="6500"
                  step="100"
                  value={Math.round(gutterHeight * 1000)}
                  onChange={(e) => handleGutterHeightChange(Number(e.target.value) / 1000)}
                  className="w-24"
                />
                <Slider
                  id="gutterHeight-slider"
                  min={2}
                  max={6.5}
                  step={0.1}
                  value={[gutterHeight]}
                  onValueChange={(value) => handleGutterHeightChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="roofAngle">Dakhelling (°)</Label>
                <span className="text-sm">{roofAngle.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="roofAngle"
                  type="number"
                  min="1"
                  max="55"
                  step="0.5"
                  value={roofAngle}
                  onChange={(e) => handleRoofAngleChange(Number(e.target.value))}
                  className="w-24"
                />
                <Slider
                  id="roofAngle-slider"
                  min={1}
                  max={55}
                  step={0.5}
                  value={[roofAngle]}
                  onValueChange={(value) => handleRoofAngleChange(value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="mt-4 mb-2">
                <Label>Toon oriëntatie labels</Label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-front">Voorkant</Label>
                  <Switch id="show-front" checked={initialShowFront} onCheckedChange={onShowFrontChange} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-back">Achterkant</Label>
                  <Switch id="show-back" checked={initialShowBack} onCheckedChange={onShowBackChange} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-left">Linkerkant</Label>
                  <Switch id="show-left" checked={initialShowLeft} onCheckedChange={onShowLeftChange} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-right">Rechterkant</Label>
                  <Switch id="show-right" checked={initialShowRight} onCheckedChange={onShowRightChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
