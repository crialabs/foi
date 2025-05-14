"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Filter, X } from "lucide-react"

// Mock data for preview
const mockLeads = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`,
  whatsapp: `+123456789${i}`,
  age: String(20 + Math.floor(Math.random() * 40)),
  supplements: JSON.stringify(["whey", "creatine"].slice(0, Math.floor(Math.random() * 3))),
  status: ["new", "contacted", "converted", "lost"][Math.floor(Math.random() * 4)],
  created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
}))

export default function LeadsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [supplement, setSupplement] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortField, setSortField] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  const pageSize = 10
  const totalLeads = mockLeads.length
  const totalPages = Math.ceil(totalLeads / pageSize)

  // Get paginated leads
  const paginatedLeads = mockLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const resetFilters = () => {
    setMinAge("")
    setMaxAge("")
    setSupplement("")
    setStartDate("")
    setEndDate("")
    setSortField("created_at")
    setSortOrder("desc")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Management</h1>
        <p className="text-muted-foreground">View and manage all collected leads</p>
      </div>

      {/* Filter Card */}
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
              <Button size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <div className="space-y-4">
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Email</th>
                <th className="p-2 text-left font-medium">WhatsApp</th>
                <th className="p-2 text-left font-medium">Age</th>
                <th className="p-2 text-left font-medium">Supplements</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">Date</th>
                <th className="p-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="border-b">
                  <td className="p-2 font-medium">{lead.email}</td>
                  <td className="p-2">{lead.whatsapp}</td>
                  <td className="p-2">{lead.age}</td>
                  <td className="p-2">
                    {JSON.parse(lead.supplements).map((supplement: string) => (
                      <Badge key={supplement} variant="outline" className="mr-1">
                        {supplement}
                      </Badge>
                    ))}
                  </td>
                  <td className="p-2">
                    <Badge
                      variant={
                        lead.status === "new"
                          ? "outline"
                          : lead.status === "contacted"
                            ? "secondary"
                            : lead.status === "converted"
                              ? "default"
                              : "destructive"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="p-2">{formatDate(lead.created_at)}</td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedLeads.length} of {totalLeads} leads
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <p className="text-sm">
              Page {currentPage} of {totalPages}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
