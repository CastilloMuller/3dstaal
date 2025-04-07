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
import OrientationGizmos from "@/components/orientation-gizmos"
import { Button } from "@/components/ui/button"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

  // Wijzig de default tab naar "dimensions" en zet showDebug op false
  const [activeTab, setActiveTab] = useState("dimensions")
  const [showDebug, setShowDebug] = useState(false)

  // Items state (doors and windows)
  const [items, setItems] = useState<ItemData[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  // Voeg een state toe voor de geselecteerde 2D-weergave
  const [selected2DView, setSelected2DView] = useState<"front" | "back" | "left" | "right">("front")

  // Voeg een nieuwe state toe voor het preview item
  const [previewItem, setPreviewItem] = useState<Omit<ItemData, "id"> | null>(null)

  // Voeg een state toe voor het rapport genereren
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  // Voeg een state toe om bij te houden of de data is geladen
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Voeg een state toe voor notificaties
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Voeg een state toe om bij te houden of er onopgeslagen wijzigingen zijn
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const topViewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Laad data uit localStorage bij het opstarten
  useEffect(() => {
    setMounted(true)

    // Probeer data te laden uit localStorage
    try {
      const storedStructureName = localStorage.getItem("structureName")
      const storedDimensions = localStorage.getItem("dimensions")
      const storedPanelThickness = localStorage.getItem("panelThickness")
      const storedDoorOpeningType = localStorage.getItem("doorOpeningType")
      const storedShowFront = localStorage.getItem("showFront")
      const storedShowBack = localStorage.getItem("showBack")
      const storedShowLeft = localStorage.getItem("showLeft")
      const storedShowRight = localStorage.getItem("showRight")
      const storedItems = localStorage.getItem("items")

      if (storedStructureName) setStructureName(storedStructureName)
      if (storedDimensions) setDimensions(JSON.parse(storedDimensions))
      if (storedPanelThickness) setPanelThickness(storedPanelThickness)
      if (storedDoorOpeningType) setDoorOpeningType(storedDoorOpeningType)
      if (storedShowFront) setShowFront(storedShowFront === "true")
      if (storedShowBack) setShowBack(storedShowBack === "true")
      if (storedShowLeft) setShowLeft(storedShowLeft === "true")
      if (storedShowRight) setShowRight(storedShowRight === "true")
      if (storedItems) setItems(JSON.parse(storedItems))

      if (storedStructureName || storedDimensions || storedItems) {
        setNotification({
          type: "success",
          message: "Eerder opgeslagen data is geladen",
        })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error("Fout bij het laden van data uit localStorage:", error)
    }
  }, [])

  // Effect om wijzigingen bij te houden
  useEffect(() => {
    if (mounted) {
      setHasUnsavedChanges(true)
    }
  }, [dimensions, structureName, panelThickness, doorOpeningType, items, showFront, showBack, showLeft, showRight])

  // Functie om de huidige structuur op te slaan in localStorage
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem("structureName", structureName)
      localStorage.setItem("dimensions", JSON.stringify(dimensions))
      localStorage.setItem("panelThickness", panelThickness)
      localStorage.setItem("doorOpeningType", doorOpeningType)
      localStorage.setItem("showFront", String(showFront))
      localStorage.setItem("showBack", String(showBack))
      localStorage.setItem("showLeft", String(showLeft))
      localStorage.setItem("showRight", String(showRight))
      localStorage.setItem("items", JSON.stringify(items))

      setHasUnsavedChanges(false)
      setNotification({
        type: "success",
        message: "Structuur succesvol opgeslagen",
      })
      setTimeout(() => setNotification(null), 3000)
    } catch (error) {
      console.error("Fout bij het opslaan in localStorage:", error)
      setNotification({
        type: "error",
        message: "Fout bij het opslaan van de structuur",
      })
      setTimeout(() => setNotification(null), 5000)
    }
  }

  // Voeg een functie toe om de nokhoogte te berekenen
  const calculatePeakHeight = () => {
    const roofHeight = (dimensions.width / 2) * Math.tan((dimensions.roofAngle * Math.PI) / 180)
    return dimensions.gutterHeight + roofHeight
  }

  // Voeg een functie toe om automatisch een naam te genereren voor de structuur
  const generateDefaultName = () => {
    return `Structuur ${Math.round(dimensions.width * 1000)}×${Math.round(dimensions.length * 1000)}×${Math.round(dimensions.gutterHeight * 1000)}`
  }

  // Update de handleDimensionsChange functie om automatisch een naam te genereren als er nog geen is
  const handleDimensionsChange = (length: number, width: number, roofAngle: number, gutterHeight: number) => {
    setDimensions({
      ...dimensions,
      length,
      width,
      roofAngle,
      gutterHeight,
    })

    // Als de naam nog de standaardnaam is of leeg, genereer dan een nieuwe naam
    if (structureName === "Mijn Structuur" || structureName === "" || structureName.startsWith("Structuur ")) {
      setStructureName(generateDefaultName())
    }
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
    setHasUnsavedChanges(false)

    // Verander de actieve tab naar bovenaanzicht
    setActiveTab("top-view")

    setNotification({
      type: "success",
      message: "Data succesvol geladen",
    })
    setTimeout(() => setNotification(null), 3000)
  }

  // Toggle debug mode
  const toggleDebug = () => {
    setShowDebug(!showDebug)
  }

  // Functie om een nieuwe structuur te starten
  const startNewStructure = () => {
    if (
      hasUnsavedChanges &&
      !confirm("Er zijn onopgeslagen wijzigingen. Weet je zeker dat je een nieuwe structuur wilt starten?")
    ) {
      return
    }

    setStructureName("Mijn Structuur")
    setDimensions({
      width: 8,
      length: 12,
      gutterHeight: 3,
      roofAngle: 25,
    })
    setPanelThickness("60mm")
    setDoorOpeningType("Dagmaten")
    setShowFront(true)
    setShowBack(false)
    setShowLeft(false)
    setShowRight(false)
    setItems([])
    setActiveTab("dimensions")
    setHasUnsavedChanges(false)

    setNotification({
      type: "success",
      message: "Nieuwe structuur gestart",
    })
    setTimeout(() => setNotification(null), 3000)
  }

  if (!mounted) {
    return null
  }

  // Vervang de bestaande Tabs component met deze aangepaste versie
  return (
    <main className="flex flex-col bg-white min-h-screen">
      {/* Header met opties */}
      <div className="w-full p-2 bg-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">{structureName}</h1>
          {hasUnsavedChanges && <span className="text-xs text-gray-500">(niet opgeslagen)</span>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startNewStructure}>
            Nieuw
          </Button>
          <Button variant="outline" size="sm" onClick={saveToLocalStorage}>
            <Save className="h-4 w-4 mr-1" />
            Opslaan
          </Button>
          <Button variant="outline" size="sm" onClick={toggleDebug}>
            {showDebug ? "Verberg Debug" : "Toon Debug"}
          </Button>
        </div>
      </div>

      {/* Notificatie */}
      {notification && (
        <div className="w-full px-4 py-2">
          <Alert
            className={
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{notification.type === "success" ? "Succes" : "Fout"}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Menu container bovenaan */}
      <div className="w-full p-4 border-b">
        <Tabs
          defaultValue="dimensions"
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
            <TabsTrigger value="data-loader">Import</TabsTrigger>
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
          {/* Voeg de structureName prop toe aan de TwoDView en TwoDPanelsView componenten */}
          <TabsContent value="2d-view" className="mt-4">
            <TwoDView
              dimensions={dimensions}
              items={items}
              selectedView={selected2DView}
              onSelectView={setSelected2DView}
              onPrint={handlePrint}
              canvasRef={canvasRef}
              structureName={structureName}
            />
          </TabsContent>

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
              structureName={structureName}
            />
          </TabsContent>

          {/* Voeg de nieuwe TabsContent toe voor de bovenaanzicht */}
          {/* Voeg de structureName prop toe aan de TopView component */}
          <TabsContent value="top-view" className="mt-4">
            <TopView
              dimensions={dimensions}
              items={items}
              onPrint={handlePrint}
              canvasRef={topViewCanvasRef}
              structureName={structureName}
            />
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
            showDebug={showDebug}
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
  showDebug: boolean
}

// Voeg een nieuwe functie toe voor de horizontale gordingen in het schuine dakvlak van de voor- en achterkant
function RoofFrontBackPurlins({
  width,
  length,
  gutterHeight,
  roofHeight,
  purlinWidth,
  purlinDepth,
  purlinColor,
  showDebug,
}) {
  // Deze functie moet NIET de gordingen in het dakvlak tekenen
  // In plaats daarvan moet het de horizontale gordingen in de voor- en achterkant tekenen
  // volgens de regels: op 900mm, 2100mm, en dan elke 1500mm verticaal (maar niet op goothoogte)

  // Vaste hoogtes voor horizontale gordingen in voor- en achterkant
  const fixedHeights = [0.9, 2.1] // 900mm, 2100mm

  // Bereken extra hoogtes boven 2100mm tot aan goothoogte
  const extraHeights = []
  const maxBeamSpacing = 1.5 // 1500mm

  // Bereken extra hoogtes (niet op goothoogte)
  let currentHeight = 2.1 // Start vanaf 2100mm
  while (currentHeight + maxBeamSpacing < gutterHeight) {
    currentHeight += maxBeamSpacing
    extraHeights.push(currentHeight)
  }

  return (
    <group>
      {/* We tekenen hier GEEN gordingen in het dakvlak voor de voor- en achterkant */}
      {/* Die worden al getekend in de BaseFrame functie */}
    </group>
  )
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
  showDebug,
}: SteelStructureProps) {
  // In de SteelStructure functie, vervang de bestaande spanThickness en purlinThickness definities met:

  // Beam dimensions
  const spanWidth = 0.2 // 200mm
  const spanDepth = 0.25 // 250mm
  const purlinWidth = 0.08 // 80mm
  const purlinDepth = 0.25 // 250mm

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
  const numIntermediatePurlins = Math.max(0, Math.ceil(roofSlopeLength / maxPurlinSpacing) - 1)
  const numPurlins = 1 + numIntermediatePurlins + 2 // goot + tussenliggende + 2 nokpurlins

  // Bereid alle items voor, inclusief preview item
  const allItems = [...items]
  if (previewItem) {
    allItems.push({ ...previewItem, id: "preview" })
  }

  // Vervang de openings mapping functie in de SteelStructure component met deze herziene versie:

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
        z1 = length / 2
        z2 = length / 2
        y1 = 0
        y2 = itemHeight
      } else if (item.wall === "back") {
        // Achterkant (negatieve Z)
        x1 = -width / 2 + itemPosition
        x2 = x1 + itemWidth
        z1 = -length / 2
        z2 = -length / 2
        y1 = 0
        y2 = itemHeight
      } else if (item.wall === "left") {
        // Linkerkant (negatieve X)
        z1 = -length / 2 + itemPosition
        z2 = z1 + itemWidth
        x1 = -width / 2
        x2 = -width / 2
        y1 = 0
        y2 = itemHeight
      } else if (item.wall === "right") {
        // Rechterkant (positieve X)
        z1 = -length / 2 + itemPosition
        z2 = z1 + itemWidth
        x1 = width / 2
        x2 = width / 2
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
      {/* Pas de BaseFrame functie aan om het onderscheid tussen spanten en gordingen te maken
      Vervang de BaseFrame functie aanroep met: */}
      <BaseFrame
        width={width}
        length={length}
        gutterHeight={gutterHeight}
        roofHeight={roofHeight}
        spanWidth={spanWidth}
        spanDepth={spanDepth}
        purlinWidth={purlinWidth}
        purlinDepth={purlinDepth}
        spanColor={spanColor}
        purlinColor={purlinColor}
        lengthBeams={lengthBeams}
        widthBeams={widthBeams}
        lengthSpacing={lengthSpacing}
        widthSpacing={widthSpacing}
        openings={openings}
        showDebug={showDebug}
      />

      {/* Roof trusses */}
      {/* Pas de RoofTruss functie aanroep aan: */}
      {Array.from({ length: numTrusses }).map((_, index) => {
        const position = -length / 2 + index * lengthSpacing
        return (
          <RoofTruss
            key={`truss-${index}`}
            width={width}
            gutterHeight={gutterHeight}
            roofHeight={roofHeight}
            position={position}
            spanWidth={spanWidth}
            spanDepth={spanDepth}
            spanColor={spanColor}
          />
        )
      })}

      {/* Roof Purlins */}
      {/* Pas de RoofPurlins functie aanroep aan: */}
      <RoofPurlinsComponent
        width={width}
        length={length}
        gutterHeight={gutterHeight}
        roofHeight={roofHeight}
        purlinWidth={purlinWidth}
        purlinDepth={purlinDepth}
        purlinColor={purlinColor}
        showDebug={showDebug}
      />

      {/* VERWIJDERD: Front and Back Roof Purlins - deze zijn niet nodig omdat de horizontale gordingen
          in de voor- en achterkant al worden getekend in de BaseFrame functie */}

      {/* Doors and Windows */}
      {/* Pas de Items functie aanroep aan: */}
      <Items
        items={items}
        previewItem={previewItem}
        width={width}
        length={length}
        gutterHeight={gutterHeight}
        purlinWidth={purlinWidth}
        purlinDepth={purlinDepth}
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
  purlinWidth,
  purlinDepth,
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
          purlinWidth={purlinWidth}
          purlinDepth={purlinDepth}
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
          purlinWidth={purlinWidth}
          purlinDepth={purlinDepth}
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

// Vervang de BaseFrame functie met deze nieuwe versie die onderscheid maakt tussen spanten en gordingen:

function BaseFrame({
  width,
  length,
  gutterHeight,
  roofHeight,
  spanWidth,
  spanDepth,
  purlinWidth,
  purlinDepth,
  spanColor,
  purlinColor,
  lengthBeams,
  widthBeams,
  lengthSpacing,
  widthSpacing,
  openings = [],
  showDebug = false,
}) {
  const peakHeight = gutterHeight + roofHeight

  // Bereken de exacte hoogtes voor de horizontale gordingen
  // Volgens de technische specificaties:
  // - Voor- en achterkant: op 0mm (grond), 900mm, 2100mm, en daarboven elke 1500mm tot onder de goothoogte
  // - Zijkanten: op 0mm (grond), 900mm, 2100mm, elke 1500mm daarboven, en op goothoogte

  // Vaste hoogtes voor alle wanden
  const fixedHeights = [0, 0.9, 2.1] // 0mm, 900mm, 2100mm

  // Bereken extra hoogtes boven 2100mm tot aan goothoogte
  const extraHeightsFrontBack = [] // Voor voor- en achterkant
  const extraHeightsSides = [] // Voor zijkanten

  // Maximale afstand tussen gordingen is 1500mm
  const maxBeamSpacing = 1.5 // 1500mm

  // Bereken extra hoogtes voor voor- en achterkant (niet op goothoogte)
  let currentHeight = 2.1 // Start vanaf 2100mm
  const nokhoogte = gutterHeight + roofHeight
  while (currentHeight + maxBeamSpacing < nokhoogte) {
    currentHeight += maxBeamSpacing
    extraHeightsFrontBack.push(currentHeight)
  }

  // Bereken extra hoogtes voor zijkanten (inclusief goothoogte)
  currentHeight = 2.1 // Reset voor zijkanten
  while (currentHeight + maxBeamSpacing < gutterHeight) {
    currentHeight += maxBeamSpacing
    extraHeightsSides.push(currentHeight)
  }

  // Voeg goothoogte toe voor zijkanten
  extraHeightsSides.push(gutterHeight)

  // Functie om te controleren of een balk een opening kruist
  const checkBeamIntersectsOpening = (beamType, beamPos, beamStart, beamEnd, beamHeight) => {
    // Bepaal of de balk horizontaal of verticaal is
    const isHorizontal = beamType === "horizontal"
    const isVertical = beamType === "vertical"

    // Controleer voor elke opening of de balk ermee kruist
    for (const opening of openings) {
      // Bepaal op welke wand de balk zich bevindt
      let beamWall = ""

      // Voor verticale balken
      if (isVertical) {
        // Bepaal de wand op basis van de positie van de balk
        if (Math.abs(beamPos.z - length / 2) < 0.1) beamWall = "front"
        else if (Math.abs(beamPos.z + length / 2) < 0.1) beamWall = "back"
        else if (Math.abs(beamPos.x + width / 2) < 0.1) beamWall = "left"
        else if (Math.abs(beamPos.x - width / 2) < 0.1) beamWall = "right"

        // Als de balk niet op dezelfde wand zit als de opening, sla deze opening over
        if (beamWall !== opening.wall) continue

        // Controleer of de balk binnen de hoogte van de opening valt
        if (beamHeight < opening.y1 || beamHeight > opening.y2) continue

        // Controleer of de balk kruist met de opening
        if (beamWall === "front" || beamWall === "back") {
          // Voor verticale balken op voor- of achterwand
          if (beamPos.x >= opening.x1 && beamPos.x <= opening.x2) {
            return { intersects: true, y1: opening.y1, y2: opening.y2 }
          }
        } else if (beamWall === "left" || beamWall === "right") {
          // Voor verticale balken op linker- of rechterwand
          if (beamPos.z >= opening.z1 && beamPos.z <= opening.z2) {
            return { intersects: true, y1: opening.y1, y2: opening.y2 }
          }
        }
      }
      // Voor horizontale balken
      else if (isHorizontal) {
        // Bepaal de wand op basis van de positie van de balk
        if (Math.abs(beamPos.z - length / 2) < 0.1) beamWall = "front"
        else if (Math.abs(beamPos.z + length / 2) < 0.1) beamWall = "back"
        else if (Math.abs(beamPos.x + width / 2) < 0.1) beamWall = "left"
        else if (Math.abs(beamPos.x - width / 2) < 0.1) beamWall = "right"

        // Als de balk niet op dezelfde wand zit als de opening, sla deze opening over
        if (beamWall !== opening.wall) continue

        // Controleer of de balk op dezelfde hoogte zit als de opening
        if (beamHeight < opening.y1 || beamHeight > opening.y2) continue

        // Controleer of de balk kruist met de opening
        if (beamWall === "front" || beamWall === "back") {
          // Voor horizontale balken op voor- of achterwand
          if (beamStart.x <= opening.x2 && beamEnd.x >= opening.x1) {
            return true
          }
        } else if (beamWall === "left" || beamWall === "right") {
          // Voor horizontale balken op linker- of rechterwand
          if (beamStart.z <= opening.z2 && beamEnd.z >= opening.z1) {
            return true
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

    // Bepaal of dit een spant (kolom) of een gording is
    // Kolommen op de hoeken EN alle verticale elementen langs de lengte (Z-as)
    const isSpant =
      // Hoekkolommen
      (Math.abs(x + width / 2) < 0.1 && Math.abs(z + length / 2) < 0.1) || // linksachter
      (Math.abs(x + width / 2) < 0.1 && Math.abs(z - length / 2) < 0.1) || // linksvoor
      (Math.abs(x - width / 2) < 0.1 && Math.abs(z + length / 2) < 0.1) || // rechtsachter
      (Math.abs(x - width / 2) < 0.1 && Math.abs(z - length / 2) < 0.1) || // rechtsvoor
      // Alle verticale elementen langs de lengte (Z-as)
      Math.abs(x + width / 2) < 0.1 || // linker wand
      Math.abs(x - width / 2) < 0.1 // rechter wand

    const beamWidth = isSpant ? spanWidth : purlinWidth
    const beamDepthLocal = isSpant ? spanDepth : purlinDepth
    const beamColorLocal = isSpant ? spanColor : purlinColor

    // Bepaal de wand op basis van de positie
    let beamWall = ""
    if (Math.abs(z - length / 2) < 0.1) beamWall = "front"
    else if (Math.abs(z + length / 2) < 0.1) beamWall = "back"
    else if (Math.abs(x + width / 2) < 0.1) beamWall = "left"
    else if (Math.abs(x - width / 2) < 0.1) beamWall = "right"

    // Controleer of er een opening is die deze balk kruist
    const intersection = checkBeamIntersectsOpening("vertical", beamPos, null, null, gutterHeight / 2)

    // Bepaal de juiste oriëntatie van de balk op basis van de wand
    let beamGeometry = [beamWidth, gutterHeight, beamDepthLocal]
    if (beamWall === "front" || beamWall === "back") {
      beamGeometry = [beamWidth, gutterHeight, beamDepthLocal]
    } else if (beamWall === "left" || beamWall === "right") {
      beamGeometry = [beamDepthLocal, gutterHeight, beamWidth]
    }

    if (!intersection || !intersection.intersects) {
      // Geen kruising, render de volledige balk
      return (
        <mesh position={[x, gutterHeight / 2, z]}>
          <boxGeometry args={beamGeometry} />
          <meshStandardMaterial color={beamColorLocal} />
        </mesh>
      )
    } else {
      // Er is een kruising, render de balk in twee delen (onder en boven de opening)
      return (
        <>
          {/* Onderste deel van de balk (van de grond tot aan de onderkant van de opening) */}
          {intersection.y1 > 0 && (
            <mesh position={[x, intersection.y1 / 2, z]}>
              <boxGeometry args={[beamGeometry[0], intersection.y1, beamGeometry[2]]} />
              <meshStandardMaterial color={beamColorLocal} />
            </mesh>
          )}

          {/* Bovenste deel van de balk (van de bovenkant van de opening tot aan de goot) */}
          {intersection.y2 < gutterHeight && (
            <mesh position={[x, (intersection.y2 + gutterHeight) / 2, z]}>
              <boxGeometry args={[beamGeometry[0], gutterHeight - intersection.y2, beamGeometry[2]]} />
              <meshStandardMaterial color={beamColorLocal} />
            </mesh>
          )}
        </>
      )
    }
  }

  // Functie om horizontale liggers te renderen voor een specifieke wand en hoogte
  const renderHorizontalBeam = (wallId, beamHeight) => {
    const segments = []
    let currentStart = 0
    let wallWidth = 0
    let wallOpenings = []

    // Bepaal de breedte van de wand en de relevante openingen
    if (wallId === "front" || wallId === "back") {
      wallWidth = width
      wallOpenings = openings
        .filter((o) => o.wall === wallId && o.y1 <= beamHeight && o.y2 >= beamHeight)
        .sort((a, b) => a.x1 - b.x1)

      // Bepaal de segmenten tussen openingen
      if (wallOpenings.length === 0) {
        segments.push({ start: -width / 2, end: width / 2 })
      } else {
        currentStart = -width / 2
        for (const opening of wallOpenings) {
          if (currentStart < opening.x1) {
            segments.push({ start: currentStart, end: opening.x1 })
          }
          currentStart = opening.x2
        }
        if (currentStart < width / 2) {
          segments.push({ start: currentStart, end: width / 2 })
        }
      }
    } else if (wallId === "left" || wallId === "right") {
      wallWidth = length
      wallOpenings = openings
        .filter((o) => o.wall === wallId && o.y1 <= beamHeight && o.y2 >= beamHeight)
        .sort((a, b) => a.z1 - b.z1)

      // Bepaal de segmenten tussen openingen
      if (wallOpenings.length === 0) {
        segments.push({ start: -length / 2, end: length / 2 })
      } else {
        currentStart = -length / 2
        for (const opening of wallOpenings) {
          if (currentStart < opening.z1) {
            segments.push({ start: currentStart, end: opening.z1 })
          }
          currentStart = opening.z2
        }
        if (currentStart < length / 2) {
          segments.push({ start: currentStart, end: length / 2 })
        }
      }
    }

    // Render de segmenten
    return segments.map((segment, idx) => {
      const segmentLength = segment.end - segment.start
      const segmentCenter = segment.start + segmentLength / 2

      if (wallId === "front") {
        // Controleer of de ligger boven de goothoogte uitkomt
        if (beamHeight > gutterHeight) {
          // Bereken de breedte van de ligger op deze hoogte
          // Dit is afhankelijk van de hoogte ten opzichte van de nok
          const heightAboveGutter = beamHeight - gutterHeight
          const ratioToRoof = heightAboveGutter / roofHeight
          const reducedWidth = width * (1 - ratioToRoof)

          // Pas de segmentlengte aan als deze breder is dan de beschikbare breedte op deze hoogte
          const adjustedSegmentLength = Math.min(segmentLength, reducedWidth)

          // Belangrijk: centreer de ligger horizontaal
          // Bereken de juiste startpositie op basis van de verminderde breedte
          const adjustedStart = -reducedWidth / 2
          const adjustedEnd = reducedWidth / 2

          // Bepaal de segmenten tussen openingen, maar nu binnen de aangepaste breedte
          const adjustedSegments = []
          if (wallOpenings.length === 0) {
            adjustedSegments.push({ start: adjustedStart, end: adjustedEnd })
          } else {
            let currentPos = adjustedStart
            for (const opening of wallOpenings) {
              // Alleen openingen binnen de aangepaste breedte meenemen
              if (opening.x1 >= adjustedStart && opening.x1 <= adjustedEnd) {
                if (currentPos < opening.x1) {
                  adjustedSegments.push({ start: currentPos, end: opening.x1 })
                }
                currentPos = opening.x2
              }
            }
            if (currentPos < adjustedEnd) {
              adjustedSegments.push({ start: currentPos, end: adjustedEnd })
            }
          }

          // Render de aangepaste segmenten
          return adjustedSegments.map((segment, idx) => {
            const segmentLength = segment.end - segment.start
            const segmentCenter = segment.start + segmentLength / 2

            return (
              <group key={`${wallId}-beam-${beamHeight}-${idx}`}>
                <mesh position={[segmentCenter, beamHeight, length / 2]}>
                  <boxGeometry args={[segmentLength, purlinWidth, purlinDepth]} />
                  <meshStandardMaterial color={purlinColor} />
                </mesh>

                {/* Debug label voor hoogte */}
                {showDebug && idx === 0 && (
                  <Text
                    position={[-width / 2 - 0.5, beamHeight, length / 2]}
                    rotation={[0, 0, 0]}
                    fontSize={0.15}
                    color="red"
                    anchorX="right"
                    anchorY="middle"
                    renderOrder={2}
                    depthTest={false}
                  >
                    {`Voor: ${(beamHeight * 1000).toFixed(0)}mm`}
                  </Text>
                )}
              </group>
            )
          })
        } else {
          // Normale ligger onder de goothoogte
          return (
            <group key={`${wallId}-beam-${beamHeight}-${idx}`}>
              <mesh position={[segmentCenter, beamHeight, length / 2]}>
                <boxGeometry args={[segmentLength, purlinWidth, purlinDepth]} />
                <meshStandardMaterial color={purlinColor} />
              </mesh>

              {/* Debug label voor hoogte */}
              {showDebug && idx === 0 && (
                <Text
                  position={[-width / 2 - 0.5, beamHeight, length / 2]}
                  rotation={[0, 0, 0]}
                  fontSize={0.15}
                  color="red"
                  anchorX="right"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                >
                  {`Voor: ${(beamHeight * 1000).toFixed(0)}mm`}
                </Text>
              )}
            </group>
          )
        }
      } else if (wallId === "back") {
        // Controleer of de ligger boven de goothoogte uitkomt
        if (beamHeight > gutterHeight) {
          // Bereken de breedte van de ligger op deze hoogte
          const heightAboveGutter = beamHeight - gutterHeight
          const ratioToRoof = heightAboveGutter / roofHeight
          const reducedWidth = width * (1 - ratioToRoof)

          // Pas de segmentlengte aan als deze breder is dan de beschikbare breedte op deze hoogte
          const adjustedSegmentLength = Math.min(segmentLength, reducedWidth)

          // Belangrijk: centreer de ligger horizontaal
          // Bereken de juiste startpositie op basis van de verminderde breedte
          const adjustedStart = -reducedWidth / 2
          const adjustedEnd = reducedWidth / 2

          // Bepaal de segmenten tussen openingen, maar nu binnen de aangepaste breedte
          const adjustedSegments = []
          if (wallOpenings.length === 0) {
            adjustedSegments.push({ start: adjustedStart, end: adjustedEnd })
          } else {
            let currentPos = adjustedStart
            for (const opening of wallOpenings) {
              // Alleen openingen binnen de aangepaste breedte meenemen
              if (opening.x1 >= adjustedStart && opening.x1 <= adjustedEnd) {
                if (currentPos < opening.x1) {
                  adjustedSegments.push({ start: currentPos, end: opening.x1 })
                }
                currentPos = opening.x2
              }
            }
            if (currentPos < adjustedEnd) {
              adjustedSegments.push({ start: currentPos, end: adjustedEnd })
            }
          }

          // Render de aangepaste segmenten
          return adjustedSegments.map((segment, idx) => {
            const segmentLength = segment.end - segment.start
            const segmentCenter = segment.start + segmentLength / 2

            return (
              <group key={`${wallId}-beam-${beamHeight}-${idx}`}>
                <mesh position={[segmentCenter, beamHeight, -length / 2]}>
                  <boxGeometry args={[segmentLength, purlinWidth, purlinDepth]} />
                  <meshStandardMaterial color={purlinColor} />
                </mesh>

                {/* Debug label voor hoogte */}
                {showDebug && idx === 0 && (
                  <Text
                    position={[-width / 2 - 0.5, beamHeight, -length / 2]}
                    rotation={[0, 0, 0]}
                    fontSize={0.15}
                    color="red"
                    anchorX="right"
                    anchorY="middle"
                    renderOrder={2}
                    depthTest={false}
                  >
                    {`Achter: ${(beamHeight * 1000).toFixed(0)}mm`}
                  </Text>
                )}
              </group>
            )
          })
        } else {
          // Normale ligger onder de goothoogte
          return (
            <group key={`${wallId}-beam-${beamHeight}-${idx}`}>
              <mesh position={[segmentCenter, beamHeight, -length / 2]}>
                <boxGeometry args={[segmentLength, purlinWidth, purlinDepth]} />
                <meshStandardMaterial color={purlinColor} />
              </mesh>

              {/* Debug label voor hoogte */}
              {showDebug && idx === 0 && (
                <Text
                  position={[-width / 2 - 0.5, beamHeight, -length / 2]}
                  rotation={[0, 0, 0]}
                  fontSize={0.15}
                  color="red"
                  anchorX="right"
                  anchorY="middle"
                  renderOrder={2}
                  depthTest={false}
                >
                  {`Achter: ${(beamHeight * 1000).toFixed(0)}mm`}
                </Text>
              )}
            </group>
          )
        }
      } else if (wallId === "left") {
        return (
          <group key={`${wallId}-beam-${beamHeight}-${idx}`}>
            <mesh position={[-width / 2, beamHeight, segmentCenter]}>
              <boxGeometry args={[purlinDepth, purlinWidth, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>

            {/* Debug label voor hoogte */}
            {showDebug && idx === 0 && (
              <Text
                position={[-width / 2, beamHeight, -length / 2 - 0.5]}
                rotation={[0, 0, 0]}
                fontSize={0.15}
                color="red"
                anchorX="center"
                anchorY="middle"
                renderOrder={2}
                depthTest={false}
              >
                {`Links: ${(beamHeight * 1000).toFixed(0)}mm`}
              </Text>
            )}
          </group>
        )
      } else if (wallId === "right") {
        return (
          <group key={`${wallId}-beam-${beamHeight}-${idx}`}>
            <mesh position={[width / 2, beamHeight, segmentCenter]}>
              <boxGeometry args={[purlinDepth, purlinWidth, segmentLength]} />
              <meshStandardMaterial color={purlinColor} />
            </mesh>

            {/* Debug label voor hoogte */}
            {showDebug && idx === 0 && (
              <Text
                position={[width / 2, beamHeight, -length / 2 - 0.5]}
                rotation={[0, 0, 0]}
                fontSize={0.15}
                color="red"
                anchorX="center"
                anchorY="middle"
                renderOrder={2}
                depthTest={false}
              >
                {`Rechts: ${(beamHeight * 1000).toFixed(0)}mm`}
              </Text>
            )}
          </group>
        )
      }
      return null
    })
  }

  return (
    <group>
      {/* Verticale spanten langs de lengte (Z-as) */}
      {Array.from({ length: lengthBeams }).map((_, index) => {
        const posZ = -length / 2 + index * lengthSpacing

        return (
          <group key={`length-beams-${index}`}>
            {/* Linker spant */}
            {renderVerticalBeam(-width / 2, posZ, "left")}

            {/* Rechter spant */}
            {renderVerticalBeam(width / 2, posZ, "right")}
          </group>
        )
      })}

      {/* Verticale gordingen langs de breedte (X-as) */}
      {Array.from({ length: widthBeams }).map((_, index) => {
        const posX = -width / 2 + index * widthSpacing

        // Sla hoekpunten over omdat die al zijn toegevoegd bij de lengte-spanten
        if (index > 0 && index < widthBeams - 1) {
          return (
            <group key={`width-beams-${index}`}>
              {/* Voorkant gording */}
              {renderVerticalBeam(posX, length / 2, "front")}

              {/* Achterkant gording */}
              {renderVerticalBeam(posX, -length / 2, "back")}
            </group>
          )
        }
        return null
      })}

      {/* Verlengde middenbalken naar de nok - GORDINGEN */}
      {/* Voorkant middengording verlenging */}
      <mesh position={[0, gutterHeight + roofHeight / 2, length / 2]}>
        <boxGeometry args={[purlinWidth, roofHeight, purlinDepth]} />
        <meshStandardMaterial color={purlinColor} />
      </mesh>

      {/* Achterkant middengording verlenging */}
      <mesh position={[0, gutterHeight + roofHeight / 2, -length / 2]}>
        <boxGeometry args={[purlinWidth, roofHeight, purlinDepth]} />
        <meshStandardMaterial color={purlinColor} />
      </mesh>

      {/* Vaste horizontale liggers voor alle wanden */}
      {fixedHeights.map((height) => (
        <group key={`fixed-beams-${height}`}>
          {renderHorizontalBeam("front", height)}
          {renderHorizontalBeam("back", height)}
          {renderHorizontalBeam("left", height)}
          {renderHorizontalBeam("right", height)}
        </group>
      ))}

      {/* Extra horizontale liggers voor voor- en achterkant */}
      {extraHeightsFrontBack.map((height) => (
        <group key={`extra-front-back-beams-${height}`}>
          {renderHorizontalBeam("front", height)}
          {renderHorizontalBeam("back", height)}
        </group>
      ))}

      {/* Extra horizontale liggers voor zijkanten */}
      {extraHeightsSides.map((height) => (
        <group key={`extra-side-beams-${height}`}>
          {renderHorizontalBeam("left", height)}
          {renderHorizontalBeam("right", height)}
        </group>
      ))}
    </group>
  )
}

// Vervang de RoofTruss functie met deze nieuwe versie:

function RoofTruss({ width, gutterHeight, roofHeight, position, spanWidth, spanDepth, spanColor }) {
  return (
    <group position={[0, 0, position]}>
      {/* Linker dakspant */}
      <mesh
        position={[-width / 4, gutterHeight + roofHeight / 2, 0]}
        rotation={[0, 0, Math.atan2(roofHeight, width / 2)]}
      >
        <boxGeometry args={[Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2)), spanWidth, spanDepth]} />
        <meshStandardMaterial color={spanColor} />
      </mesh>

      {/* Rechter dakspant */}
      <mesh
        position={[width / 4, gutterHeight + roofHeight / 2, 0]}
        rotation={[0, 0, -Math.atan2(roofHeight, width / 2)]}
      >
        <boxGeometry args={[Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2)), spanWidth, spanDepth]} />
        <meshStandardMaterial color={spanColor} />
      </mesh>
    </group>
  )
}

// Vervang de Item functie met deze gecorrigeerde versie:
function Item({
  item,
  width,
  length,
  gutterHeight,
  purlinWidth,
  purlinDepth,
  purlinColor,
  isSelected,
  onSelect,
  isPreview,
}) {
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

  // Standardize purlin dimensions for all items
  const itemPurlinWidth = purlinWidth
  const itemPurlinDepth = purlinDepth

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

  // Bereken de hoogte van de eerste horizontale gording boven de deur
  // Maximale afstand tussen horizontale liggers is 1500mm (1.5m) - gecorrigeerd van 2500mm
  const maxBeamSpacing = 1.5 // 1500mm

  // Bereken de hoogte van de eerste horizontale gording boven de deur
  let firstBeamAboveDoor = gutterHeight // Default to gutter height

  // Als het een deur is (geen raam), bereken dan de eerste horizontale gording boven de deur
  if (!isWindow) {
    const doorTopHeight = itemElevation + itemHeight

    // Controleer eerst of de deur onder de standaard horizontale ligger zit
    if (doorTopHeight < 0.9) {
      // 900mm
      firstBeamAboveDoor = 0.9 // 900mm
    } else {
      // Bereken de hoogte van de eerste horizontale gording boven de deur
      // Eerst bepalen hoeveel volledige stappen van maxBeamSpacing er zijn vanaf 900mm
      const stepsFromBase = Math.floor((doorTopHeight - 0.9) / maxBeamSpacing)
      // De hoogte van de volgende gording is dan
      firstBeamAboveDoor = 0.9 + (stepsFromBase + 1) * maxBeamSpacing

      // Als deze berekende hoogte boven de goothoogte uitkomt, gebruik dan de goothoogte
      if (firstBeamAboveDoor > gutterHeight) {
        firstBeamAboveDoor = gutterHeight
      }
    }
  }

  // Bereken de extra hoogte voor de zijkanten van de deur
  const extraHeight = !isWindow ? firstBeamAboveDoor - (itemElevation + itemHeight) : 0

  return (
    <group>
      {/* Main item */}
      <group
        position={position}
        rotation={rotation}
        onClick={(e) => {
          if (!isPreview) {
            e.stopPropagation()
            onSelect()
          }
        }}
      >
        {/* Item frame */}
        <group>
          {/* Left purlin - extended for doors */}
          <mesh position={[-itemWidth / 2, !isWindow ? extraHeight / 2 : 0, 0]}>
            <boxGeometry args={[itemPurlinWidth, itemHeight + (!isWindow ? extraHeight : 0), itemPurlinDepth]} />
            <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
          </mesh>

          {/* Right purlin - extended for doors */}
          <mesh position={[itemWidth / 2, !isWindow ? extraHeight / 2 : 0, 0]}>
            <boxGeometry args={[itemPurlinWidth, itemHeight + (!isWindow ? extraHeight : 0), itemPurlinDepth]} />
            <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
          </mesh>

          {/* Top purlin */}
          <mesh position={[0, itemHeight / 2, 0]}>
            <boxGeometry args={[itemWidth + itemPurlinWidth, itemPurlinWidth, itemPurlinDepth]} />
            <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
          </mesh>

          {/* Bottom purlin (only for windows) */}
          {isWindow && (
            <mesh position={[0, -itemHeight / 2, 0]}>
              <boxGeometry args={[itemWidth + itemPurlinWidth, itemPurlinWidth, itemPurlinDepth]} />
              <meshStandardMaterial color={highlightColor} transparent={isPreview} opacity={itemOpacity} />
            </mesh>
          )}

          {/* Extra horizontal purlin at the top of the extended sides (for doors) */}
          {!isWindow && extraHeight > 0 && (
            <mesh position={[0, itemHeight / 2 + extraHeight, 0]}>
              <boxGeometry args={[itemWidth + itemPurlinWidth, itemPurlinWidth, itemPurlinDepth]} />
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

// Vervang de RoofPurlins functie met deze verbeterde versie die rekening houdt met de technische specificaties:

function RoofPurlinsComponent({
  width,
  length,
  gutterHeight,
  roofHeight,
  purlinWidth,
  purlinDepth,
  purlinColor,
  showDebug,
}) {
  // Bereken de schuine lengte van het dak (hypotenuse)
  const roofSlopeLength = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2))

  // Bereken het aantal purlins op basis van maximale afstand van 1500mm (1.5m)
  const maxPurlinSpacing = 1.5 // 1500mm

  // Bereken het aantal benodigde gordingen
  const numSpaces = Math.ceil(roofSlopeLength / maxPurlinSpacing)
  const numIntermediatePurlins = Math.max(0, numSpaces - 1) // Aantal gordingen tussen goot en nok

  // Array om purlin posities op te slaan
  const purlins = []
  const halfWidth = width / 2
  const ridgeOffset = 0.1 // Afstand tussen de twee nokgordingen (100mm)

  // Voeg gootgording toe
  purlins.push({
    leftX: -halfWidth,
    leftY: gutterHeight,
    rightX: halfWidth,
    rightY: gutterHeight,
  })

  // Bereken de hoek van het dak in radialen
  const roofAngleRad = Math.atan2(roofHeight, halfWidth)

  // Als er tussenliggende gordingen nodig zijn, bereken dan hun posities
  if (numIntermediatePurlins > 0) {
    // Bereken de werkelijke afstand tussen purlins
    const actualSpacing = roofSlopeLength / (numIntermediatePurlins + 1)

    // Voeg tussenliggende purlins toe op basis van de berekende afstand
    for (let i = 1; i <= numIntermediatePurlins; i++) {
      // Bereken de afstand langs de schuine lijn
      const distanceAlongSlope = i * actualSpacing

      // Bereken de x- en y-coördinaten op basis van de afstand langs de schuine lijn
      const x = distanceAlongSlope * Math.cos(roofAngleRad)
      const y = distanceAlongSlope * Math.sin(roofAngleRad)

      purlins.push({
        leftX: -halfWidth + x,
        leftY: gutterHeight + y,
        rightX: halfWidth - x,
        rightY: gutterHeight + y,
      })
    }
  }

  // Voeg twee nokgordingen toe
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
          {/* Linker gording */}
          <mesh position={[purlin.leftX, purlin.leftY, 0]}>
            <boxGeometry args={[purlinWidth, purlinWidth, length]} />
            <meshStandardMaterial color={purlinColor} />
          </mesh>

          {/* Rechter gording */}
          <mesh position={[purlin.rightX, purlin.rightY, 0]}>
            <boxGeometry args={[purlinWidth, purlinWidth, length]} />
            <meshStandardMaterial color={purlinColor} />
          </mesh>

          {/* Debug label voor hoogte */}
          {showDebug && (
            <Text
              position={[purlin.leftX - 0.5, purlin.leftY, 0]}
              rotation={[0, 0, 0]}
              fontSize={0.15}
              color="red"
              anchorX="right"
              anchorY="middle"
              renderOrder={2}
              depthTest={false}
            >
              {`Dak links: ${(purlin.leftY * 1000).toFixed(0)}mm`}
            </Text>
          )}
        </group>
      ))}
    </group>
  )
}

