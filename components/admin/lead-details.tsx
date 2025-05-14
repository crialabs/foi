"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send } from "lucide-react"

interface Lead {
  id: number
  email: string
  whatsapp: string
  age: string
  supplements: string
  status: string
  created_at: string
}

interface LeadDetailsProps {
  lead: Lead
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(lead.status || "new")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const supplements = JSON.parse(lead.supplements)

  const updateStatus = async () => {
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update lead status:", error)
    }
  }

  const sendWhatsAppMessage = async () => {
    if (!message.trim()) return

    setIsSending(true)

    try {
      // In a real app, you would integrate with WhatsApp API
      // For now, we'll just open WhatsApp with the message
      const number = lead.whatsapp.replace(/\D/g, "")
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank")

      // Record the message in your database
      await fetch(`/api/admin/leads/${lead.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Tabs defaultValue="info">
      <TabsList className="mb-4">
        <TabsTrigger value="info">Lead Info</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-sm">{lead.email}</p>
                </div>

                <div className="space-y-1">
                  <Label>WhatsApp</Label>
                  <p className="text-sm">{lead.whatsapp}</p>
                </div>

                <div className="space-y-1">
                  <Label>Age</Label>
                  <p className="text-sm">{lead.age}</p>
                </div>

                <div className="space-y-1">
                  <Label>Joined</Label>
                  <p className="text-sm">{format(new Date(lead.created_at), "PPP")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Supplements</Label>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {supplements.length > 0 ? (
                      supplements.map((supplement: string) => (
                        <Badge key={supplement} variant="outline">
                          {supplement}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No supplements selected</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 pt-1">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button onClick={updateStatus} size="sm">
                      Update
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Prize</Label>
                  <p className="text-sm text-muted-foreground">Prize information will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="contact">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Send WhatsApp Message</h3>
              </div>

              <Textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />

              <div className="flex justify-end">
                <Button onClick={sendWhatsAppMessage} disabled={isSending || !message.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSending ? "Sending..." : "Send Message"}
                </Button>
              </div>

              <div className="pt-4">
                <h4 className="mb-2 text-sm font-medium">Quick Templates</h4>
                <div className="grid gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      setMessage("Hello! Thank you for participating in our quiz. How are you enjoying your prize?")
                    }
                  >
                    Prize Follow-up
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      setMessage(
                        "Hi there! We noticed you're interested in our supplements. Would you like more information about our products?",
                      )
                    }
                  >
                    Product Information
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() =>
                      setMessage("Hello! We're running a special promotion this week. Would you like to know more?")
                    }
                  >
                    Special Promotion
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Interaction History</h3>
                <Button variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              <div className="rounded-md border">
                <div className="p-4 text-center text-sm text-muted-foreground">No interaction history available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
