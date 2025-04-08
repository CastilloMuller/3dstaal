"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Database, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ItemData } from "./items-menu"
import { jsPDF } from "jspdf"

type ReportingTabProps = {
  dimensions: {
    width: number
    length: number
    gutterHeight: number
    roofAngle: number
  }
  structureName: string
  panelThickness: string
  doorOpeningType: string
  showFront: boolean
  showBack: boolean
  showLeft: boolean
  showRight: boolean
  items: ItemData[]
  onGenerateReport?: () => void
}

export default function ReportingTab({
  dimensions,
  structureName,
  panelThickness,
  doorOpeningType,
  showFront,
  showBack,
  showLeft,
  showRight,
  items,
  onGenerateReport,
}: ReportingTabProps) {
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [reportCode, setReportCode] = useState("")
  const [showReportCode, setShowReportCode] = useState(false)

  const handleReportStructureClick = () => {
    if (onGenerateReport) {
      onGenerateReport()
    } else {
      handleSimplePDFGeneration()
    }
  }

  const handleBackupInfoClick = () => {
    setIsBackupDialogOpen(true)
  }

  const generateBackupData = () => {
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      structureName,
      dimensions,
      panelThickness,
      doorOpeningType,
      orientation: {
        showFront,
        showBack,
        showLeft,
        showRight,
      },
      items,
    }

    return JSON.stringify(backupData, null, 2)
  }

  const handleCopyToClipboard = () => {
    const backupData = generateBackupData()
    navigator.clipboard
      .writeText(backupData)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Kon niet kopiëren naar klembord:", err)
      })
  }

  const handleShowCode = () => {
    setShowReportCode(true)
  }

  // Zeer eenvoudige PDF generatie functie die alleen tekst bevat
  const handleSimplePDFGeneration = () => {
    try {
      setIsGeneratingReport(true)
      setProgress(10)
      setCurrentStep("Rapport voorbereiden...")

      // Maak een nieuw PDF document
      const pdf = new jsPDF()

      // Genereer de code die we gebruiken om het rapport te maken
      const codeLines = [
        "// Dit is de code die wordt gebruikt om het rapport te genereren",
        "const pdf = new jsPDF()",
        "",
        "// Pagina 1",
        "pdf.setFontSize(22)",
        `pdf.text("${structureName}", 105, 40, { align: 'center' })`,
        "",
        "pdf.setFontSize(12)",
        `pdf.text("Gegenereerd op: ${new Date().toLocaleDateString()}", 105, 50, { align: 'center' })`,
        "",
        "// Afmetingen",
        "pdf.setFontSize(16)",
        `pdf.text("Afmetingen", 20, 70)`,
        "",
        "pdf.setFontSize(12)",
        `pdf.text("Breedte: ${Math.round(dimensions.width * 1000)}mm", 20, 80)`,
        `pdf.text("Lengte: ${Math.round(dimensions.length * 1000)}mm", 20, 88)`,
        `pdf.text("Goothoogte: ${Math.round(dimensions.gutterHeight * 1000)}mm", 20, 96)`,
        `pdf.text("Dakhelling: ${dimensions.roofAngle}°", 20, 104)`,
        `pdf.text("Wandpanelen: ${panelThickness}", 20, 112)`,
        `pdf.text("Type deuropeningen: ${doorOpeningType}", 20, 120)`,
        "",
        "// Pagina 2",
        "pdf.addPage()",
        "pdf.setFontSize(22)",
        `pdf.text("Overzicht items", 105, 20, { align: 'center' })`,
        "",
        "// Pagina 3",
        "pdf.addPage()",
        "pdf.setFontSize(22)",
        `pdf.text("Zijden overzicht", 105, 20, { align: 'center' })`,
        "",
        "// Pagina 4",
        "pdf.addPage()",
        "pdf.setFontSize(22)",
        `pdf.text("Item details", 105, 20, { align: 'center' })`,
        "",
        "// Sla het PDF bestand op",
        `pdf.save("${structureName.replace(/\s+/g, "_")}_rapport.pdf")`,
      ]

      setReportCode(codeLines.join("\n"))

      // PAGINA 1 - Voorblad
      pdf.setFontSize(22)
      pdf.text(structureName, 105, 40, { align: "center" })

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

      setProgress(40)
      setCurrentStep("Pagina 1 voltooid, pagina 2 voorbereiden...")

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

      setProgress(60)
      setCurrentStep("Pagina 2 voltooid, pagina 3 voorbereiden...")

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
          }
        }

        yPos += 8 // Extra ruimte tussen zijden
      }

      setProgress(80)
      setCurrentStep("Pagina 3 voltooid, pagina 4 voorbereiden...")

      // PAGINA 4 - Item details
      pdf.addPage()

      pdf.setFontSize(22)
      pdf.text("Item details", 105, 20, { align: "center" })

      if (items.length === 0) {
        pdf.setFontSize(12)
        pdf.text("Geen items toegevoegd aan de structuur.", 105, 40, { align: "center" })
      } else {
        yPos = 40

        // Toon details van elk item (max 5 voor deze test)
        for (let i = 0; i < Math.min(items.length, 5); i++) {
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
        }
      }

      setProgress(95)
      setCurrentStep("Rapport afronden...")

      // Download het PDF bestand
      pdf.save(`${structureName.replace(/\s+/g, "_")}_rapport.pdf`)

      setProgress(100)
      setCurrentStep("Rapport succesvol gegenereerd!")

      // Reset na een korte vertraging
      setTimeout(() => {
        setIsGeneratingReport(false)
        setProgress(0)
        setCurrentStep("")
      }, 1500)
    } catch (error) {
      console.error("Fout bij het genereren van het rapport:", error)
      setCurrentStep(`Er is een fout opgetreden: ${error.message}`)
      setIsGeneratingReport(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Rapportage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Genereer rapporten en beheer backup informatie voor uw structuur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={handleReportStructureClick}
              disabled={isGeneratingReport}
            >
              {isGeneratingReport ? (
                <>
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <span>Genereren... {progress}%</span>
                  <span className="text-xs text-muted-foreground">{currentStep}</span>
                </>
              ) : (
                <>
                  <FileText className="h-8 w-8" />
                  <span>Rapportage structuur</span>
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={handleBackupInfoClick}
            >
              <Database className="h-8 w-8" />
              <span>Backup info</span>
            </Button>
          </div>

          <div className="flex justify-center">
            <Button variant="outline" onClick={handleShowCode}>
              Toon rapport code
            </Button>
          </div>

          {showReportCode && reportCode && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="font-medium mb-2">Rapport Generatie Code</h3>
              <pre className="text-xs font-mono bg-black text-white p-2 rounded-md max-h-60 overflow-y-auto">
                {reportCode}
              </pre>
            </div>
          )}
        </div>

        {/* Backup Dialog */}
        <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Backup Informatie</DialogTitle>
              <DialogDescription>
                Kopieer deze informatie en bewaar deze veilig. U kunt deze later gebruiken om uw structuur te
                herstellen.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Textarea className="font-mono text-xs h-[400px] overflow-auto" readOnly value={generateBackupData()} />

              <div className="flex justify-end">
                <Button onClick={handleCopyToClipboard} className="flex items-center gap-2">
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Gekopieerd!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Kopieer naar klembord
                    </>
                  )}
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  Stuur deze informatie naar de ontwikkelaar om uw structuur te herstellen in een nieuwe installatie.
                </AlertDescription>
              </Alert>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
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
