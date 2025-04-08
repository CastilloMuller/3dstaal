"use client"

import { Text } from "@react-three/drei"

export default function OrientationGizmos({
  width,
  length,
  gutterHeight,
  roofHeight,
  showFront,
  showBack,
  showLeft,
  showRight,
}) {
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
      {orientations.map((orient, index) => {
        return orient.show ? (
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
        ) : null
      })}
    </group>
  )
}
