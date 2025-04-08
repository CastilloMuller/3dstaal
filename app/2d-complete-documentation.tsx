"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function TwoDCompleteDocumentation() {
  const documentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions to fit on A4
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      // Save PDF
      pdf.save("2D-Complete-Documentation.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  // Draw the orientation diagram
  useEffect(() => {
    const canvas = document.getElementById("orientationDiagram") as HTMLCanvasElement
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 600
    canvas.height = 400

    // Clear canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 0.5

    // Vertical grid lines
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = "#999"
    ctx.lineWidth = 1

    // X-axis
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Draw structure
    ctx.strokeStyle = "black"
    ctx.lineWidth = 3
    const structWidth = 300
    const structHeight = 200
    const structX = (canvas.width - structWidth) / 2
    const structY = (canvas.height - structHeight) / 2
    ctx.strokeRect(structX, structY, structWidth, structHeight)

    // Draw direction arrows and labels
    ctx.fillStyle = "black"
    ctx.font = "14px 'Century Gothic', sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // North (1)
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, structY - 20)
    ctx.lineTo(canvas.width / 2, structY - 5)
    ctx.stroke()
    ctx.fillText("North", canvas.width / 2, structY - 30)
    ctx.fillText("1", canvas.width / 2, structY - 45)

    // East (2)
    ctx.beginPath()
    ctx.moveTo(structX + structWidth + 20, canvas.height / 2)
    ctx.lineTo(structX + structWidth + 5, canvas.height / 2)
    ctx.stroke()
    ctx.fillText("East", structX + structWidth + 30, canvas.height / 2)
    ctx.fillText("2", structX + structWidth + 30, canvas.height / 2 - 15)

    // South (3)
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, structY + structHeight + 20)
    ctx.lineTo(canvas.width / 2, structY + structHeight + 5)
    ctx.stroke()
    ctx.fillText("South", canvas.width / 2, structY + structHeight + 30)
    ctx.fillText("3", canvas.width / 2, structY + structHeight + 45)

    // West (4)
    ctx.beginPath()
    ctx.moveTo(structX - 20, canvas.height / 2)
    ctx.lineTo(structX - 5, canvas.height / 2)
    ctx.stroke()
    ctx.fillText("West", structX - 30, canvas.height / 2)
    ctx.fillText("4", structX - 30, canvas.height / 2 - 15)

    // Add axis labels
    ctx.fillStyle = "#666"
    ctx.font = "12px 'Century Gothic', sans-serif"
    ctx.fillText("X-axis (West to East)", canvas.width - 80, canvas.height - 10)
    ctx.save()
    ctx.translate(10, canvas.height / 2 - 80)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Y-axis (South to North)", 0, 0)
    ctx.restore()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>2D Complete Documentation</CardTitle>
        <Button onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download as PDF
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={documentRef} className="space-y-8 p-4 bg-white">
          <h1 className="text-2xl font-bold text-center">2D Complete View Specification</h1>

          <section>
            <h2 className="text-xl font-bold mb-4">1. Basis richtingen</h2>
            <p className="mb-4">
              Allereerst de informatie die als basis moet dienen voor de logica voor het juist plaatsen van items, de
              juiste positionering van items en de maten en afstanden.
            </p>
            <p className="mb-4">
              Hieronder een afbeelding waarop de kijkrichtingen staan aangegeven. West geeft de kijkrichting aan van de
              voorkant.
            </p>

            <div className="flex justify-center mb-6">
              <canvas id="orientationDiagram" className="border" width="600" height="400"></canvas>
            </div>

            <p className="mb-4">
              De kijkrichtingen zijn genummerd. Hieronder vind je een technische omschrijving die hoort bij diverse
              kijkrichtingen:
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="mb-2">1. North-Facing Façade (Front):</p>
              <ul className="list-disc pl-8 mb-4">
                <li>Viewpoint: Observed externally from the north.</li>
                <li>Orientation: Left = West edge; Right = East edge.</li>
                <li>
                  Coordinate Framework: Define a horizontal axis (x-axis) with x=0 at the western edge and x=total_width
                  at the eastern edge. Position items using left_offset, item_width, and right_offset = total_width -
                  (left_offset + item_width).
                </li>
              </ul>

              <p className="mb-2">2. East-Facing Façade:</p>
              <ul className="list-disc pl-8 mb-4">
                <li>Viewpoint: Observed externally from the east.</li>
                <li>Orientation: Left = North edge; Right = South edge.</li>
                <li>
                  Coordinate Framework: Use a rotated coordinate system (90° clockwise). Here, x=0 corresponds to the
                  northern edge and positions are measured downward. Item placement is defined by a similar formula:
                  left_offset, item_width, and right_offset = total_length - (left_offset + item_width).
                </li>
              </ul>

              <p className="mb-2">3. South-Facing Façade (Back):</p>
              <ul className="list-disc pl-8 mb-4">
                <li>Viewpoint: Observed externally from the south.</li>
                <li>Orientation: Left = East edge; Right = West edge (a mirrored version of the north façade).</li>
                <li>
                  Coordinate Framework: An inverted horizontal axis is used, with x=0 at the eastern edge. Formulate
                  item dimensions similarly with left_offset measured from the eastern edge.
                </li>
              </ul>

              <p className="mb-2">4. West-Facing Façade:</p>
              <ul className="list-disc pl-8 mb-4">
                <li>Viewpoint: Observed externally from the west.</li>
                <li>Orientation: Left = South edge; Right = North edge.</li>
                <li>
                  Coordinate Framework: Rotate the coordinate system 90° counterclockwise so that x=0 aligns with the
                  southern edge. Item placement then follows: left_offset measured from the south edge, with
                  right_offset computed accordingly.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">2. Indeling van de 2D</h2>

            <h3 className="text-lg font-semibold mb-2">Overall Page Layout</h3>
            <ol className="list-decimal pl-8 mb-6">
              <li className="mb-4">
                <p className="font-semibold">Vertical Arrangement:</p>
                <ul className="list-disc pl-8">
                  <li>The layout is organized vertically from top to bottom.</li>
                  <li>
                    Top Section: Contains a label that indicates the designated side (for example: front, back, left, or
                    right).
                  </li>
                  <li>
                    Immediately below the label: Place a scaled 2D representation (drawing) of that side of the steel
                    structure.
                  </li>
                  <li>
                    Image Alignment: The top edge of the image should align with a defined baseline. The image is always
                    placed vertically so that the side-label at the top remains clearly visible regardless of image
                    size.
                  </li>
                  <li>
                    Image Scaling by Side:
                    <ul className="list-disc pl-8">
                      <li>For the front and back views, the image should occupy 60% of the container's width.</li>
                      <li>For the left and right views, the image should occupy 90% of the container's width.</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ol>

            <h3 className="text-lg font-semibold mb-2">Below the Image – Text and Dimension Lines</h3>
            <ol className="list-decimal pl-8 mb-6" start={2}>
              <li className="mb-4">
                <p className="font-semibold">Spacing and Order of Elements Below the Image:</p>
                <p className="mb-2">
                  Arrange the following elements in vertical order (from top to bottom) with the specified spacing; note
                  that the following pixel values are indicative and may need to be adapted for responsiveness:
                </p>
                <ul className="list-disc pl-8">
                  <li>
                    <span className="font-semibold">Element 1:</span> Steel Structure Width Label
                    <ul className="list-disc pl-8">
                      <li>Position: Sufficient spacing below the bottom of the image, scaled based on font size.</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Element 2:</span> Dimension Line for Steel Structure Width
                    <ul className="list-disc pl-8">
                      <li>Position: Appropriate spacing below the "Steel Structure Width" label.</li>
                      <li>
                        This dimension line should have short vertical dash/tick marks at its endpoints and display the
                        actual measured width of the steel structure.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Element 3:</span> Steel Structure Width Including Panels Label
                    <ul className="list-disc pl-8">
                      <li>Position: Sufficient spacing below the previous dimension line.</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Element 4:</span> Dimension Line for Steel Structure Width Including
                    Panels
                    <ul className="list-disc pl-8">
                      <li>Position: Appropriate spacing below the "width including panels" label.</li>
                      <li>
                        Similar to Element 2, include short vertical tick marks at the endpoints and show the actual
                        measured width including panels.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Element 5:</span> Item Name Label (e.g., a door or a window placed
                    on the wall)
                    <ul className="list-disc pl-8">
                      <li>Position: Sufficient spacing below the previous dimension line.</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Element 6:</span> Label for the Distances from the Opening to the
                    Sides
                    <ul className="list-disc pl-8">
                      <li>Position: Appropriate spacing below the item name label.</li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Element 7:</span> Dimension Line for the Opening in the Steel
                    <ul className="list-disc pl-8">
                      <li>Position: Appropriate spacing below the distance label.</li>
                      <li>
                        This dimension line should have vertical tick marks indicating exactly where the opening is
                        located.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <span className="font-semibold">Element 8:</span> Label for the Width of the Placed Item
                    <ul className="list-disc pl-8">
                      <li>Position: Appropriate spacing below the dimension line from Element 7.</li>
                    </ul>
                  </li>
                </ul>
                <p className="mt-2 text-sm italic">
                  Note: Elements 5-8 belong together and represent information about placed items. This arrangement
                  ensures that distances are always shown above the line and the width in the steel is always shown
                  below the line.
                </p>
              </li>

              <li className="mb-4">
                <p className="font-semibold">Alignment and Grouping:</p>
                <ul className="list-disc pl-8">
                  <li>
                    All dimension lines must span the entire width of the displayed side (i.e., have the same horizontal
                    extent as the image).
                  </li>
                  <li>
                    Items (doors, windows) placed in the image must be precisely aligned with the corresponding markers
                    or labels on the dimension lines.
                  </li>
                  <li>
                    Labels indicating the width of an item on a dimension line should be centered relative to that line.
                  </li>
                  <li>
                    The distance labels for the extreme left and extreme right should be placed at the far left and far
                    right of the item's position:
                    <ul className="list-disc pl-8">
                      <li>Left-side distance label: Should appear with an arrow pointing to the right.</li>
                      <li>Right-side distance label: Should appear with an arrow pointing to the left.</li>
                    </ul>
                  </li>
                  <li>
                    The vertical spacing between a dimension line and its associated numerical/text values (annotations)
                    should be less than the spacing between separate dimension lines, ensuring that it is clear which
                    annotation belongs to which line.
                  </li>
                </ul>
              </li>

              <li className="mb-4">
                <p className="font-semibold">Visual Grouping:</p>
                <ul className="list-disc pl-8">
                  <li>
                    Each dimension (each set of a dimension line and its accompanying values/labels) should be enclosed
                    in a subtle rounded rectangular frame. This frame visually groups the dimension line with its
                    related values, making it immediately clear for the viewer which values belong together.
                  </li>
                  <li>
                    The frame should be subtle with a thin line, only used for horizontal dimension lines. Vertical
                    dimension lines for gutter height and peak height should only have arrows and measurements without
                    frames.
                  </li>
                </ul>
              </li>
            </ol>

            <h3 className="text-lg font-semibold mb-2">Implementation Notes</h3>
            <ul className="list-disc pl-8 mb-6">
              <li>
                <span className="font-semibold">Typography:</span> Use Century Gothic font family for all text elements.
              </li>
              <li>
                <span className="font-semibold">Colors:</span> Use the same color coding for items as in the 3D view:
                <ul className="list-disc pl-8">
                  <li>Sectional doors: Dark blue (#00008B)</li>
                  <li>Regular doors: Dark green (#006400)</li>
                  <li>Windows: Red (#FF0000)</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold">Multiple Items:</span> For each placed item, show a separate dimension
                line. When multiple items are placed on a wall, also include a summary dimension line showing all items
                and their relative distances.
              </li>
              <li>
                <span className="font-semibold">Scaling:</span> Ensure that spacing is sufficient for readability,
                considering font size when scaling elements.
              </li>
              <li>
                <span className="font-semibold">Development Approach:</span> Initially implement for one side only. Once
                perfected, apply the same principles to the remaining three sides.
              </li>
              <li>
                <span className="font-semibold">Export:</span> Include a download button for exporting the view, with
                future integration into a comprehensive reporting tool.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4">3. Example Layout Sketch</h2>
            <div className="border p-4 rounded-md">
              <div className="text-center font-bold mb-4">FRONT VIEW</div>
              <div className="bg-gray-100 h-64 mb-6 flex items-center justify-center border">
                [2D Representation of Structure]
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-2 mb-6">
                <div className="text-center mb-2">Steel Structure Width</div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute left-0 h-4 border-l-2 border-black"></div>
                  <div className="w-full border-t-2 border-black"></div>
                  <div className="absolute right-0 h-4 border-r-2 border-black"></div>
                  <div className="absolute w-full text-center">8000mm</div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-2 mb-6">
                <div className="text-center mb-2">Steel Structure Width Including Panels</div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute left-0 h-4 border-l-2 border-black"></div>
                  <div className="w-full border-t-2 border-black"></div>
                  <div className="absolute right-0 h-4 border-r-2 border-black"></div>
                  <div className="absolute w-full text-center">8120mm</div>
                </div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-2 mb-6">
                <div className="text-center mb-2 text-blue-900 font-bold">Sectional Door 1</div>
                <div className="text-center mb-2">Distances from Opening to Sides</div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute left-0 h-4 border-l-2 border-black"></div>
                  <div className="absolute left-1/3 h-4 border-l-2 border-black"></div>
                  <div className="absolute right-1/3 h-4 border-r-2 border-black"></div>
                  <div className="absolute right-0 h-4 border-r-2 border-black"></div>
                  <div className="w-full border-t-2 border-black"></div>
                  <div className="absolute left-1/6 text-center">2000mm</div>
                  <div className="absolute right-1/6 text-center">3000mm</div>
                </div>
                <div className="text-center mt-2 text-blue-900">3000mm</div>
              </div>

              <div className="border-2 border-gray-200 rounded-lg p-2">
                <div className="text-center mb-2">All Items Summary</div>
                <div className="relative h-8 flex items-center">
                  <div className="absolute left-0 h-4 border-l-2 border-black"></div>
                  <div className="absolute left-1/4 h-4 border-l-2 border-black"></div>
                  <div className="absolute left-2/4 h-4 border-l-2 border-black"></div>
                  <div className="absolute right-1/4 h-4 border-r-2 border-black"></div>
                  <div className="absolute right-0 h-4 border-r-2 border-black"></div>
                  <div className="w-full border-t-2 border-black"></div>
                  <div className="absolute left-1/8 text-center">2000mm</div>
                  <div className="absolute left-3/8 text-center">3000mm</div>
                  <div className="absolute right-3/8 text-center">1000mm</div>
                  <div className="absolute right-1/8 text-center">2000mm</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
