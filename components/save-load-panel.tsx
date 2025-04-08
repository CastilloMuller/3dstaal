"use client"

import { useState, useEffect } from "react"
import { useStructure, type StructureData } from "./structure-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Save, FolderOpen, Trash2 } from "lucide-react"

type SavedDesign = {
  id: string
  name: string
  date: string
  data: StructureData
}

export default function SaveLoadPanel() {
  const { structure, updateStructure } = useStructure()
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])
  const [designName, setDesignName] = useState("")

  // Load saved designs from localStorage on component mount
  useEffect(() => {
    const loadSavedDesigns = () => {
      try {
        const saved = localStorage.getItem("savedStructureDesigns")
        if (saved) {
          setSavedDesigns(JSON.parse(saved))
        }
      } catch (error) {
        console.error("Error loading saved designs:", error)
      }
    }

    loadSavedDesigns()
  }, [])

  // Save current design
  const saveDesign = () => {
    if (!designName.trim()) return

    const newDesign: SavedDesign = {
      id: `design-${Date.now()}`,
      name: designName,
      date: new Date().toLocaleString(),
      data: { ...structure },
    }

    const updatedDesigns = [...savedDesigns, newDesign]
    setSavedDesigns(updatedDesigns)

    try {
      localStorage.setItem("savedStructureDesigns", JSON.stringify(updatedDesigns))
      setDesignName("")
    } catch (error) {
      console.error("Error saving design:", error)
    }
  }

  // Load a saved design
  const loadDesign = (design: SavedDesign) => {
    updateStructure(design.data)
  }

  // Delete a saved design
  const deleteDesign = (id: string) => {
    const updatedDesigns = savedDesigns.filter((design) => design.id !== id)
    setSavedDesigns(updatedDesigns)

    try {
      localStorage.setItem("savedStructureDesigns", JSON.stringify(updatedDesigns))
    } catch (error) {
      console.error("Error deleting design:", error)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="design-name" className="mb-2 block">
                  Design Name
                </Label>
                <Input
                  id="design-name"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="Enter a name for your design"
                />
              </div>
              <Button onClick={saveDesign} disabled={!designName.trim()}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Saved Designs</h3>

        {savedDesigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">No saved designs yet.</p>
        ) : (
          <div className="space-y-2">
            {savedDesigns.map((design) => (
              <Card key={design.id}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{design.name}</h4>
                      <p className="text-xs text-muted-foreground">{design.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => loadDesign(design)}>
                        <FolderOpen className="h-4 w-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Design</DialogTitle>
                          </DialogHeader>
                          <p>Are you sure you want to delete "{design.name}"?</p>
                          <div className="flex justify-end gap-2 mt-4">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button variant="destructive" onClick={() => deleteDesign(design.id)}>
                                Delete
                              </Button>
                            </DialogClose>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
