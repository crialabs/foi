"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Palette, RefreshCw, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function StylingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    primaryColor: "#6d28d9",
    secondaryColor: "#a855f7",
    accentColor: "#f3c677",
    fontFamily: "Geist",
    logoUrl: "/logo.png",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Fetch current styling settings
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.settings) {
            setFormData({
              primaryColor: data.settings.primaryColor || "#6d28d9",
              secondaryColor: data.settings.secondaryColor || "#a855f7",
              accentColor: data.settings.accentColor || "#f3c677",
              fontFamily: data.settings.fontFamily || "Geist",
              logoUrl: data.settings.logoUrl || "/logo.png",
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch styling settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Upload logo if selected
      let logoUrl = formData.logoUrl
      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          logoUrl = uploadData.url
        } else {
          throw new Error("Failed to upload logo")
        }
      }

      // Save settings
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          logoUrl,
        }),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your styling changes have been applied successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to update styling:", error)
      toast({
        title: "Error",
        description: "Failed to save styling settings. Please try again.",
        variant: "destructive",
      })
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
    setLogoPreview(null)
    setLogoFile(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg font-medium">Loading styling settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Styling & Customization</h1>
        <p className="text-muted-foreground">Customize the appearance of your quiz application</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Style Form */}
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
                  <Label htmlFor="logoUpload">Logo Upload</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      {(logoPreview || formData.logoUrl) && (
                        <div className="h-16 w-16 overflow-hidden rounded-md border">
                          <img
                            src={logoPreview || formData.logoUrl}
                            alt="Logo preview"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
                      <Label
                        htmlFor="logo-upload"
                        className="flex h-10 cursor-pointer items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Logo
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended size: 200x200 pixels. Max file size: 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a URL if you already have your logo hosted elsewhere.
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

        {/* Style Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your styling changes will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div
                className="rounded-lg p-6"
                style={{
                  backgroundColor: formData.primaryColor,
                  fontFamily: formData.fontFamily,
                }}
              >
                <h3 className="mb-2 text-xl font-bold text-white">Quiz Header</h3>
                <p className="text-white/80">Complete the quiz to spin the prize wheel!</p>
              </div>

              <div className="space-y-4 rounded-lg border p-6">
                <h3 className="text-lg font-medium" style={{ fontFamily: formData.fontFamily }}>
                  Which supplements do you consume?
                </h3>
                <p className="text-sm text-muted-foreground" style={{ fontFamily: formData.fontFamily }}>
                  Select all that apply
                </p>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="preview-whey" />
                    <Label htmlFor="preview-whey" style={{ fontFamily: formData.fontFamily }}>
                      Whey Isolado
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="preview-creatine" />
                    <Label htmlFor="preview-creatine" style={{ fontFamily: formData.fontFamily }}>
                      Creatina
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="preview-collagen" />
                    <Label htmlFor="preview-collagen" style={{ fontFamily: formData.fontFamily }}>
                      Colágeno Hidrolisado
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preview-email" style={{ fontFamily: formData.fontFamily }}>
                    Email Address
                  </Label>
                  <Input id="preview-email" type="email" placeholder="your.email@example.com" />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" style={{ fontFamily: formData.fontFamily }}>
                    Back
                  </Button>
                  <Button
                    style={{
                      backgroundColor: formData.primaryColor,
                      color: "white",
                      fontFamily: formData.fontFamily,
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div className="relative h-40 w-40 mx-auto">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(${formData.primaryColor}, ${formData.secondaryColor}, ${formData.primaryColor}, ${formData.secondaryColor})`,
                    border: `4px solid ${formData.accentColor}`,
                  }}
                />
                <div
                  className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: formData.accentColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
