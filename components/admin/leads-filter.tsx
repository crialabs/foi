"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Filter, X } from "lucide-react"

export function LeadsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [minAge, setMinAge] = useState(searchParams.get("minAge") || "")
  const [maxAge, setMaxAge] = useState(searchParams.get("maxAge") || "")
  const [supplement, setSupplement] = useState(searchParams.get("supplement") || "")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")
  const [sortField, setSortField] = useState(searchParams.get("sortField") || "created_at")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "desc")

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (minAge) params.set("minAge", minAge)
    if (maxAge) params.set("maxAge", maxAge)
    if (supplement) params.set("supplement", supplement)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    if (sortField) params.set("sortField", sortField)
    if (sortOrder) params.set("sortOrder", sortOrder)

    router.push(`/admin/leads?${params.toString()}`)
  }

  const resetFilters = () => {
    setMinAge("")
    setMaxAge("")
    setSupplement("")
    setStartDate("")
    setEndDate("")
    setSortField("created_at")
    setSortOrder("desc")
    router.push("/admin/leads")
  }

  const exportData = async () => {
    try {
      const response = await fetch("/api/admin/export-leads")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "leads.csv"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export data:", error)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="minAge">Min Age</Label>
            <Input
              id="minAge"
              type="number"
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder="Min"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAge">Max Age</Label>
            <Input
              id="maxAge"
              type="number"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              placeholder="Max"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplement">Supplement</Label>
            <Select value={supplement} onValueChange={setSupplement}>
              <SelectTrigger id="supplement">
                <SelectValue placeholder="Select supplement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="whey">Whey Isolado</SelectItem>
                <SelectItem value="creatine">Creatina</SelectItem>
                <SelectItem value="collagen">Colágeno Hidrolisado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="sortField" className="mr-2">
              Sort by:
            </Label>
            <Select value={sortField} onValueChange={setSortField}>
              <SelectTrigger id="sortField" className="w-[180px]">
                <SelectValue placeholder="Sort field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger id="sortOrder" className="w-[100px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetFilters} size="sm">
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={applyFilters} size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={exportData} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
