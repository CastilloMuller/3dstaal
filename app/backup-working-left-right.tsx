"use client"

import { useEffect, useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import DimensionMenu from "@/components/dimension-menu"
import ItemsMenu, { type ItemData } from "@/components/items-menu"
import ItemEditor from "@/components/item-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ItemsList from "@/components/items-list"
import TwoDView from "@/components/two-d-view"
import TwoDPanelsView from "@/components/two-d-panels-view"
import NewReportingTab from "@/components/new-reporting-tab"
import ReportGenerator from "@/components/report-generator"
import TopView from "@/components/top-view"
import DataLoader from "@/components/data-loader"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  // Structure dimensions and settings
  const [dimensions, setDimensions] = useState({
    width: 8, // 8000mm
    length: 12, // 12000mm
    gutterHeight: 3, // 3000mm
    roofAngle: 25, // degrees
  })

  // New state variables
  const [structureName, setStructureName] = useState("Mijn Structuur")

  // Voeg de nieuwe state variabelen toe na de bestaande state variabelen
  const [panelThickness, setPanelThickness] = useState("60mm")
  const [doorOpeningType, setDoorOpeningType] = useState("Dagmaten")

  // Verwijder showAxes state en zet alleen front op true
  const [showFront, setShowFront] = useState(true)
  const [showBack, setShowBack] = useState(false)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  // Items state (doors and windows)
  const [items, setItems] = useState<ItemData[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  // Voeg een nieuwe state toe om de actieve tab bij te houden
  const [activeTab, setActiveTab] = useState("data-loader")

  // Voeg een state toe voor de geselecteerde 2D-weergave
  const [selected2DView, setSelected2DView] = useState<"front" | "back" | "left" | "right">("front")

  // Voeg een nieuwe state toe voor het preview item
  const [previewItem, setPreviewItem] = useState<Omit<ItemData, "id"> | null>(null)

  // Voeg een state toe voor het rapport genereren
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Voeg een state toe om bij te houden of de data is geladen
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const topViewCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update the dimensions state to include gutterHeight in the handleDimensionsChange function
  const handleDimensionsChange = (length: number, width: number, roofAngle: number, gutterHeight: number) => {
    setDimensions({
      ...dimensions,
      length,
      width,
      roofAngle,
      gutterHeight,
    })
  }

  // Define walls for the items menu
  const walls = [
    { id: "front", width: dimensions.width },
    { id: "back", width: dimensions.width },
    { id: "left", width: dimensions.length },
    { id: "right", width: dimensions.length },
  ]

  // Wijzig de handleAddItem functie om het preview item te wissen na toevoegen
  const handleAddItem = (itemData: Omit<ItemData, "id">) => {
    const newItem: ItemData = {
      ...itemData,
      id: `item-${Date.now()}`,
    }
    setItems((prev) => [...prev, newItem])
    setPreviewItem(null) // Wis het preview item na toevoegen
  }

  // Update an existing item
  const handleUpdateItem = (id: string, data: Partial<ItemData>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)))
  }

  // Delete an item
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (selectedItem === id) {
      setSelectedItem(null)
    }
  }

  // Get the selected item data and wall width
  const selectedItemData = items.find((item) => item.id === selectedItem)
  const selectedItemWall = selectedItemData ? walls.find((wall) => wall.id === selectedItemData.wall) : null
  const selectedItemWallWidth = selectedItemWall?.width || 0

  // Functie om de 2D-weergave te printen
  const handlePrint = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const image = canvas.toDataURL("image/png")
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(`
  <html>
    <head>
      <title>Print ${selected2DView} View</title>
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

  // Functie om de backup data te laden
  const handleLoadData = (data: any) => {
    // Update alle state variabelen met de data
    setStructureName(data.structureName)
    setDimensions(data.dimensions)
    setPanelThickness(data.panelThickness)
    setDoorOpeningType(data.doorOpeningType)
    setShowFront(data.orientation.showFront)
    setShowBack(data.orientation.showBack)
    setShowLeft(data.orientation.showLeft)
    setShowRight(data.orientation.showRight)
    setItems(data.items)
    setIsDataLoaded(true)

    // Verander de actieve tab naar bovenaanzicht
    setActiveTab("top-view")
  }

  if (!mounted) {
    return null
  }

  // Vervang de bestaande Tabs component met deze aangepaste versie
  return (
    <main className="flex flex-col bg-white min-h-screen">
      {/* Menu container bovenaan */}
      <div className="w-full p-4 border-b">
        <Tabs
          defaultValue="data-loader"
          className="w-full max-w-4xl mx-auto"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            // Reset selectedItem when switching to the 'items' tab
            if (value === "items") {
              setSelectedItem(null)
            }
          }}
        >
          {/* Voeg de nieuwe tab toe aan de TabsList */}
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dimensions">Afmetingen</TabsTrigger>
            <TabsTrigger value="items">Toevoegen</TabsTrigger>
            <TabsTrigger value="edit">Aanpassen</TabsTrigger>
            <TabsTrigger value="2d-view">2D Weergave</TabsTrigger>
            <TabsTrigger value="2d-panels">2D met panelen</TabsTrigger>
            <TabsTrigger value="top-view">Bovenaanzicht</TabsTrigger>
            <TabsTrigger value="reporting">Rapportage</TabsTrigger>
            <TabsTrigger value="data-loader">Data Loader</TabsTrigger>
          </TabsList>

          {/* Data Loader Tab */}
          <TabsContent value="data-loader" className="mt-4">
            <DataLoader onLoadData={handleLoadData} />
          </TabsContent>

          <TabsContent value="dimensions" className="mt-4">
            <DimensionMenu
              initialLength={dimensions.length}
              initialWidth={dimensions.width}
              initialRoofAngle={dimensions.roofAngle}
              initialGutterHeight={dimensions.gutterHeight}
              initialName={structureName}
              initialShowFront={showFront}
              initialShowBack={showBack}
              initialShowLeft={showLeft}
              initialShowRight={showRight}
              initialPanelThickness={panelThickness}
              initialDoorOpeningType={doorOpeningType}
              onDimensionsChange={handleDimensionsChange}
              onNameChange={setStructureName}
              onShowFrontChange={setShowFront}
              onShowBackChange={setShowBack}
              onShowLeftChange={setShowLeft}
              onShowRightChange={setShowRight}
              onPanelThicknessChange={setPanelThickness}
              onDoorOpeningTypeChange={setDoorOpeningType}
            />
          </TabsContent>
          {/* Voeg de panelThickness prop toe aan de ItemsMenu component */}
          <TabsContent value="items" className="mt-4">
            <ItemsMenu
              walls={walls}
              onAddItem={handleAddItem}
              onPreviewItem={setPreviewItem}
              panelThickness={panelThickness}
            />
          </TabsContent>
          <TabsContent value="edit" className="mt-4">
            <div className="space-y-4">
              <ItemsList
                items={items}
                onSelectItem={(id) => {
                  setSelectedItem(id)
                }}
              />

              {selectedItem && selectedItemData && (
                <ItemEditor
                  item={selectedItemData}
                  wallWidth={selectedItemWallWidth}
                  onUpdate={handleUpdateItem}
                  onDelete={handleDeleteItem}
                  onClose={() => setSelectedItem(null)}
                />
              )}
            </div>
          </TabsContent>
          <TabsContent value="2d-view" className="mt-4">
            <TwoDView
              dimensions={dimensions}
              items={items}
              selectedView={selected2DView}
              onSelectView={setSelected2DView}
              onPrint={handlePrint}
              canvasRef={canvasRef}
            />
          </TabsContent>
          {/* Voeg de nieuwe TabsContent toe na de bestaande 2d-view TabsContent */}
          <TabsContent value="2d-panels" className="mt-4">
            <TwoDPanelsView
              dimensions={dimensions}
              items={items}
              selectedView={selected2DView}
              onSelectView={setSelected2DView}
              panelThickness={panelThickness}
              doorOpeningType={doorOpeningType}
              onPrint={handlePrint}
              canvasRef={canvasRef}
            />
          </TabsContent>
          {/* Voeg de nieuwe TabsContent toe voor de bovenaanzicht */}
          <TabsContent value="top-view" className="mt-4">
            <TopView dimensions={dimensions} items={items} onPrint={handlePrint} canvasRef={topViewCanvasRef} />
          </TabsContent>
          <TabsContent value="reporting" className="mt-4">
            {/* Vervang ReportingTab door NewReportingTab */}
            <NewReportingTab
              dimensions={dimensions}
              structureName={structureName}
              panelThickness={panelThickness}
              doorOpeningType={doorOpeningType}
              showFront={showFront}
              showBack={showBack}
              showLeft={showLeft}
              showRight={showRight}
              items={items}
              onGenerateReport={() => setIsGeneratingReport(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* 3D-weergave container - 2x de hoogte van het menu */}
      <div className="w-full" style={{ height: "calc(2 * 400px)" }}>
        <Canvas camera={{ position: [15, 10, 15], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <SteelStructure
            width={dimensions.width}
            length={dimensions.length}
            gutterHeight={dimensions.gutterHeight}
            roofAngle={dimensions.roofAngle}
            name={structureName}
            showFront={showFront}
            showBack={showBack}
            showLeft={showLeft}
            showRight={showRight}
            items={items}
            previewItem={previewItem}
            onSelectItem={setSelectedItem}
            selectedItem={selectedItem}
          />
          <OrbitControls />
        </Canvas>
      </div>

      {/* Rapport Generator */}
      {isGeneratingReport && (
        <ReportGenerator
          isOpen={isGeneratingReport}
          onClose={() => setIsGeneratingReport(false)}
          dimensions={dimensions}
          structureName={structureName}
          panelThickness={panelThickness}
          doorOpeningType={doorOpeningType}
          items={items}
        />
      )}
    </main>
  )
}

type SteelStructureProps = {
  width: number
  length: number
  gutterHeight: number
  roofAngle: number
  name: string
  showFront: boolean
  showBack: boolean
  showLeft: boolean
  showRight: boolean
  items: ItemData[]
  previewItem: Omit<ItemData, "id"> | null
  onSelectItem: (id: string | null) => void
  selectedItem: string | null
}

function SteelStructure({
  width,
  length,
  gutterHeight,
  roofAngle,
  name,
  showFront,
  showBack,
  showLeft,
  showRight,
  items,
  previewItem,
  onSelectItem,
  selectedItem,
}: SteelStructureProps) {
  // Beam and purlin thickness
  const spanThickness = 0.15
  const purlinThickness = spanThickness * 0.5 // 50% of span thickness

  // Colors
  const spanColor = "#BDBDBD" // Medium gray for spans
  const purlinColor = "#D3D3D3" // Light gray for purlins

  // Calculate roof height based on angle and width
  const roofHeight = (width / 2) * Math.tan((roofAngle * Math.PI) / 180)
  const peakHeight = gutterHeight + roofHeight

  // Calculate number of compartments and beam spacing
  const maxSpacing = 5 // 5000mm

  // For length
  const lengthCompartments = Math.ceil(length / maxSpacing)
  const lengthSpacing = length / lengthCompartments

  // For width
  const widthCompartments = Math.ceil(width / maxSpacing)
  const widthSpacing = width / widthCompartments

  // Calculate number of beams
  const lengthBeams = lengthCompartments + 1
  const widthBeams = widthCompartments + 1

  // Calculate number of roof trusses (one at each beam position along length)
  const numTrusses = lengthBeams

  // Calculate roof slope length (hypotenuse)
  const roofSlopeLength = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2))

  // Calculate number of purlins based on maximum spacing of 1500mm (1.5m)
  const maxPurlinSpacing = 1.5 // 1500mm
  const numSpaces = Math.ceil(roofSlopeLength / maxPurlinSpacing)
  const numIntermediatePurlins = numSpaces - 1 // Spaces between gutter and ridge

  // Total purlins: gutter purlin + intermediate purlins + 2 ridge purlins
  const numPurlins = 1 + numIntermediatePurlins + 2

  // Bereid alle items voor, inclusief preview item
  const allItems = [...items]
  if (previewItem) {
    allItems.push({ ...previewItem, id: "preview" })
  }

  // In de SteelStructure component, update de openings mapping functie:

  // Converteer items naar openingsgegevens voor de BaseFrame
  const openings = allItems
    .filter((item) => item.type === "sectionaaldeur" || item.type === "loopdeur") // Alleen deuren, geen ramen
    .map((item) => {
      // Converteer mm naar meters
      const itemWidth = item.width / 1000
      const itemHeight = item.height / 1000
      const itemPosition = item.position

      // Bereken de positie op basis van de wand
      let x1 = 0,
        x2 = 0,
        z1 = 0,
        z2 = 0,
        y1 = 0,
        y2 = 0

      if (item.wall === "front") {
        // Voorkant (positieve Z)
        x1 = -width / 2 + itemPosition
        x2 = x1 + itemWidth
        z1 = length / 2 - 0.01 // Kleine offset om rendering problemen te voorkomen
        z2 = length / 2 + 0.01
        y1 = 0
        y2 = itemHeight
      } else if (item.wall === "back") {
        // Achterkant (negatieve Z)
        x1 = -width / 2 + itemPosition // Correctie: Niet spiegelen voor achterkant
        x2 = x1 + itemWidth
        z1 = -length / 2 - 0.01
        z2 = -length / 2 + 0.01
        y1 = 0
        y2 = itemHeight
      } else if (item.wall === "left") {
        // Linkerkant (negatieve X)
        z1 = -length / 2 + itemPosition
        z2 = z1 + itemWidth
        x1 = -width / 2 - 0.01
        x2 = -width / 2 + 0.01
        y1 = 0
        y2 = itemHeight
      } else if (item.wall === "right") {
        // Rechterkant (positieve X)
        z1 = -length / 2 + itemPosition // Correctie: Niet spiegelen voor rechterkant
        z2 = z1 + itemWidth
        x1 = width / 2 - 0.01
        x2 = width / 2 + 0.01
        y1 = 0
        y2 = itemHeight
      }

      return {
        id: item.id,
        wall: item.wall,
        x1,
        x2,
        y1,
        y2,
        z1,
        z2,
        isPreview: item.id === "preview",
      }
    })

  return (
    <group>
      {/* Structure Name */}
      <group position={[0, peakHeight + 0.5, 0]}>
        <Text
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.8}
          color="black"
          anchorX="center"
          anchorY="bottom"
          fontWeight="bold"
          renderOrder={1}
          depthTest={false}
          scale={[1, 1, 1]} // Ensure positive scale
        >
          {name}
        </Text>
      </group>

      {/* Base frame and vertical beams */}
      <BaseFrame
        width={width}
        length={length}
        gutterHeight={gutterHeight}
        roofHeight={roofHeight}
        spanThickness={spanThickness}
        purlinThickness={purlinThickness}
        spanColor={spanColor}
        purlinColor={purlinColor}
        lengthBeams={lengthBeams}
        widthBeams={widthBeams}
        lengthSpacing={lengthSpacing}
        widthSpacing={widthSpacing}
        openings={openings}
      />

      {/* Roof trusses */}
      {Array.from({ length: numTrusses }).map((_, index) => {
        const position = -length / 2 + index * lengthSpacing
        return (
          <RoofTruss
            key={`truss-${index}`}
            width={width}
            gutterHeight={gutterHeight}
            roofHeight={roofHeight}
            position={position}
            spanThickness={spanThickness}
            spanColor={spanColor}
          />
        )
      })}

      {/* Roof Purlins */}
      <RoofPurlins
        width={width}
        length={length}
        gutterHeight={gutterHeight}
        roofHeight={roofHeight}
        numPurlins={numPurlins}
        numSpaces={numSpaces}
        purlinThickness={purlinThickness}
        purlinColor={purlinColor}
      />

      {/* Doors and Windows */}
      <Items
        items={items}
        previewItem={previewItem}
        width={width}
        length={length}
        gutterHeight={gutterHeight}
        purlinThickness={purlinThickness}
        purlinColor={purlinColor}
        onSelectItem={onSelectItem}
        selectedItem={selectedItem}
      />

      {/* Orientation Gizmos - conditionally rendered for each side */}
      <OrientationGizmos
        width={width}
        length={length}
        gutterHeight={gutterHeight}
        roofHeight={roofHeight}
        showFront={showFront}
        showBack={showBack}
        showLeft={showLeft}
        showRight={showRight}
      />
    </group>
  )
}

function Items({
  items,
  previewItem,
  width,
  length,
  gutterHeight,
  purlinThickness,
  purlinColor,
  onSelectItem,
  selectedItem,
}) {
  return (
    <group>
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          width={width}
          length={length}
          gutterHeight={gutterHeight}
          purlinThickness={purlinThickness}
          purlinColor={purlinColor}
          isSelected={item.id === selectedItem}
          onSelect={() => onSelectItem(item.id)}
          isPreview={false}
        />
      ))}
      {previewItem && (
        <Item
          key="preview-item"
          item={{ ...previewItem, id: "preview" }}
          width={width}
          length={length}
          gutterHeight={gutterHeight}
          purlinThickness={purlinThickness}
          purlinColor={purlinColor}
          isSelected={false}
          onSelect={() => {}}
          isPreview={true}
        />
      )}
    </group>
  )
}

// Vervang de huidige BaseFrame functie met deze verbeterde versie die verticale balken correct opsplitst

function BaseFrame({
  width,
  length,
  gutterHeight,
  roofHeight,
  spanThickness,
  purlinThickness,
  spanColor,
  purlinColor,
  lengthBeams,
  widthBeams,
  lengthSpacing,
  widthSpacing,
  openings = [],
}) {
  const peakHeight = gutterHeight + roofHeight

  // Standaard horizontale ligger op 900mm
  const baseHorizontalBeamHeight = 0.9 // 900mm horizontal beams

  // Bereken de posities van eventuele extra horizontale liggers
  // Maximale afstand tussen horizontale liggers is 2500mm (2.5m)
  const maxBeamSpacing = 2.5 // 2500mm

  // Bereken hoeveel extra horizontale liggers nodig zijn voor de voor- en achterkant
  const frontBackExtraBeams = []
  let currentHeight = baseHorizontalBeamHeight

  while (gutterHeight - currentHeight > maxBeamSpacing) {
    currentHeight += maxBeamSpacing
    frontBackExtraBeams.push(currentHeight)
  }

  // Bereken hoeveel extra horizontale liggers nodig zijn voor de linker- en rechterkant
  const leftRightExtraBeams = []
  currentHeight = baseHorizontalBeamHeight

  while (gutterHeight - currentHeight > maxBeamSpacing) {
    currentHeight += maxBeamSpacing
    leftRightExtraBeams.push(currentHeight)
  }

  // In de BaseFrame component, vervang de checkBeamIntersectsOpening functie met deze verbeterde versie:

  const checkBeamIntersectsOpening = (beamType, beamPos, beamStart, beamEnd, beamHeight) => {
    // Bepaal of de balk horizontaal of verticaal is buiten de loop
    const isHorizontal = beamType === "horizontal"
    const isVertical = beamType === "vertical"

    // Controleer voor elke opening of de balk ermee kruist
    for (const opening of openings) {
      // Controleer of de balk op dezelfde wand zit als de opening
      let isOnSameWall = false

      if (opening.wall === "front" && Math.abs(beamPos.z - opening.z1) < 0.1) {
        isOnSameWall = true
      } else if (opening.wall === "back" && Math.abs(beamPos.z - opening.z1) < 0.1) {
        isOnSameWall = true
      } else if (opening.wall === "left" && Math.abs(beamPos.x - opening.x1) < 0.1) {
        isOnSameWall = true
      } else if (opening.wall === "right" && Math.abs(beamPos.x - opening.x1) < 0.1) {
        isOnSameWall = true
      }

      // Als de balk niet op dezelfde wand zit als de opening, sla deze opening over
      if (!isOnSameWall) continue

      // Controleer of de balk binnen de hoogte van de opening valt
      if (beamHeight < opening.y1 || beamHeight > opening.y2) continue

      // Controleer of de balk kruist met de opening
      if (isHorizontal) {
        if (opening.wall === "front" || opening.wall === "back") {
          // Voor horizontale balken op voor- of achterwand
          // Controleer of de balk daadwerkelijk kruist met de opening in de X-richting
          if (beamStart.x <= opening.x2 && beamEnd.x >= opening.x1) {
            return true
          }
        } else if (opening.wall === "left" || opening.wall === "right") {
          // Voor horizontale balken op linker- of rechterwand
          // Controleer of de balk daadwerkelijk kruist met de opening in de Z-richting
          if (beamStart.z <= opening.z2 && beamEnd.z >= opening.z1) {
            return true
          }
        }
      } else if (isVertical) {
        if (opening.wall === "front" || opening.wall === "back") {
          // Voor verticale balken op voor- of achterwand
          if (beamPos.x >= opening.x1 && beamPos.x <= opening.x2) {
            return { intersects: true, y1: opening.y1, y2: opening.y2 }
          }
        } else if (opening.wall === "left" || opening.wall === "right") {
          // Voor verticale balken op linker- of rechterwand
          if (beamPos.z >= opening.z1 && beamPos.z <= opening.z2) {
            return { intersects: true, y1: opening.y1, y2: opening.y2 }
          }
        }
      }
    }

    // Als er geen kruising is, retourneer false of een object dat aangeeft dat er geen kruising is
    return isVertical ? { intersects: false } : false
  }

  // Functie om verticale balken te renderen, rekening houdend met openingen
  const renderVerticalBeam = (x, z, wallSide) => {
    const beamPos = { x, z }
    const intersection = checkBeamIntersectsOpening("vertical", beamPos, null, null, gutterHeight / 2)

    if (!intersection || !intersection.intersects) {
      // Geen kruising, render de volledige balk
      return (
        <mesh position={[x, gutterHeight / 2, z]}>
          <boxGeometry args={[spanThickness, gutterHeight, spanThickness]} />
          <meshStandardMaterial color={spanColor} />
        </mesh>
      )
    } else {
      // Er is een kruising, render de balk in twee delen (onder en boven de opening)
      return (
        <>
          {/* Onderste deel van de balk (van de grond tot aan de onderkant van de opening) */}
          {intersection.y1 > 0 && (
            <mesh position={[x, intersection.y1 / 2, z]}>
              <boxGeometry args={[spanThickness, intersection.y1, spanThickness]} />
              <meshStandardMaterial color={spanColor} />
            </mesh>
          )}

          {/* Bovenste deel van de balk (van de bovenkant van de opening tot aan de goot) */}
          {intersection.y2 < gutterHeight && (
            <mesh position={[x, (intersection.y2 + gutterHeight) / 2, z]}>
              <boxGeometry args={[spanThickness, gutterHeight - intersection.y2, spanThickness]} />
              <meshStandardMaterial color={spanColor} />
            </mesh>
          )}
        </>
      )
    }
  }

  return (
    <group>
      {/* Vertical beams along length (Z-axis) - SPANS */}
      {Array.from({ length: lengthBeams }).map((_, index) => {
        const posZ = -length / 2 + index * lengthSpacing

        return (
          <group key={`length-beams-${index}`}>
            {/* Left side beam */}
            {renderVerticalBeam(-width / 2, posZ, "left")}

            {/* Right side beam */}
            {renderVerticalBeam(width / 2, posZ, "right")}
          </group>
        )
      })}
      {/* Vertical beams along width (X-axis) - SPANS */}
      {Array.from({ length: widthBeams }).map((_, index) => {
        const posX = -width / 2 + index * widthSpacing

        // Skip corner beams as they're already added in the length beams
        if (index > 0 && index < widthBeams - 1) {
          return (
            <group key={`width-beams-${index}`}>
              {/* Front side beam */}
              {renderVerticalBeam(posX, -length / 2, "front")}

              {/* Back side beam */}
              {renderVerticalBeam(posX, length / 2, "back")}
            </group>
          )
        }
        return null
      })}
      {/* Extended middle beams to ridge - SPANS */}
      {/* Front middle beam extension */}
      <mesh position={[0, gutterHeight + roofHeight / 2, -length / 2]}>
        <boxGeometry args={[spanThickness, roofHeight, spanThickness]} />
        <meshStandardMaterial color={spanColor} />
      </mesh>
      {/* Back middle beam extension */}
      <mesh position={[0, gutterHeight + roofHeight / 2, length / 2]}>
        <boxGeometry args={[spanThickness, roofHeight, spanThickness]} />
        <meshStandardMaterial color={spanColor} />
      </mesh>
      {/* Base beams - PURLINS */}
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentX = -width / 2

        // Doorloop alle openingen op de voorwand om segmenten te bepalen
        const frontOpenings = openings.filter((o) => o.wall === "front").sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

        if (frontOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -width / 2, end: width / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of frontOpenings) {
            if (currentX < opening.x1) {
              segments.push({ start: currentX, end: opening.x1 })
            }
            currentX = opening.x2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentX < width / 2) {
            segments.push({ start: currentX, end: width / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentWidth = segment.end - segment.start
          const segmentCenter = segment.start + segmentWidth / 2

          return (
            <mesh key={`front-base-${idx}`} position={[segmentCenter, 0, -length / 2]}>
              <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Back
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentX = -width / 2

        // Doorloop alle openingen op de achterwand om segmenten te bepalen
        const backOpenings = openings.filter((o) => o.wall === "back").sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

        if (backOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -width / 2, end: width / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of backOpenings) {
            if (currentX < opening.x1) {
              segments.push({ start: currentX, end: opening.x1 })
            }
            currentX = opening.x2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentX < width / 2) {
            segments.push({ start: currentX, end: width / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentWidth = segment.end - segment.start
          const segmentCenter = segment.start + segmentWidth / 2

          return (
            <mesh key={`back-base-${idx}`} position={[segmentCenter, 0, length / 2]}>
              <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Left
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentZ = -length / 2

        // Doorloop alle openingen op de linkerwand om segmenten te bepalen
        const leftOpenings = openings.filter((o) => o.wall === "left").sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

        if (leftOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -length / 2, end: length / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of leftOpenings) {
            if (currentZ < opening.z1) {
              segments.push({ start: currentZ, end: opening.z1 })
            }
            currentZ = opening.z2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentZ < length / 2) {
            segments.push({ start: currentZ, end: length / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentLength = segment.end - segment.start
          const segmentCenter = segment.start + segmentLength / 2

          return (
            <mesh key={`left-base-${idx}`} position={[-width / 2, 0, segmentCenter]}>
              <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Right
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentZ = -length / 2

        // Doorloop alle openingen op de rechterwand om segmenten te bepalen
        const rightOpenings = openings.filter((o) => o.wall === "right").sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

        if (rightOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -length / 2, end: length / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of rightOpenings) {
            if (currentZ < opening.z1) {
              segments.push({ start: currentZ, end: opening.z1 })
            }
            currentZ = opening.z2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentZ < length / 2) {
            segments.push({ start: currentZ, end: length / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentLength = segment.end - segment.start
          const segmentCenter = segment.start + segmentLength / 2

          return (
            <mesh key={`right-base-${idx}`} position={[width / 2, 0, segmentCenter]}>
              <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Top beams at gutter height - PURLINS // Front
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentX = -width / 2

        // Doorloop alle openingen op de voorwand om segmenten te bepalen
        const frontOpenings = openings
          .filter((o) => o.wall === "front" && o.y2 >= gutterHeight)
          .sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

        if (frontOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -width / 2, end: width / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of frontOpenings) {
            if (currentX < opening.x1) {
              segments.push({ start: currentX, end: opening.x1 })
            }
            currentX = opening.x2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentX < width / 2) {
            segments.push({ start: currentX, end: width / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentWidth = segment.end - segment.start
          const segmentCenter = segment.start + segmentWidth / 2

          return (
            <mesh key={`front-top-${idx}`} position={[segmentCenter, gutterHeight, -length / 2]}>
              <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Back
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentX = -width / 2

        // Doorloop alle openingen op de achterwand om segmenten te bepalen
        const backOpenings = openings
          .filter((o) => o.wall === "back" && o.y2 >= gutterHeight)
          .sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

        if (backOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -width / 2, end: width / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of backOpenings) {
            if (currentX < opening.x1) {
              segments.push({ start: currentX, end: opening.x1 })
            }
            currentX = opening.x2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentX < width / 2) {
            segments.push({ start: currentX, end: width / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentWidth = segment.end - segment.start
          const segmentCenter = segment.start + segmentWidth / 2

          return (
            <mesh key={`back-top-${idx}`} position={[segmentCenter, gutterHeight, length / 2]}>
              <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Left
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentZ = -length / 2

        // Doorloop alle openingen op de linkerwand om segmenten te bepalen
        const leftOpenings = openings
          .filter((o) => o.wall === "left" && o.y2 >= gutterHeight)
          .sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

        if (leftOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -length / 2, end: length / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of leftOpenings) {
            if (currentZ < opening.z1) {
              segments.push({ start: currentZ, end: opening.z1 })
            }
            currentZ = opening.z2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentZ < length / 2) {
            segments.push({ start: currentZ, end: length / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentLength = segment.end - segment.start
          const segmentCenter = segment.start + segmentLength / 2

          return (
            <mesh key={`left-top-${idx}`} position={[-width / 2, gutterHeight, segmentCenter]}>
              <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Right
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentZ = -length / 2

        // Doorloop alle openingen op de rechterwand om segmenten te bepalen
        const rightOpenings = openings
          .filter((o) => o.wall === "right" && o.y2 >= gutterHeight)
          .sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

        if (rightOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -length / 2, end: length / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of rightOpenings) {
            if (currentZ < opening.z1) {
              segments.push({ start: currentZ, end: opening.z1 })
            }
            currentZ = opening.z2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentZ < length / 2) {
            segments.push({ start: currentZ, end: length / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentLength = segment.end - segment.start
          const segmentCenter = segment.start + segmentLength / 2

          return (
            <mesh key={`right-top-${idx}`} position={[width / 2, gutterHeight, segmentCenter]}>
              <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Standaard horizontale liggers op 900mm hoogte - PURLINS // Front wall horizontal beam
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentX = -width / 2

        // Doorloop alle openingen op de voorwand om segmenten te bepalen
        const frontOpenings = openings
          .filter((o) => o.wall === "front" && o.y1 <= baseHorizontalBeamHeight && o.y2 >= baseHorizontalBeamHeight)
          .sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

        if (frontOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -width / 2, end: width / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of frontOpenings) {
            if (currentX < opening.x1) {
              segments.push({ start: currentX, end: opening.x1 })
            }
            currentX = opening.x2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentX < width / 2) {
            segments.push({ start: currentX, end: width / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentWidth = segment.end - segment.start
          const segmentCenter = segment.start + segmentWidth / 2

          return (
            <mesh key={`front-mid-${idx}`} position={[segmentCenter, baseHorizontalBeamHeight, -length / 2]}>
              <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Back wall horizontal beam
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentX = -width / 2

        // Doorloop alle openingen op de achterwand om segmenten te bepalen
        const backOpenings = openings
          .filter((o) => o.wall === "back" && o.y1 <= baseHorizontalBeamHeight && o.y2 >= baseHorizontalBeamHeight)
          .sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

        if (backOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -width / 2, end: width / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of backOpenings) {
            if (currentX < opening.x1) {
              segments.push({ start: currentX, end: opening.x1 })
            }
            currentX = opening.x2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentX < width / 2) {
            segments.push({ start: currentX, end: width / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentWidth = segment.end - segment.start
          const segmentCenter = segment.start + segmentWidth / 2

          return (
            <mesh key={`back-mid-${idx}`} position={[segmentCenter, baseHorizontalBeamHeight, length / 2]}>
              <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Left wall horizontal beam
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentZ = -length / 2

        // Doorloop alle openingen op de linkerwand om segmenten te bepalen
        const leftOpenings = openings
          .filter((o) => o.wall === "left" && o.y1 <= baseHorizontalBeamHeight && o.y2 >= baseHorizontalBeamHeight)
          .sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

        if (leftOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -length / 2, end: length / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of leftOpenings) {
            if (currentZ < opening.z1) {
              segments.push({ start: currentZ, end: opening.z1 })
            }
            currentZ = opening.z2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentZ < length / 2) {
            segments.push({ start: currentZ, end: length / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentLength = segment.end - segment.start
          const segmentCenter = segment.start + segmentLength / 2

          return (
            <mesh key={`left-mid-${idx}`} position={[-width / 2, baseHorizontalBeamHeight, segmentCenter]}>
              <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Right wall horizontal beam
      {Array.from({ length: 1 }).map((_, i) => {
        const segments = []
        let currentZ = -length / 2

        // Doorloop alle openingen op de rechterwand om segmenten te bepalen
        const rightOpenings = openings
          .filter((o) => o.wall === "right" && o.y1 <= baseHorizontalBeamHeight && o.y2 >= baseHorizontalBeamHeight)
          .sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

        if (rightOpenings.length === 0) {
          // Geen openingen, toon de volledige balk
          segments.push({ start: -length / 2, end: length / 2 })
        } else {
          // Bepaal segmenten tussen openingen
          for (const opening of rightOpenings) {
            if (currentZ < opening.z1) {
              segments.push({ start: currentZ, end: opening.z1 })
            }
            currentZ = opening.z2
          }

          // Voeg laatste segment toe als er nog ruimte is
          if (currentZ < length / 2) {
            segments.push({ start: currentZ, end: length / 2 })
          }
        }

        // Render alle segmenten
        return segments.map((segment, idx) => {
          const segmentLength = segment.end - segment.start
          const segmentCenter = segment.start + segmentLength / 2

          return (
            <mesh key={`right-mid-${idx}`} position={[width / 2, baseHorizontalBeamHeight, segmentCenter]}>
              <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>
          )
        })
      })}
      // Extra horizontale liggers voor de voor- en achterkant indien nodig
      {frontBackExtraBeams.map((beamHeight, beamIndex) => {
        return (
          <group key={`extra-front-back-beam-${beamIndex}`}>
            {/* Front wall extra horizontal beam */}
            {Array.from({ length: 1 }).map((_, i) => {
              const segments = []
              let currentX = -width / 2

              // Doorloop alle openingen op de voorwand om segmenten te bepalen
              const frontOpenings = openings
                .filter((o) => o.wall === "front" && o.y1 <= beamHeight && o.y2 >= beamHeight)
                .sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

              if (frontOpenings.length === 0) {
                // Geen openingen, toon de volledige balk
                segments.push({ start: -width / 2, end: width / 2 })
              } else {
                // Bepaal segmenten tussen openingen
                for (const opening of frontOpenings) {
                  if (currentX < opening.x1) {
                    segments.push({ start: currentX, end: opening.x1 })
                  }
                  currentX = opening.x2
                }

                // Voeg laatste segment toe als er nog ruimte is
                if (currentX < width / 2) {
                  segments.push({ start: currentX, end: width / 2 })
                }
              }

              // Render alle segmenten
              return segments.map((segment, idx) => {
                const segmentWidth = segment.end - segment.start
                const segmentCenter = segment.start + segmentWidth / 2

                return (
                  <mesh key={`front-extra-${beamIndex}-${idx}`} position={[segmentCenter, beamHeight, -length / 2]}>
                    <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
                    <meshStandardMaterial color={purlinColor} />
                  </mesh>
                )
              })
            })}

            {/* Back wall extra horizontal beam */}
            {Array.from({ length: 1 }).map((_, i) => {
              const segments = []
              let currentX = -width / 2

              // Doorloop alle openingen op de achterwand om segmenten te bepalen
              const backOpenings = openings
                .filter((o) => o.wall === "back" && o.y1 <= beamHeight && o.y2 >= beamHeight)
                .sort((a, b) => a.x1 - b.x1) // Sorteer op x-positie

              if (backOpenings.length === 0) {
                // Geen openingen, toon de volledige balk
                segments.push({ start: -width / 2, end: width / 2 })
              } else {
                // Bepaal segmenten tussen openingen
                for (const opening of backOpenings) {
                  if (currentX < opening.x1) {
                    segments.push({ start: currentX, end: opening.x1 })
                  }
                  currentX = opening.x2
                }

                // Voeg laatste segment toe als er nog ruimte is
                if (currentX < width / 2) {
                  segments.push({ start: currentX, end: width / 2 })
                }
              }

              // Render alle segmenten
              return segments.map((segment, idx) => {
                const segmentWidth = segment.end - segment.start
                const segmentCenter = segment.start + segmentWidth / 2

                return (
                  <mesh key={`back-extra-${beamIndex}-${idx}`} position={[segmentCenter, beamHeight, length / 2]}>
                    <boxGeometry args={[segmentWidth, purlinThickness, purlinThickness]} />
                    <meshStandardMaterial color={purlinColor} />
                  </mesh>
                )
              })
            })}
          </group>
        )
      })}
      // Extra horizontale liggers voor de linker- en rechterkant indien nodig
      {leftRightExtraBeams.map((beamHeight, beamIndex) => {
        return (
          <group key={`extra-left-right-beam-${beamIndex}`}>
            {/* Left wall extra horizontal beam */}
            {Array.from({ length: 1 }).map((_, i) => {
              const segments = []
              let currentZ = -length / 2

              // Doorloop alle openingen op de linkerwand om segmenten te bepalen
              const leftOpenings = openings
                .filter((o) => o.wall === "left" && o.y1 <= beamHeight && o.y2 >= beamHeight)
                .sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

              if (leftOpenings.length === 0) {
                // Geen openingen, toon de volledige balk
                segments.push({ start: -length / 2, end: length / 2 })
              } else {
                // Bepaal segmenten tussen openingen
                for (const opening of leftOpenings) {
                  if (currentZ < opening.z1) {
                    segments.push({ start: currentZ, end: opening.z1 })
                  }
                  currentZ = opening.z2
                }

                // Voeg laatste segment toe als er nog ruimte is
                if (currentZ < length / 2) {
                  segments.push({ start: currentZ, end: length / 2 })
                }
              }

              // Render alle segmenten
              return segments.map((segment, idx) => {
                const segmentLength = segment.end - segment.start
                const segmentCenter = segment.start + segmentLength / 2

                return (
                  <mesh key={`left-extra-${beamIndex}-${idx}`} position={[-width / 2, beamHeight, segmentCenter]}>
                    <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
                    <meshStandardMaterial color={purlinColor} />
                  </mesh>
                )
              })
            })}

            {/* Right wall extra horizontal beam */}
            {Array.from({ length: 1 }).map((_, i) => {
              const segments = []
              let currentZ = -length / 2

              // Doorloop alle openingen op de rechterwand om segmenten te bepalen
              const rightOpenings = openings
                .filter((o) => o.wall === "right" && o.y1 <= beamHeight && o.y2 >= beamHeight)
                .sort((a, b) => a.z1 - b.z1) // Sorteer op z-positie

              if (rightOpenings.length === 0) {
                // Geen openingen, toon de volledige balk
                segments.push({ start: -length / 2, end: length / 2 })
              } else {
                // Bepaal segmenten tussen openingen
                for (const opening of rightOpenings) {
                  if (currentZ < opening.z1) {
                    segments.push({ start: currentZ, end: opening.z1 })
                  }
                  currentZ = opening.z2
                }

                // Voeg laatste segment toe als er nog ruimte is
                if (currentZ < length / 2) {
                  segments.push({ start: currentZ, end: length / 2 })
                }
              }

              // Render alle segmenten
              return segments.map((segment, idx) => {
                const segmentLength = segment.end - segment.start
                const segmentCenter = segment.start + segmentLength / 2

                return (
                  <mesh key={`right-extra-${beamIndex}-${idx}`} position={[width / 2, beamHeight, segmentCenter]}>
                    <boxGeometry args={[purlinThickness, purlinThickness, segmentLength]} />
                    <meshStandardMaterial color={purlinColor} />
                  </mesh>
                )
              })
            })}
          </group>
        )
      })}
    </group>
  )
}

function RoofTruss({ width, gutterHeight, roofHeight, position, spanThickness, spanColor }) {
  return (
    <group position={[0, 0, position]}>
      {/* Left roof beam - SPAN */}
      <mesh
        position={[-width / 4, gutterHeight + roofHeight / 2, 0]}
        rotation={[0, 0, Math.atan2(roofHeight, width / 2)]}
      >
        <boxGeometry
          args={[Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2)), spanThickness, spanThickness]}
        />
        <meshStandardMaterial color={spanColor} />
      </mesh>

      {/* Right roof beam - SPAN */}
      <mesh
        position={[width / 4, gutterHeight + roofHeight / 2, 0]}
        rotation={[0, 0, -Math.atan2(roofHeight, width / 2)]}
      >
        <boxGeometry
          args={[Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2)), spanThickness, spanThickness]}
        />
        <meshStandardMaterial color={spanColor} />
      </mesh>
    </group>
  )
}

function RoofPurlins({ width, length, gutterHeight, roofHeight, numPurlins, numSpaces, purlinThickness, purlinColor }) {
  const purlins = []
  const halfWidth = width / 2
  const ridgeOffset = 0.1 // Distance between the two ridge purlins (100mm)

  // Calculate the spacing between purlins
  const spacing = 1 / numSpaces

  // Add gutter purlin
  purlins.push({
    leftX: -halfWidth,
    leftY: gutterHeight,
    rightX: halfWidth,
    rightY: gutterHeight,
  })

  // Add intermediate purlins
  for (let i = 1; i < numSpaces; i++) {
    const t = i * spacing
    const x = t * halfWidth
    const y = (x / halfWidth) * roofHeight

    purlins.push({
      leftX: -halfWidth + x,
      leftY: gutterHeight + y,
      rightX: halfWidth - x,
      rightY: gutterHeight + y,
    })
  }

  // Add two ridge purlins
  purlins.push({
    leftX: -ridgeOffset / 2,
    leftY: gutterHeight + roofHeight,
    rightX: -ridgeOffset / 2,
    rightY: gutterHeight + roofHeight,
  })

  purlins.push({
    leftX: ridgeOffset / 2,
    leftY: gutterHeight + roofHeight,
    rightX: ridgeOffset / 2,
    rightY: gutterHeight + roofHeight,
  })

  return (
    <group>
      {purlins.map((purlin, index) => (
        <group key={`purlin-${index}`}>
          {/* Left side purlin */}
          <mesh position={[purlin.leftX, purlin.leftY, 0]}>
            <boxGeometry args={[purlinThickness, purlinThickness, length]} />
            <meshStandardMaterial color={purlinColor} />
          </mesh>

          {/* Right side purlin */}
          <mesh position={[purlin.rightX, purlin.rightY, 0]}>
            <boxGeometry args={[purlinThickness, purlinThickness, length]} />
            <meshStandardMaterial color={purlinColor} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function OrientationGizmos({ width, length, gutterHeight, roofHeight, showFront, showBack, showLeft, showRight }) {
  const fontSize = 0.6
  const distance = 2 // Distance from the structure
  const textHeight = -0.5 // Height position for all text (flat along bottom)

  // Altijd dit gebruiken voor teksten (geen aparte rotatie):
  const textRotation = [0, 0, 0]

  // Define orientation labels with positions outside the structure
  const orientations = [
    {
      id: "front",
      position: [0, textHeight, length / 2 + distance],
      rotation: [0, 0, 0],
      label: "VOORKANT",
      color: "blue",
      show: showFront,
    },
    {
      id: "back",
      position: [0, textHeight, -length / 2 - distance],
      rotation: [0, Math.PI, 0],
      label: "ACHTERKANT",
      color: "blue",
      show: showBack,
    },
    {
      id: "left",
      position: [-width / 2 - distance, textHeight, 0],
      rotation: [0, Math.PI * 1.5, 0], // Aangepast naar 270 graden (1.5π)
      label: "LINKERKANT",
      color: "blue",
      show: showLeft,
    },
    {
      id: "right",
      position: [width / 2 + distance, textHeight, 0],
      rotation: [0, Math.PI * 0.5, 0], // Aangepast naar 90 graden (0.5π)
      label: "RECHTERKANT",
      color: "blue",
      show: showRight,
    },
  ]

  return (
    <group>
      {/* Orientation labels - text only, no arrows or backgrounds */}
      {orientations.map(
        (orient, index) =>
          orient.show && (
            <group key={index} position={orient.position} rotation={orient.rotation}>
              <Text
                position={[0, 0, 0]}
                rotation={textRotation}
                fontSize={fontSize}
                color={orient.color}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
                renderOrder={1} // Ensure text renders on top
                depthTest={false} // Make sure text is always visible
                outlineWidth={0} // No outline
                outlineColor="transparent"
                backgroundColor="transparent"
                scale={[1, 1, 1]} // Ensure positive scale
              >
                {orient.label}
              </Text>
            </group>
          ),
      )}
    </group>
  )
}

// Update de Item functie om de posities correct te berekenen:

// Update de Item functie om preview items anders weer te geven
function Item({ item, width, length, gutterHeight, purlinThickness, purlinColor, isSelected, onSelect, isPreview }) {
  // Convert mm to meters
  const itemWidth = item.width / 1000
  const itemHeight = item.height / 1000
  const itemPosition = item.position
  const itemElevation = item.elevation / 1000

  // Calculate position based on wall
  let position = [0, 0, 0]
  let rotation = [0, 0, 0]
  let wallWidth = 0

  // verwijder alle textRotation, gebruik standaard:
  const textRotation = [0, 0, 0] // Altijd 0

  if (item.wall === "front") {
    // Front wall (facing positive Z)
    position = [-width / 2 + itemPosition + itemWidth / 2, itemElevation + itemHeight / 2, length / 2 + 0.01]
    rotation = [0, 0, 0]
    wallWidth = width
  } else if (item.wall === "back") {
    // Back wall (facing negative Z)
    // Correctie: Niet spiegelen voor achterkant
    position = [-width / 2 + itemPosition + itemWidth / 2, itemElevation + itemHeight / 2, -length / 2 - 0.01]
    rotation = [0, Math.PI, 0]
    wallWidth = width
  } else if (item.wall === "left") {
    // Left wall (facing negative X)
    position = [-width / 2 - 0.01, itemElevation + itemHeight / 2, -length / 2 + itemPosition + itemWidth / 2]
    rotation = [0, Math.PI / 2, 0]
    wallWidth = length
  } else if (item.wall === "right") {
    // Right wall (facing positive X)
    // Correctie: Niet spiegelen voor rechterkant
    position = [width / 2 + 0.01, itemElevation + itemHeight / 2, -length / 2 + itemPosition + itemWidth / 2]
    rotation = [0, -Math.PI / 2, 0]
    wallWidth = length
  }

  // Standardize purlin thickness for all items
  const itemPurlinThickness = purlinThickness

  // Calculate distances to wall edges
  let distanceToLeft = 0
  let distanceToRight = 0

  // Correctie voor de afstandsberekening - consistent voor alle wanden
  distanceToLeft = itemPosition * 1000
  distanceToRight = Math.max(0, (wallWidth - itemPosition - itemWidth) * 1000)

  // Bepaal de kleur voor de breedte-weergave op basis van het type item
  let itemWidthColor = "black"
  if (item.type === "sectionaaldeur") {
    itemWidthColor = "#00008B" // Donkerblauw
  } else if (item.type === "loopdeur") {
    itemWidthColor = "#006400" // Donkergroen
  } else if (item.type === "raam") {
    itemWidthColor = "#FF0000" // Rood
  }

  // Highlight color for selected items or preview items
  const highlightColor = isPreview ? "#4CAF50" : isSelected ? "#4299e1" : purlinColor

  // Bepaal de verticale offset voor afstandslabels op basis van het type item
  let distanceLabelOffset = -1.0 // Standaard 1 meter onder de structuur
  if (item.type === "sectionaaldeur") {
    distanceLabelOffset = -1.0
  } else if (item.type === "loopdeur") {
    distanceLabelOffset = -1.3
  } else if (item.type === "raam") {
    distanceLabelOffset = -1.6
  }

  // Pas de opacity aan voor preview items
  const itemOpacity = isPreview ? 0.7 : 1

  // Voor ramen tonen we het volledige frame, voor deuren alleen de zijkanten en bovenkant
  const isWindow = item.type === "raam"

  return (
    <group>
      {/* Main item */}
      <group
        position={position}
        rotation={rotation as any}
        onClick={(e) => {
          if (!isPreview) {
            e.stopPropagation()
            onSelect()
          }
        }}
      >
        {/* Item frame */}
        <group>
          {/* Left purlin */}
          <mesh position={[-itemWidth / 2, 0, 0]}>
            <boxGeometry args={[itemPurlinThickness, itemHeight, itemPurlinThickness]} />
            <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
          </mesh>

          {/* Right purlin */}
          <mesh position={[itemWidth / 2, 0, 0]}>
            <boxGeometry args={[itemPurlinThickness, itemHeight, itemPurlinThickness]} />
            <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
          </mesh>

          {/* Top purlin */}
          <mesh position={[0, itemHeight / 2, 0]}>
            <boxGeometry args={[itemWidth + itemPurlinThickness, itemPurlinThickness, itemPurlinThickness]} />
            <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
          </mesh>

          {/* Bottom purlin (only for windows) */}
          {isWindow && (
            <mesh position={[0, -itemHeight / 2, 0]}>
              <boxGeometry args={[itemWidth + itemPurlinThickness, itemPurlinThickness, itemPurlinThickness]} />
              <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
            </mesh>
          )}
        </group>

        {/* Item dimensions (inside) - simplified to only show width */}
        {item.wall === "left" || item.wall === "right" ? (
          <Text
            position={[0, 0, 0.01]}
            rotation={[0, Math.PI, 0]} // 180 graden gedraaid voor linker- en rechterwand
            fontSize={0.18}
            color={itemWidthColor}
            anchorX="center"
            anchorY="middle"
            renderOrder={2}
            depthTest={false}
            scale={[1, 1, 1]} // Ensure positive scale
          >
            {`${item.width}mm`}
          </Text>
        ) : (
          <Text
            position={[0, 0, 0.01]}
            rotation={[0, 0, 0]} // Standaard rotatie voor voor- en achterwand
            fontSize={0.18}
            color={itemWidthColor}
            anchorX="center"
            anchorY="middle"
            renderOrder={2}
            depthTest={false}
            scale={[1, 1, 1]} // Ensure positive scale
          >
            {`${item.width}mm`}
          </Text>
        )}
      </group>

      {/* Toon geen afstandslabels voor preview items */}
      {!isPreview && (
        <>
          {item.wall === "front" && (
            <>
              {/* Left distance label */}
              <group position={[-width / 2 + itemPosition, distanceLabelOffset, length / 2 + 0.5]} rotation={[0, 0, 0]}>
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToLeft)}mm`}
                </Text>
              </group>

              {/* Right distance label */}
              <group
                position={[-width / 2 + itemPosition + itemWidth, distanceLabelOffset, length / 2 + 0.5]}
                rotation={[0, 0, 0]}
              >
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToRight)}mm`}
                </Text>
              </group>
            </>
          )}

          {item.wall === "back" && (
            <>
              {/* Left distance label */}
              <group
                position={[-width / 2 + itemPosition, distanceLabelOffset, -length / 2 - 0.5]}
                rotation={[0, Math.PI, 0]}
              >
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToLeft)}mm`}
                </Text>
              </group>

              {/* Right distance label */}
              <group
                position={[-width / 2 + itemPosition + itemWidth, distanceLabelOffset, -length / 2 - 0.5]}
                rotation={[0, Math.PI, 0]}
              >
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToRight)}mm`}
                </Text>
              </group>
            </>
          )}

          {item.wall === "left" && (
            <>
              {/* Left distance label */}
              <group
                position={[-width / 2 - 0.5, distanceLabelOffset, -length / 2 + itemPosition]}
                rotation={[0, Math.PI * 1.5, 0]}
              >
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToLeft)}mm`}
                </Text>
              </group>

              {/* Right distance label */}
              <group
                position={[-width / 2 - 0.5, distanceLabelOffset, -length / 2 + itemPosition + itemWidth]}
                rotation={[0, Math.PI * 1.5, 0]}
              >
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToRight)}mm`}
                </Text>
              </group>
            </>
          )}

          {item.wall === "right" && (
            <>
              {/* Left distance label */}
              <group
                position={[width / 2 + 0.5, distanceLabelOffset, -length / 2 + itemPosition]}
                rotation={[0, Math.PI * 0.5, 0]}
              >
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToLeft)}mm`}
                </Text>
              </group>

              {/* Right distance label */}
              <group
                position={[width / 2 + 0.5, distanceLabelOffset, -length / 2 + itemPosition + itemWidth]}
                rotation={[0, Math.PI * 0.5, 0]}
              >
                <Text
                  position={[0, 0, 0]}
                  rotation={textRotation}
                  fontSize={0.2}
                  color={itemWidthColor}
                  anchorX="center"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                  scale={[1, 1, 1]} // Ensure positive scale
                >
                  {`${Math.round(distanceToRight)}mm`}
                </Text>
              </group>
            </>
          )}
        </>
      )}
    </group>
  )
}

