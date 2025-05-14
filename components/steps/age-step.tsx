"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AgeStepProps {
  value: string
  onChange: (value: string) => void
}

export default function AgeStep({ value, onChange }: AgeStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">What is your age?</h3>
        <p className="text-sm text-muted-foreground">
          We need this information to provide you with appropriate recommendations
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          placeholder="Enter your age"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min="18"
          max="100"
          required
        />
      </div>
    </div>
  )
}
