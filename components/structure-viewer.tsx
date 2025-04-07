"use client"
import { Line, Text } from "@react-three/drei"
import { useStructure, type Opening } from "../contexts/structure-context"
import * as THREE from "three"

function degToRad(degrees: number) {
  return (degrees * Math.PI) / 180
}

function Structure() {
  const { structure, selectedWall, setSelectedWall, addOpening } = useStructure()
  const { width, length, gutterHeight, roofAngle } = structure

  // Calculate roof height based on angle and width
  const roofHeight = (width / 2) * Math.tan(degToRad(roofAngle))
  const peakHeight = gutterHeight + roofHeight

  // Define the structure vertices
  const vertices = {
    // Base rectangle
    a: new THREE.Vector3(-width / 2, 0, -length / 2),
    b: new THREE.Vector3(width / 2, 0, -length / 2),
    c: new THREE.Vector3(width / 2, 0, length / 2),
    d: new THREE.Vector3(-width / 2, 0, length / 2),

    // Top rectangle at gutter height
    e: new THREE.Vector3(-width / 2, gutterHeight, -length / 2),
    f: new THREE.Vector3(width / 2, gutterHeight, -length / 2),
    g: new THREE.Vector3(width / 2, gutterHeight, length / 2),
    h: new THREE.Vector3(-width / 2, gutterHeight, length / 2),

    // Roof peak
    i: new THREE.Vector3(0, peakHeight, -length / 2),
    j: new THREE.Vector3(0, peakHeight, length / 2),
  }

  // Define the structure lines
  const lines = [
    // Base
    [vertices.a, vertices.b],
    [vertices.b, vertices.c],
    [vertices.c, vertices.d],
    [vertices.d, vertices.a],

    // Vertical supports
    [vertices.a, vertices.e],
    [vertices.b, vertices.f],
    [vertices.c, vertices.g],
    [vertices.d, vertices.h],

    // Top rectangle
    [vertices.e, vertices.f],
    [vertices.f, vertices.g],
    [vertices.g, vertices.h],
    [vertices.h, vertices.e],

    // Roof
    [vertices.e, vertices.i],
    [vertices.f, vertices.i],
    [vertices.h, vertices.j],
    [vertices.g, vertices.j],
    [vertices.i, vertices.j],
  ]

  // Define wall configurations
  const walls = [
    {
      id: "front",
      position: [0, gutterHeight / 2, -length / 2 - 0.01],
      rotation: [0, 0, 0],
      size: [width, gutterHeight],
    },
    {
      id: "back",
      position: [0, gutterHeight / 2, length / 2 + 0.01],
      rotation: [0, Math.PI, 0],
      size: [width, gutterHeight],
    },
    {
      id: "left",
      position: [-width / 2 - 0.01, gutterHeight / 2, 0],
      rotation: [0, Math.PI / 2, 0],
      size: [length, gutterHeight],
    },
    {
      id: "right",
      position: [width / 2 + 0.01, gutterHeight / 2, 0],
      rotation: [0, -Math.PI / 2, 0],
      size: [length, gutterHeight],
    },
  ]

  // Handle wall click
  const handleWallClick = (wallId: string, event: THREE.Intersection) => {
    event.stopPropagation()
    setSelectedWall(wallId)

    // Get the clicked point in local coordinates
    const point = event.point

    // Determine wall dimensions and orientation
    let wallWidth = 0
    let wallHeight = 0
    let distanceFromLeft = 0
    let distanceFromBottom = 0

    if (wallId === "front" || wallId === "back") {
      wallWidth = width
      wallHeight = gutterHeight
      distanceFromLeft = point.x + width / 2
      distanceFromBottom = point.y
    } else if (wallId === "left" || wallId === "right") {
      wallWidth = length
      wallHeight = gutterHeight
      distanceFromLeft = point.z + length / 2
      distanceFromBottom = point.y
    }

    // Add a new opening at the clicked position
    if (wallWidth > 0 && wallHeight > 0) {
      const defaultOpeningWidth = Math.min(1, wallWidth * 0.3)
      const defaultOpeningHeight = Math.min(2, wallHeight * 0.7)

      // Ensure the opening fits within the wall
      const adjustedDistanceFromLeft = Math.max(
        defaultOpeningWidth / 2,
        Math.min(distanceFromLeft, wallWidth - defaultOpeningWidth / 2),
      )

      const adjustedDistanceFromBottom = Math.max(
        defaultOpeningHeight / 2,
        Math.min(distanceFromBottom, wallHeight - defaultOpeningHeight / 2),
      )

      addOpening({
        type: "door",
        wall: wallId as Opening["wall"],
        width: defaultOpeningWidth,
        height: defaultOpeningHeight,
        distanceFromLeft: adjustedDistanceFromLeft - defaultOpeningWidth / 2,
        distanceFromBottom: adjustedDistanceFromBottom - defaultOpeningHeight / 2,
      })
    }
  }

  return (
    <>
      {/* Structure frame */}
      {lines.map((line, index) => (
        <Line key={index} points={line} color="black" lineWidth={1.5} />
      ))}

      {/* Dimension labels */}
      <Text
        position={[0, -0.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`${width.toFixed(2)}m × ${length.toFixed(2)}m`}
      </Text>

      <Text
        position={[-width / 2 - 0.3, gutterHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`${gutterHeight.toFixed(2)}m`}
      </Text>

      <Text
        position={[0, gutterHeight + roofHeight / 2, -length / 2 - 0.3]}
        rotation={[0, 0, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`${roofAngle.toFixed(1)}°`}
      </Text>

      {/* Interactive walls */}
      {walls.map((wall) => (
        <group key={wall.id} position={wall.position as any} rotation={wall.rotation as any}>
          <mesh
            onClick={(e) => {
              e.stopPropagation()
              handleWallClick(wall.id, e.intersections[0])
            }}
            onPointerOver={() => (document.body.style.cursor = "pointer")}
            onPointerOut={() => (document.body.style.cursor = "auto")}
          >
            <planeGeometry args={wall.size as [number, number]} />
            <meshBasicMaterial
              transparent
              opacity={selectedWall === wall.id ? 0.2 : 0.01}
              color={selectedWall === wall.id ? "blue" : "gray"}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* Render openings */}
      <Openings />
    </>
  )
}

function Openings() {
  const { structure } = useStructure()
  const { width, length, gutterHeight } = structure

  return (
    <>
      {structure.openings.map((opening) => {
        const position = new THREE.Vector3()
        const size = new THREE.Vector2(opening.width, opening.height)
        let rotation = [0, 0, 0]

        // Position the opening based on the wall
        if (opening.wall === "front") {
          position.set(
            -width / 2 + opening.distanceFromLeft + opening.width / 2,
            opening.distanceFromBottom + opening.height / 2,
            -length / 2 - 0.01,
          )
          rotation = [0, 0, 0]
        } else if (opening.wall === "back") {
          position.set(
            width / 2 - opening.distanceFromLeft - opening.width / 2,
            opening.distanceFromBottom + opening.height / 2,
            length / 2 + 0.01,
          )
          rotation = [0, Math.PI, 0]
        } else if (opening.wall === "left") {
          position.set(
            -width / 2 - 0.01,
            opening.distanceFromBottom + opening.height / 2,
            -length / 2 + opening.distanceFromLeft + opening.width / 2,
          )
          rotation = [0, Math.PI / 2, 0]
        } else if (opening.wall === "right") {
          position.set(
            width / 2 + 0.01,
            opening.distanceFromBottom + opening.height / 2,
            length / 2 - opening.distanceFromLeft - opening.width / 2,
          )
          rotation = [0, -Math.PI / 2, 0]
        }

        return (
          <group key={opening.id} position={position} rotation={rotation as any}>
            {/* Opening outline */}
            <Line
              points={[
                new THREE.Vector3(-size.x / 2, -size.y / 2, 0),
                new THREE.Vector3(size.x / 2, -size.y / 2, 0),
                new THREE.Vector3(size.x / 2, size.y / 2, 0),
                new THREE.Vector3(-size.x / 2, size.y / 2, 0),
                new THREE.Vector3(-size.x / 2, -size.y / 2, 0),
              ]}
              color={opening.type === "door" ? "brown" : "lightblue"}
              lineWidth={2}
            />

            {/* Label */}
            <Text position={[0, -size.y / 2 - 0.1, 0]} fontSize={0.15} color="black" anchorX="center" anchorY="top">
              {`${opening.type} ${size.x.toFixed(2)}m × ${size.y.toFixed(2)}m`}
            </Text>

            {/* Distance labels */}
            <Text position={[0, -size.y / 2 - 0.3, 0]} fontSize={0.15} color="black" anchorX="center" anchorY="top">
              {`${opening.distanceFromLeft.toFixed(2)}m from left`}
            </Text>
          </group>
        )
      })}
    </>
  )
}

