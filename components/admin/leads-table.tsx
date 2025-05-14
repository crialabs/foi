"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Eye, MessageSquare, MoreHorizontal, Trash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LeadDetails } from "@/components/admin/lead-details"

interface Lead {
  id: number
  email: string
  whatsapp: string
  age: string
  supplements: string
  status: string
  created_at: string
}

interface LeadsTableProps {
  leads: Lead[]
  currentPage: number
  totalPages: number
  totalLeads: number
}

export function LeadsTable({ leads, currentPage, totalPages, totalLeads }: LeadsTableProps) {
  const router = useRouter()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const handlePageChange = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", page.toString())
    router.push(`/admin/leads?${searchParams.toString()}`)
  }

  const openWhatsApp = (whatsapp: string) => {
    const number = whatsapp.replace(/\D/g, "")
    window.open(`https://wa.me/${number}`, "_blank")
  }

  const deleteLead = async (id: number) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      try {
        const response = await fetch(`/api/admin/leads/${id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          router.refresh()
        }
      } catch (error) {
        console.error("Failed to delete lead:", error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline">New</Badge>
      case "contacted":
        return <Badge variant="secondary">Contacted</Badge>
      case "converted":
        return <Badge variant="success">Converted</Badge>
      case "lost":
        return <Badge variant="destructive">Lost</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Supplements</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.email}</TableCell>
                  <TableCell>{lead.whatsapp}</TableCell>
                  <TableCell>{lead.age}</TableCell>
                  <TableCell>
                    {JSON.parse(lead.supplements).map((supplement: string) => (
                      <Badge key={supplement} variant="outline" className="mr-1">
                        {supplement}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>{getStatusBadge(lead.status || "new")}</TableCell>
                  <TableCell>{format(new Date(lead.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openWhatsApp(lead.whatsapp)}
                        title="Contact via WhatsApp"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLead(lead)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Lead Details</DialogTitle>
                            <DialogDescription>Detailed information about this lead</DialogDescription>
                          </DialogHeader>
                          {selectedLead && <LeadDetails lead={selectedLead} />}
                        </DialogContent>
                      </Dialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => deleteLead(lead.id)}>
                            <Trash className="mr-2 h-4 w-4 text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No leads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {leads.length} of {totalLeads} leads
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
