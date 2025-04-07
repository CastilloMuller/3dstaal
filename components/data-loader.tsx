"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Upload, AlertTriangle, Save } from "lucide-react"

type DataLoaderProps = {
  onLoadData: (data: any) => void
}

export default function DataLoader({ onLoadData }: DataLoaderProps) {
  const [jsonData, setJsonData] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Functie om de huidige structuur te exporteren
  const handleExportCurrentStructure = () => {
    // Verzamel alle data uit localStorage
    const structureData = {
      structureName: localStorage.getItem("structureName") || "Mijn Structuur",
      dimensions: JSON.parse(
        localStorage.getItem("dimensions") || '{"width":8,"length":12,"gutterHeight":3,"roofAngle":25}',
      ),
      panelThickness: localStorage.getItem("panelThickness") || "60mm",
      doorOpeningType: localStorage.getItem("doorOpeningType") || "Dagmaten",
      orientation: {
        showFront: localStorage.getItem("showFront") === "true",
        showBack: localStorage.getItem("showBack") === "true",
        showLeft: localStorage.getItem("showLeft") === "true",
        showRight: localStorage.getItem("showRight") === "true",
      },
      items: JSON.parse(localStorage.getItem("items") || "[]"),
    }

    // Converteer naar JSON string
    const jsonString = JSON.stringify(structureData, null, 2)

    // Download als bestand
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${structureData.structureName.replace(/\s+/g, "_")}_backup.json`
    link.click()

    // Toon succes bericht
    setSuccess("Structuur succesvol geëxporteerd")
    setTimeout(() => setSuccess(null), 3000)
  }

  // Functie om de huidige structuur op te slaan in localStorage
  const handleSaveToLocalStorage = () => {
    try {
      // Probeer de JSON te parsen om te valideren
      const data = JSON.parse(jsonData)

      // Valideer de structuur van de data
      if (!data.dimensions || !data.items) {
        throw new Error("Ongeldige data structuur. Dimensies of items ontbreken.")
      }

      // Sla de data op in localStorage
      localStorage.setItem("structureName", data.structureName || "Mijn Structuur")
      localStorage.setItem("dimensions", JSON.stringify(data.dimensions))
      localStorage.setItem("panelThickness", data.panelThickness || "60mm")
      localStorage.setItem("doorOpeningType", data.doorOpeningType || "Dagmaten")
      localStorage.setItem("showFront", String(data.orientation?.showFront || true))
      localStorage.setItem("showBack", String(data.orientation?.showBack || false))
      localStorage.setItem("showLeft", String(data.orientation?.showLeft || false))
      localStorage.setItem("showRight", String(data.orientation?.showRight || false))
      localStorage.setItem("items", JSON.stringify(data.items))

      // Toon succes bericht
      setSuccess("Data succesvol opgeslagen in lokale opslag")
      setTimeout(() => setSuccess(null), 3000)

      // Laad de data in de applicatie
      onLoadData(data)
    } catch (err) {
      setError(`Fout bij het verwerken van JSON: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  // Functie om een bestand te laden
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setJsonData(content)

      try {
        const data = JSON.parse(content)
        onLoadData(data)
        setSuccess("Bestand succesvol geladen")
        setTimeout(() => setSuccess(null), 3000)
      } catch (err) {
        setError(`Fout bij het verwerken van bestand: ${err.message}`)
        setTimeout(() => setError(null), 5000)
      }
    }
    reader.readAsText(file)
  }

  // Functie om de data te laden
  const handleLoadData = () => {
    try {
      const data = JSON.parse(jsonData)
      onLoadData(data)
      setSuccess("Data succesvol geladen")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(`Fout bij het verwerken van JSON: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Data Import/Export</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Bestand upload sectie */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Upload JSON bestand</Label>
            <div className="flex items-center gap-2">
              <Input id="file-upload" type="file" accept=".json" onChange={handleFileUpload} className="flex-1" />
              <Button onClick={handleExportCurrentStructure} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporteer
              </Button>
              <Button onClick={handleSaveToLocalStorage} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Opslaan
              </Button>
            </div>
          </div>

          {/* JSON editor sectie */}
          <div className="space-y-2">
            <Label htmlFor="json-data">JSON Data</Label>
            <textarea
              id="json-data"
              className="w-full h-64 p-2 border rounded-md font-mono text-sm"
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder='{"structureName":"Mijn Structuur","dimensions":{"width":8,"length":12,"gutterHeight":3,"roofAngle":25},"items":[]}'
            />
          </div>

          {/* Foutmelding */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Fout</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Succes melding */}
          {success && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <AlertTitle>Succes</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Laad knop */}
          <Button onClick={handleLoadData} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Laad Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

