"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ItemData } from "./items-menu"

// Voeg de structureName prop toe aan de component
type TwoDPanelsViewProps = {
  dimensions: {
    width: number
    length: number
    gutterHeight: number
    roofAngle: number
  }
  items: ItemData[]
  selectedView: "front" | "back" | "left" | "right"
  onSelectView: (view: "front" | "back" | "left" | "right") => void
  panelThickness: string
  doorOpeningType: string
  onPrint?: () => void
  canvasRef?: React.RefObject<HTMLCanvasElement>
  structureName?: string
}

// Gebruik de structureName prop in de component
export default function TwoDPanelsView({
  dimensions,
  items,
  selectedView,
  onSelectView,
  panelThickness,
  doorOpeningType,
  onPrint,
  canvasRef: externalCanvasRef,
  structureName = "Mijn Structuur", // Default waarde
}: TwoDPanelsViewProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = externalCanvasRef || internalCanvasRef
  const [scale, setScale] = useState(40) // pixels per meter

  // Render de 2D-weergave wanneer de component mount of wanneer dimensions/items veranderen
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Bereken de afmetingen van de canvas
    let wallWidth = 0
    const wallHeight = dimensions.gutterHeight

    if (selectedView === "front" || selectedView === "back") {
      wallWidth = dimensions.width
    } else {
      wallWidth = dimensions.length
    }

    // Bereken de dakhoogte op basis van de hoek en breedte
    const roofHeight = (dimensions.width / 2) * Math.tan((dimensions.roofAngle * Math.PI) / 180)
    const totalHeight = wallHeight + roofHeight

    // Bereken de paneel dikte in meters
    const panelThicknessValue = Number.parseInt(panelThickness.replace("mm", "")) / 1000

    // Bereken de canvas grootte op basis van de schaal
    const canvasWidth = (wallWidth + panelThicknessValue * 2) * scale + 500 // Extra ruimte voor maatvoering
    const canvasHeight = totalHeight * scale + 500 // Extra ruimte voor maatvoering

    // Stel de canvas grootte in
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Wis de canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Startpositie voor de tekening (met marge)
    const startX = 150
    const startY = 150

    // Teken de wandpanelen (okergeel)
    ctx.fillStyle = "#DAA520" // Okergeel

    // Linker paneel
    ctx.fillRect(startX - panelThicknessValue * scale, startY, panelThicknessValue * scale, wallHeight * scale)

    // Rechter paneel
    ctx.fillRect(startX + wallWidth * scale, startY, panelThicknessValue * scale, wallHeight * scale)

    // Teken de wand en het dak
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2

    // Teken de wand (rechthoek)
    ctx.strokeRect(startX, startY, wallWidth * scale, wallHeight * scale)

    // Teken het dak (driehoek) voor voor- en achterkant
    if (selectedView === "front" || selectedView === "back") {
      ctx.beginPath()
      ctx.moveTo(startX, startY) // Linkerhoek van de wand
      ctx.lineTo(startX + (wallWidth * scale) / 2, startY - roofHeight * scale) // Piek van het dak
      ctx.lineTo(startX + wallWidth * scale, startY) // Rechterhoek van de wand
      ctx.stroke()
    }

    // Teken de items (deuren en ramen) die bij deze wand horen
    const wallItems = items.filter((item) => item.wall === selectedView)

    // Sorteer items op positie (van links naar rechts)
    wallItems.sort((a, b) => a.position - b.position)

    // Genereer namen voor items als ze nog geen naam hebben
    const itemCounts = {
      sectionaaldeur: 0,
      loopdeur: 0,
      raam: 0,
    }

    // Teken elk item
    wallItems.forEach((item) => {
      // Genereer een naam voor het item als het nog geen naam heeft
      let itemName = item.name
      if (!itemName) {
        itemCounts[item.type]++
        itemName = `${item.type === "raam" ? "Raam" : item.type === "loopdeur" ? "Loopdeur" : "Sectionaaldeur"} ${
          itemCounts[item.type]
        }`
      }

      const itemWidth = item.width / 1000 // Convert mm to meters
      const itemHeight = item.height / 1000 // Convert mm to meters
      const itemX = item.position // Position is already in meters

      // Zorg ervoor dat alle items vanaf de juiste positie beginnen
      let itemY = 0
      if (item.type === "raam") {
        // Ramen hebben een elevation vanaf de grond
        itemY = item.elevation / 1000
      } else {
        // Deuren beginnen altijd op de grond (y = 0)
        itemY = 0
      }

      // Bereken de positie op de canvas
      const canvasX = startX + itemX * scale
      const canvasY = startY + wallHeight * scale - itemHeight * scale - itemY * scale

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

      // Teken het item
      ctx.fillStyle = itemColor
      ctx.fillRect(canvasX, canvasY, itemWidth * scale, itemHeight * scale)
      ctx.strokeRect(canvasX, canvasY, itemWidth * scale, itemHeight * scale)

      // Als het een deur is en 'Dagmaten + isolatie' is geselecteerd, teken dan okergele lijnen aan de binnenkant
      if ((item.type === "sectionaaldeur" || item.type === "loopdeur") && doorOpeningType === "Dagmaten + isolatie") {
        ctx.strokeStyle = "#DAA520" // Okergeel
        ctx.lineWidth = 3

        // Teken de okergele lijnen aan de binnenkant van de deuropening
        // Bovenkant
        ctx.beginPath()
        ctx.moveTo(canvasX, canvasY)
        ctx.lineTo(canvasX + itemWidth * scale, canvasY)
        ctx.stroke()

        // Linkerkant
        ctx.beginPath()
        ctx.moveTo(canvasX, canvasY)
        ctx.lineTo(canvasX, canvasY + itemHeight * scale)
        ctx.stroke()

        // Rechterkant
        ctx.beginPath()
        ctx.moveTo(canvasX + itemWidth * scale, canvasY)
        ctx.lineTo(canvasX + itemWidth * scale, canvasY + itemHeight * scale)
        ctx.stroke()

        // Reset de lijnkleur en -dikte
        ctx.strokeStyle = "black"
        ctx.lineWidth = 2
      }

      // Teken de item naam
      ctx.fillStyle = itemTextColor
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText(itemName, canvasX + (itemWidth * scale) / 2, canvasY - 25)

      // Bereken de aangepaste afmetingen voor deuren als 'Dagmaten + isolatie' is geselecteerd
      let displayWidth = item.width
      let displayHeight = item.height

      if ((item.type === "sectionaaldeur" || item.type === "loopdeur") && doorOpeningType === "Dagmaten + isolatie") {
        const panelThicknessInMM = Number.parseInt(panelThickness.replace("mm", ""))
        displayWidth = item.width + panelThicknessInMM * 2 // Voeg twee keer de paneeldikte toe aan de breedte
        displayHeight = item.height + panelThicknessInMM // Voeg één keer de paneeldikte toe aan de hoogte
      }

      // Teken de item breedte in de juiste kleur met eventueel aangepaste afmetingen
      ctx.fillText(
        `${displayWidth}×${displayHeight}mm`,
        canvasX + (itemWidth * scale) / 2,
        canvasY + (itemHeight * scale) / 2 + 10,
      )
    })

    // Teken dimension lines voor de hoofdafmetingen
    // Horizontale dimension line voor de breedte van de staalstructuur
    drawDimensionLine(
      ctx,
      startX,
      startY + wallHeight * scale + 50,
      startX + wallWidth * scale,
      startY + wallHeight * scale + 50,
      `${Math.round(wallWidth * 1000)}mm`,
      false,
      true,
    )

    // Label voor de staalstructuur breedte
    ctx.fillStyle = "black"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Staalstructuur", startX + (wallWidth * scale) / 2, startY + wallHeight * scale + 25)

    // Horizontale dimension line voor de breedte inclusief panelen
    const totalWidth = wallWidth + 2 * panelThicknessValue
    drawDimensionLine(
      ctx,
      startX - panelThicknessValue * scale,
      startY + wallHeight * scale + 100,
      startX + wallWidth * scale + panelThicknessValue * scale,
      startY + wallHeight * scale + 100,
      `${Math.round(totalWidth * 1000)}mm`,
      false,
      true,
    )

    // Label voor de totale breedte inclusief panelen
    ctx.fillStyle = "black"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Staalstructuur en panelen", startX + (wallWidth * scale) / 2, startY + wallHeight * scale + 75)

    // Verticale dimension line voor de goothoogte
    drawDimensionLine(
      ctx,
      startX - 50,
      startY,
      startX - 50,
      startY + wallHeight * scale,
      `${Math.round(wallHeight * 1000)}mm`,
      true,
      true,
    )

    // Als er een dak is, teken ook de totale hoogte (nokhoogte)
    if (selectedView === "front" || selectedView === "back") {
      drawDimensionLine(
        ctx,
        startX - 100,
        startY - roofHeight * scale,
        startX - 100,
        startY + wallHeight * scale,
        `${Math.round(totalHeight * 1000)}mm`,
        true,
        true,
      )
    }

    // Teken één dimension line voor alle items met hun afstanden als er meer dan één item is
    if (wallItems.length > 1) {
      const itemDimensionY = startY + wallHeight * scale + 150

      // Teken de hoofdlijn zonder de totale breedte
      ctx.beginPath()
      ctx.moveTo(startX, itemDimensionY)
      ctx.lineTo(startX + wallWidth * scale, itemDimensionY)
      ctx.stroke()

      // Voeg label "Afstanden" toe boven de dimensielijn
      ctx.fillStyle = "black"
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Afstanden", startX + (wallWidth * scale) / 2, itemDimensionY - 25)

      // Teken verticale lijnen voor elk item en de afstanden
      for (let i = 0; i < wallItems.length; i++) {
        const item = wallItems[i]
        const itemWidth = item.width / 1000
        const itemX = item.position
        const canvasX = startX + itemX * scale

        // Bepaal de kleur voor het item op basis van het type
        let itemTextColor = "black"
        if (item.type === "sectionaaldeur") {
          itemTextColor = "#00008B" // Donkerblauw
        } else if (item.type === "loopdeur") {
          itemTextColor = "#006400" // Donkergroen
        } else if (item.type === "raam") {
          itemTextColor = "#FF0000" // Rood
        }

        // Teken verticale lijn aan het begin van het item
        ctx.beginPath()
        ctx.moveTo(canvasX, itemDimensionY - 5)
        ctx.lineTo(canvasX, itemDimensionY + 5)
        ctx.stroke()

        // Teken verticale lijn aan het einde van het item
        ctx.beginPath()
        ctx.moveTo(canvasX + itemWidth * scale, itemDimensionY - 5)
        ctx.lineTo(canvasX + itemWidth * scale, itemDimensionY + 5)
        ctx.stroke()

        // Bereken de aangepaste afmetingen voor deuren als 'Dagmaten + isolatie' is geselecteerd
        let displayWidth = item.width

        if ((item.type === "sectionaaldeur" || item.type === "loopdeur") && doorOpeningType === "Dagmaten + isolatie") {
          const panelThicknessInMM = Number.parseInt(panelThickness.replace("mm", ""))
          displayWidth = item.width + panelThicknessInMM * 2 // Voeg twee keer de paneeldikte toe aan de breedte
        }

        // Teken de item breedte in de juiste kleur met eventueel aangepaste afmetingen
        ctx.textAlign = "center"
        ctx.fillStyle = itemTextColor
        ctx.font = "14px Arial"
        ctx.fillText(`${displayWidth}mm`, canvasX + (itemWidth * scale) / 2, itemDimensionY - 10)

        // Teken de afstand vanaf links (voor het eerste item)
        if (i === 0 && itemX > 0) {
          ctx.textAlign = "center"
          ctx.fillStyle = "black"
          ctx.fillText(`${Math.round(itemX * 1000)}mm`, startX + (itemX * scale) / 2, itemDimensionY + 20)
        }

        // Teken de afstand tussen items
        if (i < wallItems.length - 1) {
          const nextItem = wallItems[i + 1]
          const distanceBetween = nextItem.position - (itemX + itemWidth)

          if (distanceBetween > 0) {
            ctx.textAlign = "center"
            ctx.fillStyle = "black"
            ctx.fillText(
              `${Math.round(distanceBetween * 1000)}mm`,
              canvasX + itemWidth * scale + (distanceBetween * scale) / 2,
              itemDimensionY + 20,
            )
          }
        }

        // Teken de afstand naar rechts (voor het laatste item)
        if (i === wallItems.length - 1) {
          const distanceToRight = wallWidth - (itemX + itemWidth)
          if (distanceToRight > 0) {
            ctx.textAlign = "center"
            ctx.fillStyle = "black"
            ctx.fillText(
              `${Math.round(distanceToRight * 1000)}mm`,
              canvasX + itemWidth * scale + (distanceToRight * scale) / 2,
              itemDimensionY + 20,
            )
          }
        }
      }
    }

    // Teken individuele dimensielijnen voor elk item
    wallItems.forEach((item, index) => {
      // Genereer een naam voor het item als het nog geen naam heeft
      let itemName = item.name
      if (!itemName) {
        // We gebruiken de eerder berekende counts
        const itemType = item.type
        const count = itemCounts[itemType] - (wallItems.length - 1 - index)
        itemName = `${itemType === "raam" ? "Raam" : itemType === "loopdeur" ? "Loopdeur" : "Sectionaaldeur"} ${count}`
      }

      const itemWidth = item.width / 1000
      const itemX = item.position
      const canvasX = startX + itemX * scale

      // Bepaal de kleur voor het item op basis van het type
      let itemTextColor = "black"
      if (item.type === "sectionaaldeur") {
        itemTextColor = "#00008B" // Donkerblauw
      } else if (item.type === "loopdeur") {
        itemTextColor = "#006400" // Donkergroen
      } else if (item.type === "raam") {
        itemTextColor = "#FF0000" // Rood
      }

      // Bereken de Y-positie voor de dimensielijn, afhankelijk van het aantal items
      // Zorg voor voldoende ruimte tussen de dimensielijnen
      const itemHorizontalDimensionY = startY + wallHeight * scale + 170 + index * 70

      // Teken de hoofdlijn voor dit item
      ctx.beginPath()
      ctx.moveTo(startX - panelThicknessValue * scale, itemHorizontalDimensionY)
      ctx.lineTo(startX + wallWidth * scale + panelThicknessValue * scale, itemHorizontalDimensionY)
      ctx.stroke()

      // Voeg de naam van het item toe boven de dimensielijn
      ctx.fillStyle = itemTextColor
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText(itemName, canvasX + (itemWidth * scale) / 2, itemHorizontalDimensionY - 25)

      // Teken verticale lijnen voor dit item
      ctx.beginPath()
      ctx.moveTo(canvasX, itemHorizontalDimensionY - 5)
      ctx.lineTo(canvasX, itemHorizontalDimensionY + 5)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(canvasX + itemWidth * scale, itemHorizontalDimensionY - 5)
      ctx.lineTo(canvasX + itemWidth * scale, itemHorizontalDimensionY + 5)
      ctx.stroke()

      // Bereken de aangepaste afmetingen voor deuren als 'Dagmaten + isolatie' is geselecteerd
      let displayWidth = item.width

      if ((item.type === "sectionaaldeur" || item.type === "loopdeur") && doorOpeningType === "Dagmaten + isolatie") {
        const panelThicknessInMM = Number.parseInt(panelThickness.replace("mm", ""))
        displayWidth = item.width + panelThicknessInMM * 2 // Voeg twee keer de paneeldikte toe aan de breedte
      }

      // Teken de item breedte
      ctx.textAlign = "center"
      ctx.fillStyle = itemTextColor
      ctx.fillText(`${displayWidth}mm`, canvasX + (itemWidth * scale) / 2, itemHorizontalDimensionY - 10)

      // Teken de afstand vanaf links (inclusief paneel)
      const distanceToLeftWithPanel = itemX + panelThicknessValue
      if (distanceToLeftWithPanel > 0) {
        ctx.textAlign = "center"
        ctx.fillStyle = "black"
        ctx.fillText(
          `${Math.round(distanceToLeftWithPanel * 1000)}mm`,
          startX - panelThicknessValue * scale + (startX + itemX * scale - (startX - panelThicknessValue * scale)) / 2,
          itemHorizontalDimensionY + 20,
        )
      }

      // Teken de afstand naar rechts (inclusief paneel)
      const distanceToRightWithPanel = wallWidth - itemX - itemWidth + panelThicknessValue
      if (distanceToRightWithPanel > 0) {
        ctx.textAlign = "center"
        ctx.fillStyle = "black"
        ctx.fillText(
          `${Math.round(distanceToRightWithPanel * 1000)}mm`,
          canvasX +
            itemWidth * scale +
            (startX + wallWidth * scale + panelThicknessValue * scale - (canvasX + itemWidth * scale)) / 2,
          itemHorizontalDimensionY + 20,
        )
      }

      // Teken individuele verticale dimension lijnen voor elk item
      // Plaats deze buiten de structuur, uitgelijnd met de goothoogte dimension lijn
      const itemVerticalDimensionX = startX - 150 - index * 50

      // Voor ramen: toon afstand vanaf vloer en hoogte
      if (item.type === "raam") {
        const itemHeight = item.height / 1000 // Definieer itemHeight opnieuw
        const itemY = item.elevation / 1000 // Elevation voor ramen

        // Afstand vanaf vloer
        drawDimensionLine(
          ctx,
          itemVerticalDimensionX,
          startY + wallHeight * scale,
          itemVerticalDimensionX,
          startY + wallHeight * scale - itemY * scale,
          `${item.elevation}mm`,
          true,
          true,
          itemTextColor,
        )

        // Hoogte van het raam
        drawDimensionLine(
          ctx,
          itemVerticalDimensionX - 30,
          startY + wallHeight * scale - itemY * scale,
          itemVerticalDimensionX - 30,
          startY + wallHeight * scale - (itemY + itemHeight) * scale,
          `${item.height}mm`,
          true,
          true,
          itemTextColor,
        )

        // Afstand tot goothoogte
        const distanceToGutter = wallHeight - (itemY + itemHeight)
        if (distanceToGutter > 0) {
          drawDimensionLine(
            ctx,
            itemVerticalDimensionX - 60,
            startY + wallHeight * scale - (itemY + itemHeight) * scale,
            itemVerticalDimensionX - 60,
            startY,
            `${Math.round(distanceToGutter * 1000)}mm`,
            true,
            true,
            itemTextColor,
          )
        }
      } else {
        // Voor deuren: toon hoogte en afstand tot goothoogte
        const itemHeight = item.height / 1000 // Definieer itemHeight opnieuw

        // Bereken de aangepaste hoogte voor deuren als 'Dagmaten + isolatie' is geselecteerd
        let displayHeight = item.height

        if ((item.type === "sectionaaldeur" || item.type === "loopdeur") && doorOpeningType === "Dagmaten + isolatie") {
          const panelThicknessInMM = Number.parseInt(panelThickness.replace("mm", ""))
          displayHeight = item.height + panelThicknessInMM // Voeg één keer de paneeldikte toe aan de hoogte
        }

        // Hoogte van de deur met eventueel aangepaste hoogte
        drawDimensionLine(
          ctx,
          itemVerticalDimensionX,
          startY + wallHeight * scale,
          itemVerticalDimensionX,
          startY + wallHeight * scale - itemHeight * scale,
          `${displayHeight}mm`,
          true,
          true,
          itemTextColor,
        )

        // Afstand tot goothoogte
        const distanceToGutter = wallHeight - itemHeight
        if (distanceToGutter > 0) {
          drawDimensionLine(
            ctx,
            itemVerticalDimensionX - 30,
            startY + wallHeight * scale - itemHeight * scale,
            itemVerticalDimensionX - 30,
            startY,
            `${Math.round(distanceToGutter * 1000)}mm`,
            true,
            true,
            itemTextColor,
          )
        }
      }
    })

    // Teken een titel
    ctx.font = "20px Arial"
    ctx.fillStyle = "black"
    ctx.textAlign = "center"
    ctx.fillText(
      `${
        selectedView === "front"
          ? "Voorkant"
          : selectedView === "back"
            ? "Achterkant"
            : selectedView === "left"
              ? "Linkerkant"
              : "Rechterkant"
      } - Panelen ${panelThickness} - ${doorOpeningType}`,
      canvasWidth / 2,
      50,
    )
  }, [dimensions, items, selectedView, scale, panelThickness, doorOpeningType, structureName])

  // Update de drawDimensionLine functie om kleuren te ondersteunen
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
        ctx.translate(x1 - 20, (y1 + y2) / 2)
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
        ctx.fillText(text, (x1 + x2) / 2, y1 - 10)
      }
    }
  }

  // Voeg een functie toe om individuele dimensielijnen voor items te tekenen
  // Voeg deze functie toe na de bestaande drawDimensionLine functie

  function drawItemDimensionLines(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    wallWidth: number,
    wallHeight: number,
    scale: number,
    item: ItemData,
    panelThicknessValue: number,
  ) {
    const itemWidth = item.width / 1000 // Convert mm to meters
    const itemHeight = item.height / 1000 // Convert mm to meters
    const itemX = item.position // Position is already in meters
    const canvasX = startX + itemX * scale

    // Bepaal de kleur voor het item op basis van het type
    let itemTextColor = "black"
    if (item.type === "sectionaaldeur") {
      itemTextColor = "#00008B" // Donkerblauw
    } else if (item.type === "loopdeur") {
      itemTextColor = "#006400" // Donkergroen
    } else if (item.type === "raam") {
      itemTextColor = "#FF0000" // Rood
    }

    // Teken dimensielijn voor het item zelf (breedte)
    const itemDimensionY = startY + wallHeight * scale + 200 + Math.random() * 50 // Voeg wat willekeurige offset toe om overlapping te voorkomen

    // Teken de hoofdlijn voor dit item
    ctx.beginPath()
    ctx.moveTo(canvasX, itemDimensionY)
    ctx.lineTo(canvasX + itemWidth * scale, itemDimensionY)
    ctx.stroke()

    // Teken verticale lijnen voor dit item
    ctx.beginPath()
    ctx.moveTo(canvasX, itemDimensionY - 5)
    ctx.lineTo(canvasX, itemDimensionY + 5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(canvasX + itemWidth * scale, itemDimensionY - 5)
    ctx.lineTo(canvasX + itemWidth * scale, itemDimensionY + 5)
    ctx.stroke()

    // Teken de item breedte
    ctx.textAlign = "center"
    ctx.fillStyle = itemTextColor
    ctx.font = "14px Arial"
    ctx.fillText(`${item.width}mm`, canvasX + (itemWidth * scale) / 2, itemDimensionY - 10)

    // Teken dimensielijn voor afstand tot linkerkant (inclusief paneel)
    const leftDimensionY = itemDimensionY + 50

    // Bereken de afstand inclusief paneel
    const distanceToLeftWithPanel = itemX + panelThicknessValue

    // Teken de hoofdlijn
    ctx.beginPath()
    ctx.moveTo(startX - panelThicknessValue * scale, leftDimensionY)
    ctx.lineTo(canvasX, leftDimensionY)
    ctx.stroke()

    // Teken verticale lijnen
    ctx.beginPath()
    ctx.moveTo(startX - panelThicknessValue * scale, leftDimensionY - 5)
    ctx.lineTo(startX - panelThicknessValue * scale, leftDimensionY + 5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(canvasX, leftDimensionY - 5)
    ctx.lineTo(canvasX, leftDimensionY + 5)
    ctx.stroke()

    // Teken de afstand
    ctx.textAlign = "center"
    ctx.fillStyle = "black"
    ctx.fillText(
      `${Math.round(distanceToLeftWithPanel * 1000)}mm`,
      startX - panelThicknessValue * scale + (canvasX - (startX - panelThicknessValue * scale)) / 2,
      leftDimensionY - 10,
    )

    // Teken dimensielijn voor afstand tot rechterkant (inclusief paneel)
    const rightDimensionY = leftDimensionY + 50

    // Bereken de afstand inclusief paneel
    const distanceToRightWithPanel = wallWidth - itemX - itemWidth + panelThicknessValue

    // Teken de hoofdlijn
    ctx.beginPath()
    ctx.moveTo(canvasX + itemWidth * scale, rightDimensionY)
    ctx.lineTo(startX + wallWidth * scale + panelThicknessValue * scale, rightDimensionY)
    ctx.stroke()

    // Teken verticale lijnen
    ctx.beginPath()
    ctx.moveTo(canvasX + itemWidth * scale, rightDimensionY - 5)
    ctx.lineTo(canvasX + itemWidth * scale, rightDimensionY + 5)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(startX + wallWidth * scale + panelThicknessValue * scale, rightDimensionY - 5)
    ctx.lineTo(startX + wallWidth * scale + panelThicknessValue * scale, rightDimensionY + 5)
    ctx.stroke()

    // Teken de afstand
    ctx.textAlign = "center"
    ctx.fillStyle = "black"
    ctx.fillText(
      `${Math.round(distanceToRightWithPanel * 1000)}mm`,
      canvasX +
        itemWidth * scale +
        (startX + wallWidth * scale + panelThicknessValue * scale - (canvasX + itemWidth * scale)) / 2,
      rightDimensionY - 10,
    )
  }

  // Functie om de 2D-weergave te downloaden als afbeelding
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")

    // Gebruik structuurnaam in de bestandsnaam
    const viewName =
      selectedView === "front"
        ? "voorkant_met_panelen"
        : selectedView === "back"
          ? "achterkant_met_panelen"
          : selectedView === "left"
            ? "linkerkant_met_panelen"
            : "rechterkant_met_panelen"

    link.href = image
    link.download = `${structureName.replace(/\s+/g, "_")}_2D_${viewName}.png`
    link.click()
  }

  // Functie om de 2D-weergave te printen
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
          <title>Print ${selectedView} View</title>
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
        <CardTitle>2D met panelen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs
            value={selectedView}
            onValueChange={(value) => onSelectView(value as "front" | "back" | "left" | "right")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="front">Voor</TabsTrigger>
              <TabsTrigger value="back">Achter</TabsTrigger>
              <TabsTrigger value="left">Links</TabsTrigger>
              <TabsTrigger value="right">Rechts</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="border rounded-md p-2 overflow-auto max-h-[600px]">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ minHeight: "300px" }} />
          </div>

          <div className="flex justify-between">
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setScale(scale + 10)} disabled={scale >= 100}>
                Zoom In
              </Button>
              <Button variant="outline" onClick={() => setScale(Math.max(10, scale - 10))} disabled={scale <= 10}>
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

