"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ItemData, ItemType } from "./items-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit2 } from "lucide-react"

type ItemsListProps = {
  items: ItemData[]
  onSelectItem: (id: string) => void
}

// Pas de ItemsList component aan om breder te zijn
export default function ItemsList({ items, onSelectItem }: ItemsListProps) {
  if (items.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Aanpassen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Geen items toegevoegd.
            <br />
            Voeg eerst een item toe via het "Deuren & Ramen" tabblad.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Aanpassen</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onSelect={() => onSelectItem(item.id)} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

type ItemCardProps = {
  item: ItemData
  onSelect: () => void
}

// Fix the edit button functionality
function ItemCard({ item, onSelect }: ItemCardProps) {
  return (
    <Card className="p-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{getItemTypeName(item.type)}</h3>
          <p className="text-sm text-muted-foreground">
            {item.width}×{item.height}mm - {getWallName(item.wall)}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onSelect()
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

function getItemTypeName(type: ItemType): string {
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

function getWallName(wall: string): string {
  switch (wall) {
    case "front":
      return "Voorkant"
    case "back":
      return "Achterkant"
    case "left":
      return "Linkerkant"
    case "right":
      return "Rechterkant"
    default:
      return wall
  }
}

