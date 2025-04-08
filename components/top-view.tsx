"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer, ZoomIn, ZoomOut } from "lucide-react"
import type { ItemData } from "./items-menu"

type TopViewProps = {
  dimensions: {
    width: number
    length: number
    gutterHeight: number
    roofAngle: number
  }
  items: ItemData[]
  onPrint?: () => void
  canvasRef?: React.RefObject<HTMLCanvasElement>
  structureName: string
}

export default function TopView({
  dimensions,
  items,
  onPrint,
  canvasRef: externalCanvasRef,
  structureName,
}: TopViewProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = externalCanvasRef || internalCanvasRef
  const [scale, setScale] = useState(40) // pixels per meter

  // Render de bovenaanzicht wanneer de component mount of wanneer dimensions/items veranderen
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Bereken de afmetingen van de canvas
    const structureWidth = dimensions.width
    const structureLength = dimensions.length

    // Bereken de canvas grootte op basis van de schaal
    const canvasWidth = structureWidth * scale + 500 // Extra ruimte voor maatvoering
    const canvasHeight = structureLength * scale + 500 // Extra ruimte voor maatvoering

    // Stel de canvas grootte in
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Wis de canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Startpositie voor de tekening (met marge)
    const startX = 150
    const startY = 150

    // Teken de buitenmaten van de staalstructuur (rechthoek)
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.strokeRect(startX, startY, structureWidth * scale, structureLength * scale)

    // Teken dimension lines voor de hoofdafmetingen
    // Horizontale dimension line voor de breedte
    const labelYOffset = 25
    const dimensionLineOffset = 50
    drawDimensionLine(
      ctx,
      startX,
      startY - dimensionLineOffset,
      startX + structureWidth * scale,
      startY - dimensionLineOffset,
      `${Math.round(structureWidth * 1000)}mm`,
      false,
      true,
    )

    // Voeg label "Staalstructuur" toe boven de dimensielijn
    ctx.fillStyle = "black"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Staalstructuur", startX + (structureWidth * scale) / 2, startY - labelYOffset - dimensionLineOffset)

    // Verticale dimension line voor de lengte
    drawDimensionLine(
      ctx,
      startX - 50,
      startY,
      startX - 50,
      startY + structureLength * scale,
      `${Math.round(structureLength * 1000)}mm`,
      true,
      true,
    )

    // Groepeer items per wand
    const frontItems = items.filter((item) => item.wall === "front")
    const backItems = items.filter((item) => item.wall === "back")
    const leftItems = items.filter((item) => item.wall === "left")
    const rightItems = items.filter((item) => item.wall === "right")

    // Genereer namen voor items als ze nog geen naam hebben
    const itemCounts = {
      sectionaaldeur: 0,
      loopdeur: 0,
      raam: 0,
    }

    // Tel alle items per type
    const allItems = [...frontItems, ...backItems, ...leftItems, ...rightItems]
    allItems.forEach((item) => {
      if (!item.name) {
        itemCounts[item.type]++
      }
    })

    // Sorteer items op positie (van links naar rechts of van boven naar beneden)
    frontItems.sort((a, b) => a.position - b.position)
    backItems.sort((a, b) => a.position - b.position)
    leftItems.sort((a, b) => a.position - b.position)
    rightItems.sort((a, b) => a.position - b.position)

    // Teken items op de voorkant (onderaan in bovenaanzicht)
    drawWallItems(
      ctx,
      frontItems,
      startX,
      startY + structureLength * scale,
      structureWidth,
      "bottom",
      scale,
      itemCounts,
    )

    // Teken items op de achterkant (bovenaan in bovenaanzicht)
    drawWallItems(ctx, backItems, startX, startY, structureWidth, "top", scale, itemCounts)

    // Teken items op de linkerkant (links in bovenaanzicht)
    drawWallItems(ctx, leftItems, startX, startY, structureLength, "left", scale, itemCounts)

    // Teken items op de rechterkant (rechts in bovenaanzicht)
    drawWallItems(ctx, rightItems, startX + structureWidth * scale, startY, structureLength, "right", scale, itemCounts)

    // Teken een titel
    ctx.font = "20px Arial"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    ctx.fillText("Bovenaanzicht", canvasWidth / 2, 50)

    // Verplaats de legenda naar het midden van de structuur
    const legendX = startX + (structureWidth * scale) / 2 - 50
    const legendY = startY + (structureLength * scale) / 2 - 60

    // Teken een legenda
    ctx.font = "16px Arial"
    ctx.fillStyle = "black"
    ctx.textAlign = "left"
    ctx.fillText("Legenda:", legendX, legendY)

    // Sectionaaldeur
    ctx.fillStyle = "#ADD8E6" // Lichtblauw
    ctx.fillRect(legendX, legendY + 20, 20, 20)
    ctx.strokeRect(legendX, legendY + 20, 20, 20)
    ctx.fillStyle = "#00008B" // Donkerblauw
    ctx.fillText("Sectionaaldeur", legendX + 30, legendY + 35)

    // Loopdeur
    ctx.fillStyle = "#90EE90" // Lichtgroen
    ctx.fillRect(legendX, legendY + 50, 20, 20)
    ctx.strokeRect(legendX, legendY + 50, 20, 20)
    ctx.fillStyle = "#006400" // Donkergroen
    ctx.fillText("Loopdeur", legendX + 30, legendY + 65)

    // Raam
    ctx.fillStyle = "#FFCCCB" // Lichtroze
    ctx.fillRect(legendX, legendY + 80, 20, 20)
    ctx.strokeRect(legendX, legendY + 80, 20, 20)
    ctx.fillStyle = "#FF0000" // Rood
    ctx.fillText("Raam", legendX + 30, legendY + 95)

    // Voeg een aanduiding voor de voorzijde toe in de structuur
    ctx.fillStyle = "black"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("VOORZIJDE", startX + (structureWidth * scale) / 2, startY + structureLength * scale - 20)
  }, [dimensions, items, scale, structureName])

  // Functie om items op een wand te tekenen
  function drawWallItems(
    ctx: CanvasRenderingContext2D,
    items: ItemData[],
    startX: number,
    startY: number,
    wallLength: number,
    position: "top" | "bottom" | "left" | "right",
    scale: number,
    itemCounts: { sectionaaldeur: number; loopdeur: number; raam: number },
  ) {
    if (items.length === 0) return

    const itemThickness = 0.2 // 200mm dikte voor items in bovenaanzicht

    // Genereer namen voor items als ze nog geen naam hebben
    const typeCounts = { ...itemCounts }
    const itemsWithNames = items.map((item, index) => {
      let itemName = item.name
      if (!itemName) {
        const count = typeCounts[item.type] - (items.length - 1 - index)
        itemName = `${item.type === "raam" ? "Raam" : item.type === "loopdeur" ? "Loopdeur" : "Sectionaaldeur"} ${count}`
      }
      return { ...item, displayName: itemName }
    })

    itemsWithNames.forEach((item) => {
      // Bereken de extra ruimte voor de opening in het staal
      // 1mm extra aan elke kant voor standaard dagmaten
      const extraWidth = item.type === "loopdeur" ? 0.002 : 0.002 // 2mm extra voor loopdeur, 2mm voor sectionaaldeur

      const itemWidth = item.width / 1000 // Convert mm to meters
      const itemPosition = item.position // Position is already in meters
      const steelOpeningWidth = itemWidth + extraWidth

      // Bepaal de kleur voor het item op basis van het type
      let itemColor = "lightblue"
      let itemTextColor = "black"
      if (item.type === "sectionaaldeur") {
        itemColor = "#ADD8E6" // Lichtblauw
        itemTextColor = "#00008B" // Donkerblauw
      } else if (item.type === "loopdeur") {
        itemColor = "#90EE90" // Lichtgroen
        itemTextColor = "#006400" // Donkergroen
      } else if (item.type === "raam") {
        itemColor = "#FFCCCB" // Lichtroze
        itemTextColor = "#FF0000" // Rood
      }

      // Bereken de positie op de canvas afhankelijk van de wand
      let itemX = 0
      let itemY = 0
      let itemDisplayWidth = 0
      let itemDisplayHeight = 0
      let steelX = 0
      let steelY = 0
      let steelDisplayWidth = 0
      let steelDisplayHeight = 0

      switch (position) {
        case "top": // Achterkant (bovenaan in bovenaanzicht)
          // Volledig omgekeerde positionering voor de achterkant
          itemX = startX + (wallLength - itemPosition - itemWidth) * scale
          itemY = startY - itemThickness * scale
          itemDisplayWidth = itemWidth * scale
          itemDisplayHeight = itemThickness * scale

          // Staalopening (iets groter)
          steelX = startX + (wallLength - itemPosition - itemWidth - extraWidth / 2) * scale
          steelY = startY - itemThickness * scale
          steelDisplayWidth = steelOpeningWidth * scale
          steelDisplayHeight = itemThickness * scale
          break
        case "bottom": // Voorkant (onderaan in bovenaanzicht)
          itemX = startX + itemPosition * scale
          itemY = startY
          itemDisplayWidth = itemWidth * scale
          itemDisplayHeight = itemThickness * scale

          // Staalopening (iets groter)
          steelX = startX + (itemPosition - extraWidth / 2) * scale
          steelY = startY
          steelDisplayWidth = steelOpeningWidth * scale
          steelDisplayHeight = itemThickness * scale
          break
        case "left": // Linkerkant (links in bovenaanzicht)
          itemX = startX - itemThickness * scale
          itemY = startY + itemPosition * scale
          itemDisplayWidth = itemThickness * scale
          itemDisplayHeight = itemWidth * scale

          // Staalopening (iets groter)
          steelX = startX - itemThickness * scale
          steelY = startY + (itemPosition - extraWidth / 2) * scale
          steelDisplayWidth = itemThickness * scale
          steelDisplayHeight = steelOpeningWidth * scale
          break
        case "right": // Rechterkant (rechts in bovenaanzicht)
          // Volledig omgekeerde positionering voor de rechterkant
          itemX = startX
          itemY = startY + (wallLength - itemPosition - itemWidth) * scale
          itemDisplayWidth = itemThickness * scale
          itemDisplayHeight = itemWidth * scale

          // Staalopening (iets groter)
          steelX = startX
          steelY = startY + (wallLength - itemPosition - itemWidth - extraWidth / 2) * scale
          steelDisplayWidth = itemThickness * scale
          steelDisplayHeight = steelOpeningWidth * scale
          break
      }

      // Teken eerst de staalopening met stippellijn
      // ctx.setLineDash([5, 5])
      // ctx.strokeStyle = "#555555"
      // ctx.strokeRect(steelX, steelY, steelDisplayWidth, steelDisplayHeight)
      // ctx.setLineDash([])
      // ctx.strokeStyle = "black"

      // Teken het item
      ctx.fillStyle = itemColor
      ctx.fillRect(itemX, itemY, itemDisplayWidth, itemDisplayHeight)
      ctx.strokeRect(itemX, itemY, itemDisplayWidth, itemDisplayHeight)

      // Teken de item naam en breedte
      ctx.fillStyle = itemTextColor
      ctx.font = "12px Arial"
      ctx.textAlign = "center"

      // Positie voor de label afhankelijk van de wand
      let labelX = 0
      let labelY = 0
      let nameX = 0
      let nameY = 0

      // Zorg voor consistente afstanden tussen labels (gebruik dezelfde labelYOffset als in 2D views)
      const labelYOffset = 25

      // Bereken de aangepaste afmetingen voor deuren
      const panelThicknessValue = 60 // Gebruik een vaste waarde van 60mm
      const doorOpeningTypeValue = "Dagmaten + isolatie" // Gebruik een vaste waarde
      let itemDisplayWidthMM = item.width

      if (
        (item.type === "sectionaaldeur" || item.type === "loopdeur") &&
        doorOpeningTypeValue === "Dagmaten + isolatie"
      ) {
        itemDisplayWidthMM = item.width + panelThicknessValue * 2 // Voeg twee keer de paneeldikte toe aan de breedte
      } else {
        // Voor standaard dagmaten, voeg 2mm toe voor speling
        itemDisplayWidthMM = item.width + 2
      }

      switch (position) {
        case "top":
          labelX = itemX + itemDisplayWidth / 2
          labelY = itemY - 10
          nameX = labelX
          nameY = itemY - labelYOffset

          // Teken de breedte
          ctx.fillText(`${itemDisplayWidthMM}mm`, labelX, labelY)

          // Teken de naam
          ctx.fillText(item.displayName, nameX, nameY)
          break
        case "bottom":
          labelX = itemX + itemDisplayWidth / 2
          labelY = itemY + itemDisplayHeight + 20
          nameX = labelX
          nameY = itemY + itemDisplayHeight + labelYOffset

          // Teken de breedte
          ctx.fillText(`${itemDisplayWidthMM}mm`, labelX, labelY)

          // Teken de naam
          ctx.fillText(item.displayName, nameX, nameY)
          break
        case "left":
          labelX = itemX - 10
          labelY = itemY + itemDisplayHeight / 2
          nameX = itemX - labelYOffset
          nameY = labelY - 15
          ctx.save()
          ctx.translate(labelX, labelY)
          ctx.rotate(-Math.PI / 2)
          ctx.textAlign = "center"
          ctx.fillText(`${itemDisplayWidthMM}mm`, 0, 0)
          ctx.restore()

          // Teken de naam
          ctx.save()
          ctx.translate(nameX, nameY)
          ctx.rotate(-Math.PI / 2)
          ctx.textAlign = "center"
          ctx.fillText(item.displayName, 0, 0)
          ctx.restore()
          break
        case "right":
          labelX = itemX + itemDisplayWidth + 10
          labelY = itemY + itemDisplayHeight / 2
          nameX = itemX + itemDisplayWidth + labelYOffset
          nameY = labelY - 15
          ctx.save()
          ctx.translate(labelX, labelY)
          ctx.rotate(-Math.PI / 2)
          ctx.textAlign = "center"
          ctx.fillText(`${itemDisplayWidthMM}mm`, 0, 0)
          ctx.restore()

          // Teken de naam
          ctx.save()
          ctx.translate(nameX, nameY)
          ctx.rotate(-Math.PI / 2)
          ctx.textAlign = "center"
          ctx.fillText(item.displayName, 0, 0)
          ctx.restore()
          break
      }
    })

    // Teken afstanden tussen items en tot de randen als er meer dan één item is
    if (items.length > 1) {
      // Bereken de positie voor de dimension line afhankelijk van de wand
      let dimensionLineX = 0
      let dimensionLineY = 0
      let dimensionLineLength = 0

      switch (position) {
        case "top":
          dimensionLineX = startX
          dimensionLineY = startY - 80
          dimensionLineLength = wallLength * scale
          break
        case "bottom":
          dimensionLineX = startX
          dimensionLineY = startY + 80
          dimensionLineLength = wallLength * scale
          break
        case "left":
          dimensionLineX = startX - 80
          dimensionLineY = startY
          dimensionLineLength = wallLength * scale
          break
        case "right":
          dimensionLineX = startX + 80
          dimensionLineY = startY
          dimensionLineLength = wallLength * scale
          break
      }

      // Teken de hoofdlijn
      ctx.beginPath()
      if (position === "top" || position === "bottom") {
        ctx.moveTo(dimensionLineX, dimensionLineY)
        ctx.lineTo(dimensionLineX + dimensionLineLength, dimensionLineY)
      } else {
        ctx.moveTo(dimensionLineX, dimensionLineY)
        ctx.lineTo(dimensionLineX, dimensionLineY + dimensionLineLength)
      }
      ctx.stroke()

      // Voeg label "Afstanden" toe boven de dimensielijn
      ctx.fillStyle = "black"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"

      if (position === "top") {
        ctx.fillText("Afstanden", dimensionLineX + dimensionLineLength / 2, dimensionLineY - 20)
      } else if (position === "bottom") {
        ctx.fillText("Afstanden", dimensionLineX + dimensionLineLength / 2, dimensionLineY - 20)
      } else if (position === "left") {
        ctx.save()
        ctx.translate(dimensionLineX - 20, dimensionLineY + dimensionLineLength / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText("Afstanden", 0, 0)
        ctx.restore()
      } else if (position === "right") {
        ctx.save()
        ctx.translate(dimensionLineX - 20, dimensionLineY + dimensionLineLength / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText("Afstanden", 0, 0)
        ctx.restore()
      }

      // Teken verticale/horizontale lijnen voor elk item en de afstanden
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const itemWidth = item.width / 1000
        const itemPosition = item.position

        // Bereken de positie op de dimension line
        let startPos = 0
        let endPos = 0

        if (position === "top" || position === "bottom") {
          startPos = dimensionLineX + itemPosition * scale
          endPos = startPos + itemWidth * scale

          // Teken verticale lijnen
          ctx.beginPath()
          ctx.moveTo(startPos, dimensionLineY - 5)
          ctx.lineTo(startPos, dimensionLineY + 5)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(endPos, dimensionLineY - 5)
          ctx.lineTo(endPos, dimensionLineY + 5)
          ctx.stroke()
        } else {
          startPos = dimensionLineY + itemPosition * scale
          endPos = startPos + itemWidth * scale

          // Teken horizontale lijnen
          ctx.beginPath()
          ctx.moveTo(dimensionLineX - 5, startPos)
          ctx.lineTo(dimensionLineX + 5, startPos)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(dimensionLineX - 5, endPos)
          ctx.lineTo(dimensionLineX + 5, endPos)
          ctx.stroke()
        }

        // Teken de afstand vanaf links/boven (voor het eerste item)
        if (i === 0 && itemPosition > 0) {
          ctx.textAlign = "center"
          ctx.fillStyle = "black"

          if (position === "top" || position === "bottom") {
            ctx.fillText(
              `${Math.round(itemPosition * 1000)}mm`,
              dimensionLineX + (itemPosition * scale) / 2,
              dimensionLineY + (position === "top" ? -10 : 20),
            )
          } else {
            ctx.save()
            ctx.translate(
              dimensionLineX + (position === "left" ? -20 : 20),
              dimensionLineY + (itemPosition * scale) / 2,
            )
            ctx.rotate(position === "left" ? -Math.PI / 2 : -Math.PI / 2)
            ctx.fillText(`${Math.round(itemPosition * 1000)}mm`, 0, 0)
            ctx.restore()
          }
        }

        // Teken de afstand tussen items
        if (i < items.length - 1) {
          const nextItem = items[i + 1]
          const distanceBetween = nextItem.position - (itemPosition + itemWidth)

          if (distanceBetween > 0) {
            ctx.textAlign = "center"
            ctx.fillStyle = "black"

            if (position === "top" || position === "bottom") {
              ctx.fillText(
                `${Math.round(distanceBetween * 1000)}mm`,
                endPos + (distanceBetween * scale) / 2,
                dimensionLineY + (position === "top" ? -10 : 20),
              )
            } else {
              ctx.save()
              ctx.translate(dimensionLineX + (position === "left" ? -20 : 20), endPos + (distanceBetween * scale) / 2)
              ctx.rotate(position === "left" ? -Math.PI / 2 : -Math.PI / 2)
              ctx.fillText(`${Math.round(distanceBetween * 1000)}mm`, 0, 0)
              ctx.restore()
            }
          }
        }

        // Teken de afstand naar rechts/onder (voor het laatste item)
        if (i === items.length - 1) {
          const distanceToEnd = wallLength - (itemPosition + itemWidth)
          if (distanceToEnd > 0) {
            ctx.textAlign = "center"
            ctx.fillStyle = "black"

            if (position === "top" || position === "bottom") {
              ctx.fillText(
                `${Math.round(distanceToEnd * 1000)}mm`,
                endPos + (distanceToEnd * scale) / 2,
                dimensionLineY + (position === "top" ? -10 : 20),
              )
            } else {
              ctx.save()
              ctx.translate(dimensionLineX + (position === "left" ? -20 : 20), endPos + (distanceToEnd * scale) / 2)
              ctx.rotate(position === "left" ? -Math.PI / 2 : -Math.PI / 2)
              ctx.fillText(`${Math.round(distanceToEnd * 1000)}mm`, 0, 0)
              ctx.restore()
            }
          }
        }
      }
    }
  }

  // Functie om dimension lines te tekenen
  function drawDimensionLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    text: string,
    vertical = false,
    showText = true,
    textColor = "black",
  ) {
    const arrowSize = 10
    const endLineLength = 5
    const textOffset = 20 // Verhoogd van standaard 10 naar 20 voor meer ruimte

    // Teken de hoofdlijn
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()

    if (vertical) {
      // Verticale lijn
      // Teken kleine horizontale lijntjes aan de uiteinden
      ctx.beginPath()
      ctx.moveTo(x1 - endLineLength, y1)
      ctx.lineTo(x1 + endLineLength, y1)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x2 - endLineLength, y2)
      ctx.lineTo(x2 + endLineLength, y2)
      ctx.stroke()

      // Teken pijlpunten
      // Bovenste pijlpunt
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x1 - arrowSize / 2, y1 + arrowSize)
      ctx.lineTo(x1 + arrowSize / 2, y1 + arrowSize)
      ctx.closePath()
      ctx.fillStyle = "black"
      ctx.fill()

      // Onderste pijlpunt
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - arrowSize / 2, y2 - arrowSize)
      ctx.lineTo(x2 + arrowSize / 2, y2 - arrowSize)
      ctx.closePath()
      ctx.fillStyle = "black"
      ctx.fill()

      // Teken tekst verticaal
      if (showText) {
        ctx.save()
        ctx.translate(x1 - textOffset, (y1 + y2) / 2) // Verhoogde offset
        ctx.rotate(-Math.PI / 2)
        ctx.textAlign = "center"
        ctx.fillStyle = textColor
        ctx.font = "14px Arial"
        ctx.fillText(text, 0, 0)
        ctx.restore()
      }
    } else {
      // Horizontale lijn
      // Teken kleine verticale lijntjes aan de uiteinden
      ctx.beginPath()
      ctx.moveTo(x1, y1 - endLineLength)
      ctx.lineTo(x1, y1 + endLineLength)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(x2, y2 - endLineLength)
      ctx.lineTo(x2, y2 + endLineLength)
      ctx.stroke()

      // Teken pijlpunten
      // Linker pijlpunt
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x1 + arrowSize, y1 - arrowSize / 2)
      ctx.lineTo(x1 + arrowSize, y1 + arrowSize / 2)
      ctx.closePath()
      ctx.fillStyle = "black"
      ctx.fill()

      // Rechter pijlpunt
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - arrowSize, y2 - arrowSize / 2)
      ctx.lineTo(x2 - arrowSize, y2 + arrowSize / 2)
      ctx.closePath()
      ctx.fillStyle = "black"
      ctx.fill()

      // Teken tekst horizontaal
      if (showText) {
        ctx.textAlign = "center"
        ctx.fillStyle = textColor
        ctx.font = "14px Arial"
        ctx.fillText(text, (x1 + x2) / 2, y1 - textOffset) // Verhoogde offset
      }
    }
  }

  // Functie om de bovenaanzicht te downloaden als afbeelding
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = `${structureName.replace(/\s+/g, "_")}_bovenaanzicht.png`
    link.click()
  }

  // Functie om de bovenaanzicht te printen
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bovenaanzicht</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100vh; }
          </style>
        </head>
        <body>
          <img src="${image}" />
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Bovenaanzicht Staalstructuur</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-md p-2 overflow-auto max-h-[600px]">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ minHeight: "300px" }} />
          </div>

          <div className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setScale(scale + 10)} disabled={scale >= 100}>
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </Button>
              <Button variant="outline" onClick={() => setScale(Math.max(10, scale - 10))} disabled={scale <= 10}>
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Uit
              </Button>
            </div>
            <div className="space-x-2">
              <Button onClick={handleDownload} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Downloaden
              </Button>
              <Button onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Printen
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
