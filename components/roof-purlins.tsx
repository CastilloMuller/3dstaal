"use client"

export default function RoofPurlins({
  width,
  length,
  gutterHeight,
  roofHeight,
  numPurlins,
  numSpaces,
  purlinWidth,
  purlinDepth,
  purlinColor,
}) {
  // Bereken de schuine lengte van het dak (hypotenuse)
  const roofSlopeLength = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(roofHeight, 2))

  // Bereken het aantal purlins op basis van maximale afstand van 1500mm (1.5m)
  const maxPurlinSpacing = 1.5 // 1500mm

  // Bereken het aantal benodigde gordingen
  // Als de schuine lengte kleiner is dan de maximale afstand, zijn er geen tussenliggende gordingen nodig
  const numIntermediatePurlins = Math.max(0, Math.ceil(roofSlopeLength / maxPurlinSpacing) - 1)

  // Array om purlin posities op te slaan
  const purlins = []
  const halfWidth = width / 2
  const ridgeOffset = 0.1 // Afstand tussen de twee nokpurlins (100mm)

  // Voeg gootpurlin toe
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

  // Voeg twee nokpurlins toe
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
            <boxGeometry args={[purlinWidth, purlinWidth, length]} />
            <meshStandardMaterial color={purlinColor} />
          </mesh>

          {/* Right side purlin */}
          <mesh position={[purlin.rightX, purlin.rightY, 0]}>
            <boxGeometry args={[purlinWidth, purlinWidth, length]} />
            <meshStandardMaterial color={purlinColor} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

