"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Download, Filter, X, Eye, Check } from "lucide-react"

// Mock data for preview
const mockSubmissions = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`,
  prize: ["AMOSTRA", "FITA MÉTRICA", "CANETA", "BRINDE ESPECIAL", "BLOCO"][Math.floor(Math.random() * 5)],
  claimed: Math.random() > 0.5,
  created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
}))

export default function SubmissionsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [prizeFilter, setPrizeFilter] = useState("")
  const [claimedFilter, setClaimedFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [sortField, setSortField] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  const pageSize = 10
  const totalSubmissions = mockSubmissions.length
  const totalPages = Math.ceil(totalSubmissions / pageSize)

  // Get paginated submissions
  const paginatedSubmissions = mockSubmissions.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const resetFilters = () => {
    setPrizeFilter("")
    setClaimedFilter("")
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
        <h1 className="text-3xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">View and manage all prize wheel submissions</p>
      </div>

      {/* Filter Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="prizeFilter">Prize</Label>
              <Select value={prizeFilter} onValueChange={setPrizeFilter}>
                <SelectTrigger id="prizeFilter">
                  <SelectValue placeholder="All prizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All prizes</SelectItem>
                  <SelectItem value="AMOSTRA">AMOSTRA</SelectItem>
                  <SelectItem value="FITA MÉTRICA">FITA MÉTRICA</SelectItem>
                  <SelectItem value="CANETA">CANETA</SelectItem>
                  <SelectItem value="BRINDE ESPECIAL">BRINDE ESPECIAL</SelectItem>
                  <SelectItem value="BLOCO">BLOCO</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="claimedFilter">Status</Label>
              <Select value={claimedFilter} onValueChange={setClaimedFilter}>
                <SelectTrigger id="claimedFilter">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="claimed">Claimed</SelectItem>
                  <SelectItem value="unclaimed">Unclaimed</SelectItem>
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
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="prize">Prize</SelectItem>
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

      {/* Submissions Table */}
      <div className="space-y-4">
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Email</th>
                <th className="p-2 text-left font-medium">Prize</th>
                <th className="p-2 text-left font-medium">Status</th>
                <th className="p-2 text-left font-medium">Date</th>
                <th className="p-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubmissions.map((submission) => (
                <tr key={submission.id} className="border-b">
                  <td className="p-2 font-medium">{submission.email}</td>
                  <td className="p-2">
                    <Badge variant="outline">{submission.prize}</Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant={submission.claimed ? "default" : "secondary"}>
                      {submission.claimed ? "Claimed" : "Unclaimed"}
                    </Badge>
                  </td>
                  <td className="p-2">{formatDate(submission.created_at)}</td>
                  <td className="p-2 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {!submission.claimed && (
                        <Button variant="ghost" size="sm">
                          <Check className="mr-2 h-4 w-4" />
                          Mark Claimed
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedSubmissions.length} of {totalSubmissions} submissions
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
