"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, Trash } from "lucide-react"

interface Prize {
  id: number
  name: string
  description: string
  probability: number
  active: boolean
}

interface PrizeTableProps {
  prizes: Prize[]
}

export function PrizeTable({ prizes: initialPrizes }: PrizeTableProps) {
  const router = useRouter()
  const [prizes, setPrizes] = useState(initialPrizes)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<Prize>>({})

  const startEditing = (prize: Prize) => {
    setEditingId(prize.id)
    setEditValues({
      name: prize.name,
      description: prize.description,
      probability: prize.probability,
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleEditChange = (field: keyof Prize, value: string | number | boolean) => {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }

  const saveChanges = async () => {
    if (!editingId) return

    try {
      const response = await fetch(`/api/admin/prizes/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editValues),
      })

      if (response.ok) {
        setPrizes((prev) => prev.map((prize) => (prize.id === editingId ? { ...prize, ...editValues } : prize)))
        cancelEditing()
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update prize:", error)
    }
  }

  const toggleActive = async (id: number, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/prizes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !active }),
      })

      if (response.ok) {
        setPrizes((prev) => prev.map((prize) => (prize.id === id ? { ...prize, active: !active } : prize)))
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to toggle prize status:", error)
    }
  }

  const deletePrize = async (id: number) => {
    if (confirm("Are you sure you want to delete this prize?")) {
      try {
        const response = await fetch(`/api/admin/prizes/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          setPrizes((prev) => prev.filter((prize) => prize.id !== id))
          router.refresh()
        }
      } catch (error) {
        console.error("Failed to delete prize:", error)
      }
    }
  }

  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Current Prizes</h2>
        <Badge variant={totalProbability === 100 ? "outline" : "destructive"}>
          Total Probability: {totalProbability}%
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prizes.length > 0 ? (
              prizes.map((prize) => (
                <TableRow key={prize.id}>
                  <TableCell>
                    {editingId === prize.id ? (
                      <Input
                        value={editValues.name || ""}
                        onChange={(e) => handleEditChange("name", e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      prize.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === prize.id ? (
                      <Input
                        value={editValues.description || ""}
                        onChange={(e) => handleEditChange("description", e.target.value)}
                        className="h-8"
                      />
                    ) : (
                      prize.description
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === prize.id ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editValues.probability || ""}
                        onChange={(e) => handleEditChange("probability", Number.parseInt(e.target.value))}
                        className="h-8 w-20"
                      />
                    ) : (
                      `${prize.probability}%`
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch checked={prize.active} onCheckedChange={() => toggleActive(prize.id, prize.active)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === prize.id ? (
                        <>
                          <Button variant="ghost" size="icon" onClick={cancelEditing}>
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={saveChanges}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => startEditing(prize)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePrize(prize.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No prizes configured
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalProbability !== 100 && (
        <p className="text-sm text-destructive">
          Warning: Total probability should equal 100%. Current total: {totalProbability}%
        </p>
      )}
    </div>
  )
}
