"use client"

import { useStructure } from "./structure-context"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export default function StructureForm() {
  const { structure, updateStructure } = useStructure()

  const handleChange = (field: keyof typeof structure, value: number) => {
    updateStructure({ [field]: value })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="width">Width (m)</Label>
                <span className="text-sm">{structure.width.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="width"
                  type="number"
                  min="1"
                  max="20"
                  step="0.1"
                  value={structure.width}
                  onChange={(e) => handleChange("width", Number.parseFloat(e.target.value))}
                  className="w-20"
                />
                <Slider
                  id="width-slider"
                  min={1}
                  max={20}
                  step={0.1}
                  value={[structure.width]}
                  onValueChange={(value) => handleChange("width", value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="length">Length (m)</Label>
                <span className="text-sm">{structure.length.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="length"
                  type="number"
                  min="1"
                  max="30"
                  step="0.1"
                  value={structure.length}
                  onChange={(e) => handleChange("length", Number.parseFloat(e.target.value))}
                  className="w-20"
                />
                <Slider
                  id="length-slider"
                  min={1}
                  max={30}
                  step={0.1}
                  value={[structure.length]}
                  onValueChange={(value) => handleChange("length", value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="gutterHeight">Gutter Height (m)</Label>
                <span className="text-sm">{structure.gutterHeight.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="gutterHeight"
                  type="number"
                  min="2"
                  max="10"
                  step="0.1"
                  value={structure.gutterHeight}
                  onChange={(e) => handleChange("gutterHeight", Number.parseFloat(e.target.value))}
                  className="w-20"
                />
                <Slider
                  id="gutterHeight-slider"
                  min={2}
                  max={10}
                  step={0.1}
                  value={[structure.gutterHeight]}
                  onValueChange={(value) => handleChange("gutterHeight", value[0])}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="roofAngle">Roof Angle (°)</Label>
                <span className="text-sm">{structure.roofAngle.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="roofAngle"
                  type="number"
                  min="5"
                  max="45"
                  step="0.5"
                  value={structure.roofAngle}
                  onChange={(e) => handleChange("roofAngle", Number.parseFloat(e.target.value))}
                  className="w-20"
                />
                <Slider
                  id="roofAngle-slider"
                  min={5}
                  max={45}
                  step={0.5}
                  value={[structure.roofAngle]}
                  onValueChange={(value) => handleChange("roofAngle", value[0])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

