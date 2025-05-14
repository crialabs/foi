"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  defaultCountry?: string
}

export function PhoneInput({ className, defaultCountry = "BR", ...props }: PhoneInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState(props.value || "")

  // Formatar número de telefone brasileiro (XX) XXXXX-XXXX
  const formatPhoneNumber = (value: string) => {
    if (!value) return value

    // Remover todos os caracteres não numéricos
    const phoneNumber = value.replace(/\D/g, "")

    // Aplicar máscara para telefone brasileiro
    if (defaultCountry === "BR") {
      if (phoneNumber.length <= 2) {
        return `(${phoneNumber}`
      }
      if (phoneNumber.length <= 7) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`
      }
      if (phoneNumber.length <= 11) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`
      }
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`
    }

    // Retornar sem formatação para outros países
    return phoneNumber
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    setValue(formattedValue)

    // Chamar o onChange do componente pai
    if (props.onChange) {
      const event = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue,
        },
      }
      props.onChange(event)
    }
  }

  return (
    <Input
      ref={inputRef}
      type="tel"
      className={cn("", className)}
      value={formatPhoneNumber(value.toString())}
      onChange={handleChange}
      {...props}
    />
  )
}
