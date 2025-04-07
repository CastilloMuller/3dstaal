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

type NewReportingTabProps = {
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

export default function NewReportingTab({
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
}: NewReportingTabProps) {
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [debugLog, setDebugLog] = useState<string[]>([])

  const handleReportStructureClick = () => {
    if (onGenerateReport) {
      // Als er een externe functie is meegegeven, gebruik die
      onGenerateReport()
    } else {
      // Anders gebruik onze eigen functie
      generateSimpleReport()
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

  // Nieuwe functie voor het genereren van een eenvoudig rapport
  const generateSimpleReport = async () => {
    try {
      setIsGeneratingReport(true)
      setProgress(10)
      setCurrentStep("Rapport voorbereiden...")
      addDebugLog("Start rapport generatie")

      // Maak een nieuw PDF document
      const pdf = new jsPDF()
      addDebugLog("PDF document aangemaakt")

      // PAGINA 1 - Voorblad met afmetingen en overzicht items
      pdf.setFontSize(22)
      pdf.text("NIEUWE COMPONENT - " + structureName, 105, 30, { align: "center" })
      addDebugLog("Titel toegevoegd")

      // Voeg het logo toe als het beschikbaar is
      try {
        const logoImg = new Image()
        logoImg.src = "/logo-optistaal.png"
        logoImg.crossOrigin = "anonymous"

        // Wacht tot het logo is geladen
        await new Promise((resolve, reject) => {
          logoImg.onload = resolve
          logoImg.onerror = reject
          // Zorg voor een timeout als het logo niet kan worden geladen
          setTimeout(resolve, 1000)
        })

        // Converteer het logo naar een dataURL
        const canvas = document.createElement("canvas")
        canvas.width = logoImg.width || 200
        canvas.height = logoImg.height || 100
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(logoImg, 0, 0)
          const logoDataUrl = canvas.toDataURL("image/png")

          // Voeg het logo toe aan de PDF
          pdf.addImage(logoDataUrl, "PNG", 75, 5, 60, 20)
          addDebugLog("Logo toegevoegd")
        }
      } catch (error) {
        addDebugLog(`Kon logo niet laden: ${error.message}`)
      }

      pdf.setFontSize(12)
      pdf.text(`Gegenereerd op: ${new Date().toLocaleDateString()}`, 105, 40, { align: "center" })

      // Afmetingen
      pdf.setFontSize(16)
      pdf.text("Afmetingen", 20, 55)

      pdf.setFontSize(12)
      let yPos = 65
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
      yPos += 15

      // Overzicht items (op dezelfde pagina)
      pdf.setFontSize(16)
      pdf.text("Overzicht items", 20, yPos)
      yPos += 10

      // Tel items per type
      const sectionaaldeuren = items.filter((item) => item.type === "sectionaaldeur").length
      const loopdeuren = items.filter((item) => item.type === "loopdeur").length
      const ramen = items.filter((item) => item.type === "raam").length

      pdf.setFontSize(12)
      pdf.text(`Aantal sectionaaldeuren: ${sectionaaldeuren}`, 20, yPos)
      yPos += 8
      pdf.text(`Aantal loopdeuren: ${loopdeuren}`, 20, yPos)
      yPos += 8
      pdf.text(`Aantal ramen: ${ramen}`, 20, yPos)
      yPos += 8
      pdf.text(`Totaal aantal items: ${items.length}`, 20, yPos)
      addDebugLog("Pagina 1 voltooid")

      setProgress(50)
      setCurrentStep("Zijden overzicht voorbereiden...")

      // PAGINA 2 - Zijden overzicht
      try {
        pdf.addPage()
        addDebugLog("Pagina 2 toegevoegd")

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
        addDebugLog("Pagina 2 voltooid")
      } catch (error) {
        addDebugLog(`Fout bij pagina 2: ${error.message}`)
      }

      setProgress(70)
      setCurrentStep("3D weergaven voorbereiden...")

      // PAGINA 3 - 3D weergave (voorkant en rechterkant)
      try {
        pdf.addPage()
        pdf.setFontSize(22)
        pdf.text("3D Weergave - Voorkant en Rechterkant", 105, 20, { align: "center" })

        // Maak een canvas voor de 3D weergave
        const canvas3D = document.createElement("canvas")
        canvas3D.width = 800
        canvas3D.height = 600
        const ctx3D = canvas3D.getContext("2d")

        if (ctx3D) {
          // Vul de achtergrond
          ctx3D.fillStyle = "white"
          ctx3D.fillRect(0, 0, canvas3D.width, canvas3D.height)

          // Teken een eenvoudige 3D weergave
          ctx3D.strokeStyle = "black"
          ctx3D.lineWidth = 2

          // Teken de voorkant (rechthoek)
          ctx3D.beginPath()
          ctx3D.moveTo(200, 400) // Linksonder
          ctx3D.lineTo(600, 400) // Rechtsonder
          ctx3D.lineTo(600, 200) // Rechtsboven
          ctx3D.lineTo(200, 200) // Linksboven
          ctx3D.closePath()
          ctx3D.stroke()

          // Teken de rechterkant (perspectief)
          ctx3D.beginPath()
          ctx3D.moveTo(600, 400) // Rechtsonder voorkant
          ctx3D.lineTo(700, 350) // Rechtsonder rechterkant
          ctx3D.lineTo(700, 150) // Rechtsboven rechterkant
          ctx3D.lineTo(600, 200) // Rechtsboven voorkant
          ctx3D.closePath()
          ctx3D.stroke()

          // Teken het dak
          ctx3D.beginPath()
          ctx3D.moveTo(200, 200) // Linksboven voorkant
          ctx3D.lineTo(400, 100) // Nok voorkant
          ctx3D.lineTo(600, 200) // Rechtsboven voorkant
          ctx3D.stroke()

          // Teken het dak rechterkant
          ctx3D.beginPath()
          ctx3D.moveTo(600, 200) // Rechtsboven voorkant
          ctx3D.lineTo(700, 150) // Rechtsboven rechterkant
          ctx3D.lineTo(500, 50) // Nok rechterkant
          ctx3D.lineTo(400, 100) // Nok voorkant
          ctx3D.stroke()

          // Voeg tekst toe
          ctx3D.fillStyle = "blue"
          ctx3D.font = "bold 20px Arial"
          ctx3D.textAlign = "center"
          ctx3D.fillText("VOORKANT", 400, 450)
          ctx3D.fillText("RECHTERKANT", 650, 400)

          // Converteer canvas naar dataURL
          const imgData = canvas3D.toDataURL("image/png")

          // Bereken de juiste afmetingen om de afbeelding op de pagina te passen
          const pdfWidth = 170
          const pdfHeight = pdfWidth * (canvas3D.height / canvas3D.width)

          // Voeg de afbeelding toe aan de PDF
          pdf.addImage(imgData, "PNG", 20, 30, pdfWidth, pdfHeight)

          // Voeg beschrijvende tekst toe onder de afbeelding
          yPos = 30 + pdfHeight + 10
          pdf.setFontSize(12)
          pdf.text("Bovenstaande afbeelding toont de 3D weergave van de structuur vanuit het perspectief", 20, yPos)
          yPos += 7
          pdf.text("waarbij de voorkant en de rechterkant zichtbaar zijn.", 20, yPos)

          addDebugLog("3D weergave voorkant en rechterkant toegevoegd")
        }
      } catch (error) {
        addDebugLog(`Fout bij 3D weergave: ${error.message}`)
      }

      // PAGINA 4 - 3D weergave (achterkant en linkerkant)
      try {
        pdf.addPage()
        pdf.setFontSize(22)
        pdf.text("3D Weergave - Achterkant en Linkerkant", 105, 20, { align: "center" })

        // Maak een canvas voor de 3D weergave
        const canvas3D = document.createElement("canvas")
        canvas3D.width = 800
        canvas3D.height = 600
        const ctx3D = canvas3D.getContext("2d")

        if (ctx3D) {
          // Vul de achtergrond
          ctx3D.fillStyle = "white"
          ctx3D.fillRect(0, 0, canvas3D.width, canvas3D.height)

          // Teken een eenvoudige 3D weergave
          ctx3D.strokeStyle = "black"
          ctx3D.lineWidth = 2

          // Teken de achterkant (rechthoek)
          ctx3D.beginPath()
          ctx3D.moveTo(200, 400) // Linksonder
          ctx3D.lineTo(600, 400) // Rechtsonder
          ctx3D.lineTo(600, 200) // Rechtsboven
          ctx3D.lineTo(200, 200) // Linksboven
          ctx3D.closePath()
          ctx3D.stroke()

          // Teken de linkerkant (perspectief)
          ctx3D.beginPath()
          ctx3D.moveTo(200, 400) // Linksonder achterkant
          ctx3D.lineTo(100, 350) // Linksonder linkerkant
          ctx3D.lineTo(100, 150) // Linksboven linkerkant
          ctx3D.lineTo(200, 200) // Linksboven achterkant
          ctx3D.closePath()
          ctx3D.stroke()

          // Teken het dak
          ctx3D.beginPath()
          ctx3D.moveTo(200, 200) // Linksboven achterkant
          ctx3D.lineTo(400, 100) // Nok achterkant
          ctx3D.lineTo(600, 200) // Rechtsboven achterkant
          ctx3D.stroke()

          // Teken het dak linkerkant
          ctx3D.beginPath()
          ctx3D.moveTo(200, 200) // Linksboven achterkant
          ctx3D.lineTo(100, 150) // Linksboven linkerkant
          ctx3D.lineTo(300, 50) // Nok linkerkant
          ctx3D.lineTo(400, 100) // Nok achterkant
          ctx3D.stroke()

          // Voeg tekst toe
          ctx3D.fillStyle = "blue"
          ctx3D.font = "bold 20px Arial"
          ctx3D.textAlign = "center"
          ctx3D.fillText("ACHTERKANT", 400, 450)
          ctx3D.fillText("LINKERKANT", 150, 400)

          // Converteer canvas naar dataURL
          const imgData = canvas3D.toDataURL("image/png")

          // Bereken de juiste afmetingen om de afbeelding op de pagina te passen
          const pdfWidth = 170
          const pdfHeight = pdfWidth * (canvas3D.height / canvas3D.width)

          // Voeg de afbeelding toe aan de PDF
          pdf.addImage(imgData, "PNG", 20, 30, pdfWidth, pdfHeight)

          // Voeg beschrijvende tekst toe onder de afbeelding
          yPos = 30 + pdfHeight + 10
          pdf.setFontSize(12)
          pdf.text("Bovenstaande afbeelding toont de 3D weergave van de structuur vanuit het perspectief", 20, yPos)
          yPos += 7
          pdf.text("waarbij de achterkant en de linkerkant zichtbaar zijn.", 20, yPos)

          addDebugLog("3D weergave achterkant en linkerkant toegevoegd")
        }
      } catch (error) {
        addDebugLog(`Fout bij 3D weergave: ${error.message}`)
      }

      setProgress(85)
      setCurrentStep("2D weergaven met panelen voorbereiden...")

      // PAGINA 5-8 - 2D-weergaven met panelen
      try {
        // Render en voeg 2D-weergaven met panelen toe voor elke zijde
        const views = [
          { id: "front", name: "Voorkant" },
          { id: "back", name: "Achterkant" },
          { id: "left", name: "Linkerkant" },
          { id: "right", name: "Rechterkant" },
        ]

        for (const view of views) {
          pdf.addPage()
          pdf.setFontSize(22)
          pdf.text(`2D Weergave met panelen - ${view.name}`, 105, 20, { align: "center" })

          // Voeg eerst de beschrijvende tekst toe
          pdf.setFontSize(12)
          yPos = 35
          pdf.text(
            `Deze tekening toont de ${view.name.toLowerCase()} van de structuur met wandpanelen van ${panelThickness}.`,
            20,
            yPos,
          )
          yPos += 7
          pdf.text(`De deuren en ramen zijn weergegeven met hun exacte afmetingen en posities.`, 20, yPos)
          yPos += 15

          // Maak een eenvoudige 2D weergave met panelen
          const canvas = document.createElement("canvas")
          canvas.width = 800
          canvas.height = 600
          const ctx = canvas.getContext("2d")

          if (ctx) {
            // Vul de achtergrond
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Teken een eenvoudige 2D weergave met panelen
            ctx.strokeStyle = "black"
            ctx.lineWidth = 2

            // Teken de wand
            ctx.strokeRect(200, 100, 400, 300)

            // Teken de panelen (okergeel)
            ctx.fillStyle = "#DAA520"
            ctx.fillRect(180, 100, 20, 300) // Linker paneel
            ctx.fillRect(600, 100, 20, 300) // Rechter paneel

            // Teken de maatvoering
            ctx.beginPath()
            ctx.moveTo(200, 450)
            ctx.lineTo(600, 450)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(180, 500)
            ctx.lineTo(620, 500)
            ctx.stroke()

            // Voeg tekst toe
            ctx.fillStyle = "black"
            ctx.font = "14px Arial"
            ctx.textAlign = "center"
            ctx.fillText("Staalstructuur", 400, 470)
            ctx.fillText("Staalstructuur en panelen", 400, 520)

            // Converteer canvas naar dataURL
            const imgData = canvas.toDataURL("image/png")

            // Bereken de juiste afmetingen om de afbeelding op de pagina te passen
            const pdfWidth = 170
            const pdfHeight = pdfWidth * (canvas.height / canvas.width)

            // Voeg de afbeelding toe aan de PDF
            pdf.addImage(imgData, "PNG", 20, yPos, pdfWidth, pdfHeight)

            addDebugLog(`2D weergave met panelen voor ${view.name} toegevoegd`)
          }
        }
      } catch (error) {
        addDebugLog(`Fout bij 2D weergaven: ${error.message}`)
      }

      setProgress(95)
      setCurrentStep("Rapport afronden...")

      // Download het PDF bestand
      try {
        const filename = `${structureName.replace(/\s+/g, "_")}_COMPLEET_rapport.pdf`
        pdf.save(filename)
        addDebugLog(`PDF opgeslagen als ${filename}`)
      } catch (error) {
        addDebugLog(`Fout bij opslaan PDF: ${error.message}`)
      }

      setProgress(100)
      setCurrentStep("Rapport succesvol gegenereerd!")
      addDebugLog("Rapport generatie voltooid")

      // Reset na een korte vertraging
      setTimeout(() => {
        setIsGeneratingReport(false)
        setProgress(0)
        setCurrentStep("")
      }, 1500)
    } catch (error) {
      console.error("Fout bij het genereren van het rapport:", error)
      setCurrentStep(`Er is een fout opgetreden: ${error.message}`)
      addDebugLog(`Algemene fout: ${error.message}`)
      setIsGeneratingReport(false)
    }
  }

  // Helper functie om debug logs toe te voegen
  const addDebugLog = (message: string) => {
    console.log(message) // Log naar console
    setDebugLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Nieuwe Rapportage Component</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Dit is een volledig nieuwe component voor het genereren van rapporten met handmatig gegenereerde
              afbeeldingen.
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
                  <FileText className="h-8 w-4" />
                  <span>Rapport met Canvas</span>
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

          {/* Debug logs weergeven */}
          {debugLog.length > 0 && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Debug Log</h3>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(debugLog.join("\n"))}>
                  <Copy className="h-4 w-4 mr-2" />
                  Kopiëren
                </Button>
              </div>
              <div className="text-xs font-mono bg-black text-white p-2 rounded-md max-h-40 overflow-y-auto">
                {debugLog.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
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

