"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface StylePreviewProps {
  settings: Record<string, string>
}

export function StylePreview({ settings }: StylePreviewProps) {
  const primaryColor = settings.primaryColor || "#6d28d9"
  const secondaryColor = settings.secondaryColor || "#a855f7"
  const accentColor = settings.accentColor || "#f3c677"
  const fontFamily = settings.fontFamily || "Geist"

  return (
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
              backgroundColor: primaryColor,
              fontFamily,
            }}
          >
            <h3 className="mb-2 text-xl font-bold text-white">Quiz Header</h3>
            <p className="text-white/80">Complete the quiz to spin the prize wheel!</p>
          </div>

          <div className="space-y-4 rounded-lg border p-6">
            <h3 className="text-lg font-medium" style={{ fontFamily }}>
              Which supplements do you consume?
            </h3>
            <p className="text-sm text-muted-foreground" style={{ fontFamily }}>
              Select all that apply
            </p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="preview-whey" />
                <Label htmlFor="preview-whey" style={{ fontFamily }}>
                  Whey Isolado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="preview-creatine" />
                <Label htmlFor="preview-creatine" style={{ fontFamily }}>
                  Creatina
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="preview-collagen" />
                <Label htmlFor="preview-collagen" style={{ fontFamily }}>
                  Colágeno Hidrolisado
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preview-email" style={{ fontFamily }}>
                Email Address
              </Label>
              <Input id="preview-email" type="email" placeholder="your.email@example.com" />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" style={{ fontFamily }}>
                Back
              </Button>
              <Button
                style={{
                  backgroundColor: primaryColor,
                  color: "white",
                  fontFamily,
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
                background: `conic-gradient(${primaryColor}, ${secondaryColor}, ${primaryColor}, ${secondaryColor})`,
                border: `4px solid ${accentColor}`,
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
