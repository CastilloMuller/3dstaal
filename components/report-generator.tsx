"use client"

import { useRef, useState, useEffect } from "react"
import type { ItemData } from "./items-menu"
import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

type ReportGeneratorProps = {
  isOpen: boolean
  onClose: () => void
  dimensions: {
    width: number
    length: number
    gutterHeight: number
    roofAngle: number
  }
  structureName: string
  panelThickness: string
  doorOpeningType: string
  items: ItemData[]
  logoUrl?: string
}

export default function ReportGenerator({
  isOpen,
  onClose,
  dimensions,
  structureName,
  panelThickness,
  doorOpeningType,
  items,
  logoUrl,
}: ReportGeneratorProps) {
  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState("")
  const reportContainerRef = useRef<HTMLDivElement>(null)
  const frontViewRef = useRef<HTMLCanvasElement>(null)
  const rightViewRef = useRef<HTMLCanvasElement>(null)
  const backViewRef = useRef<HTMLCanvasElement>(null)
  const leftViewRef = useRef<HTMLCanvasElement>(null)
  const front2DViewRef = useRef<HTMLCanvasElement>(null)
  const right2DViewRef = useRef<HTMLCanvasElement>(null)
  const back2DViewRef = useRef<HTMLCanvasElement>(null)
  const left2DViewRef = useRef<HTMLCanvasElement>(null)

  // Vervang de generateReport functie met deze geoptimaliseerde versie
  const generateReport = async () => {
    if (!reportContainerRef.current) return

    setIsGenerating(true)
    setProgress(0)
    setCurrentStep("Voorbereiden rapport...")

    try {
      // Maak een nieuw PDF document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // PAGINA 1 - Voorblad
      pdf.setFontSize(22)
      pdf.text("NIEUWE GENERATOR - " + structureName, 105, 40, { align: "center" })

      pdf.setFontSize(12)
      pdf.text(`Gegenereerd op: ${new Date().toLocaleDateString()}`, 105, 50, { align: "center" })

      pdf.setFontSize(16)
      pdf.text("Afmetingen", 20, 70)

      pdf.setFontSize(12)
      let yPos = 80
      pdf.text(`Breedte: ${Math.round(dimensions.width * 1000)}mm`, 20, yPos)
      yPos += 8
      pdf.text(`Lengte: ${Math.round(dimensions.length * 1000)}mm`, 20, yPos)
      yPos += 8
      pdf.text(`Goothoogte: ${Math.round(dimensions.gutterHeight * 1000)}mm`, 20, yPos)
      yPos += 8
      pdf.text(`Dakhelling: ${dimensions.roofAngle}°`, 20, yPos)
      yPos += 8
      pdf.text(`Wandpanelen: ${panelThickness}`, 20, yPos)
      yPos += 8
      pdf.text(`Type deuropeningen: ${doorOpeningType}`, 20, yPos)

      setProgress(25)
      setCurrentStep("Pagina 2 voorbereiden...")

      // PAGINA 2 - Overzicht items
      pdf.addPage()

      pdf.setFontSize(22)
      pdf.text("Overzicht items", 105, 20, { align: "center" })

      // Tel items per type
      const sectionaaldeuren = items.filter((item) => item.type === "sectionaaldeur").length
      const loopdeuren = items.filter((item) => item.type === "loopdeur").length
      const ramen = items.filter((item) => item.type === "raam").length

      pdf.setFontSize(12)
      yPos = 40
      pdf.text(`Aantal sectionaaldeuren: ${sectionaaldeuren}`, 20, yPos)
      yPos += 8
      pdf.text(`Aantal loopdeuren: ${loopdeuren}`, 20, yPos)
      yPos += 8
      pdf.text(`Aantal ramen: ${ramen}`, 20, yPos)
      yPos += 8
      pdf.text(`Totaal aantal items: ${items.length}`, 20, yPos)

      setProgress(50)
      setCurrentStep("Pagina 3 voorbereiden...")

      // PAGINA 3 - Zijden overzicht
      pdf.addPage()

      pdf.setFontSize(22)
      pdf.text("Zijden overzicht", 105, 20, { align: "center" })

      const sides = [
        { id: "front", name: "Voorkant" },
        { id: "back", name: "Achterkant" },
        { id: "left", name: "Linkerkant" },
        { id: "right", name: "Rechterkant" },
      ]

      yPos = 40
      for (const side of sides) {
        const sideItems = items.filter((item) => item.wall === side.id)

        pdf.setFontSize(14)
        pdf.text(`${side.name}:`, 20, yPos)
        yPos += 8

        pdf.setFontSize(12)
        if (sideItems.length === 0) {
          pdf.text(`Geen items op deze zijde.`, 30, yPos)
          yPos += 8
        } else {
          pdf.text(`Aantal items: ${sideItems.length}`, 30, yPos)
          yPos += 8

          for (const item of sideItems) {
            pdf.text(`- ${getItemTypeName(item.type)}: ${item.width}×${item.height}mm`, 30, yPos)
            yPos += 8
            if (yPos > 270) {
              pdf.addPage()
              yPos = 40
            }
          }
        }

        yPos += 8 // Extra ruimte tussen zijden
        if (yPos > 270) {
          pdf.addPage()
          yPos = 40
        }
      }

      setProgress(75)
      setCurrentStep("Pagina 4 voorbereiden...")

      // PAGINA 4 - Item details
      pdf.addPage()

      pdf.setFontSize(22)
      pdf.text("Item details", 105, 20, { align: "center" })

      if (items.length === 0) {
        pdf.setFontSize(12)
        pdf.text("Geen items toegevoegd aan de structuur.", 105, 40, { align: "center" })
      } else {
        yPos = 40

        // Toon details van elk item
        for (let i = 0; i < items.length; i++) {
          const item = items[i]

          pdf.setFontSize(14)
          pdf.text(
            `${getItemTypeName(item.type)} (${
              item.wall === "front"
                ? "Voorkant"
                : item.wall === "back"
                  ? "Achterkant"
                  : item.wall === "left"
                    ? "Linkerkant"
                    : "Rechterkant"
            })`,
            20,
            yPos,
          )
          yPos += 8

          pdf.setFontSize(12)
          pdf.text(`Afmetingen: ${item.width}mm × ${item.height}mm`, 20, yPos)
          yPos += 8
          pdf.text(`Positie vanaf links: ${Math.round(item.position * 1000)}mm`, 20, yPos)
          yPos += 8

          if (item.type === "raam") {
            pdf.text(`Hoogte vanaf vloer: ${item.elevation}mm`, 20, yPos)
            yPos += 8
          }

          yPos += 8 // Extra ruimte tussen items

          if (yPos > 270 && i < items.length - 1) {
            pdf.addPage()
            yPos = 40
          }
        }
      }

      setProgress(95)
      setCurrentStep("Rapport afronden...")

      // Download het PDF bestand
      pdf.save(`${structureName.replace(/\s+/g, "_")}_rapport.pdf`)

      setProgress(100)
      setCurrentStep("Rapport succesvol gegenereerd!")

      // Sluit de dialoog na een korte vertraging
      setTimeout(() => {
        onClose()
        setIsGenerating(false)
      }, 1500)
    } catch (error) {
      console.error("Fout bij het genereren van het rapport:", error)
      setCurrentStep("Er is een fout opgetreden bij het genereren van het rapport.")
      setIsGenerating(false)
    }
  }

  // Start het genereren van het rapport wanneer de dialoog wordt geopend
  useEffect(() => {
    if (isOpen && !isGenerating) {
      generateReport()
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rapport Genereren</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">{currentStep}</p>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
          </div>

          {progress === 100 && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={onClose}>
                Sluiten
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getItemTypeName(type: string): string {
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

