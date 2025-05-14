"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Palette, RefreshCw } from "lucide-react"

interface StyleFormProps {
  settings: Record<string, string>
}

export function StyleForm({ settings }: StyleFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    primaryColor: settings.primaryColor || "#6d28d9",
    secondaryColor: settings.secondaryColor || "#a855f7",
    accentColor: settings.accentColor || "#f3c677",
    fontFamily: settings.fontFamily || "Geist",
    logoUrl: settings.logoUrl || "/logo.png",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update styling:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetToDefaults = () => {
    setFormData({
      primaryColor: "#6d28d9",
      secondaryColor: "#a855f7",
      accentColor: "#f3c677",
      fontFamily: "Geist",
      logoUrl: "/logo.png",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
        <CardDescription>Customize the look and feel of your application</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList className="mb-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: formData.primaryColor }} />
                <Input
                  id="primaryColor"
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange("primaryColor", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: formData.secondaryColor }} />
                <Input
                  id="secondaryColor"
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange("secondaryColor", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: formData.accentColor }} />
                <Input
                  id="accentColor"
                  type="text"
                  value={formData.accentColor}
                  onChange={(e) => handleChange("accentColor", e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select value={formData.fontFamily} onValueChange={(value) => handleChange("fontFamily", value)}>
                <SelectTrigger id="fontFamily">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geist">Geist</SelectItem>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                  <SelectItem value="Montserrat">Montserrat</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="text"
                value={formData.logoUrl}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
              />
            </div>

            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Upload your logo to a hosting service and paste the URL here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetToDefaults} type="button">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Palette className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  )
}
