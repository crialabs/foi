"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#000000")
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setColor(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setColor(newColor)
    onChange(newColor)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newColor = e.target.value

    // Adicionar # se não existir
    if (newColor && !newColor.startsWith("#")) {
      newColor = `#${newColor}`
    }

    // Validar se é uma cor hexadecimal válida
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
      setColor(newColor)
      onChange(newColor)
    } else {
      setColor(newColor)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", className)}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: color }} />
            <span>{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="color-picker">Cor</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="color-picker"
                type="color"
                value={color}
                onChange={handleChange}
                className="h-10 w-10 p-0 cursor-pointer"
              />
              <Input value={color} onChange={handleInputChange} className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              "#FF6B6B",
              "#4ECDC4",
              "#45B7D1",
              "#FFA5A5",
              "#A5FFD6",
              "#FFC145",
              "#FF6B8B",
              "#845EC2",
              "#D65DB1",
              "#FF9671",
            ].map((presetColor) => (
              <button
                key={presetColor}
                className="h-6 w-6 rounded-md border"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  setColor(presetColor)
                  onChange(presetColor)
                }}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
