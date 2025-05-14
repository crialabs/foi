"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

interface WhatsAppButtonProps {
  phoneNumber: string
  message?: string
  className?: string
  buttonText?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function WhatsAppButton({
  phoneNumber,
  message = "",
  className = "",
  buttonText = "WhatsApp",
  size = "default",
  variant = "default",
}: WhatsAppButtonProps) {
  const [messageText, setMessageText] = useState(message || "Olá, tudo bem?")
  const [isLoading, setIsLoading] = useState(false)

  // Template messages based on common scenarios
  const templates = [
    {
      label: "Saudação",
      text: "Olá, tudo bem? Estamos à disposição para ajudar.",
    },
    {
      label: "Agradecimento",
      text: "Olá, obrigado por participar do nosso quiz!",
    },
    {
      label: "Premiação",
      text: "Parabéns! Você ganhou um prêmio! Entre em contato para resgatar.",
    },
    {
      label: "Follow-up",
      text: "Olá, estamos entrando em contato para verificar se podemos ajudar com mais alguma informação.",
    },
  ]

  const createWhatsAppUrl = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, "")
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  const handleSendMessage = async () => {
    const whatsappUrl = createWhatsAppUrl(phoneNumber, messageText)
    window.open(whatsappUrl, "_blank")

    try {
      // Log the message to our API (optional)
      setIsLoading(true)
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phoneNumber,
          message: messageText,
        }),
      })
    } catch (error) {
      console.error("Error logging WhatsApp message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectTemplate = (text: string) => {
    setMessageText(text)
  }

  // Simple button without popover
  if (size === "icon" || size === "sm") {
    return (
      <a
        href={createWhatsAppUrl(phoneNumber, messageText)}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <Button
          variant={variant}
          size={size}
          className={`${variant === "default" ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {size === "icon" ? (
            <MessageSquare />
          ) : (
            <>
              <MessageSquare className="mr-1" size={16} />
              {buttonText}
            </>
          )}
        </Button>
      </a>
    )
  }

  // Full button with popover for message customization
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`${variant === "default" ? "bg-green-600 hover:bg-green-700" : ""} ${className}`}
        >
          <MessageSquare className="mr-2" size={18} />
          {buttonText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Enviar mensagem via WhatsApp</h4>
          <div className="grid gap-2">
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => selectTemplate(template.text)}
                  className="text-xs justify-start h-auto py-1.5 px-2"
                >
                  {template.label}
                </Button>
              ))}
            </div>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="min-h-[100px]"
              placeholder="Digite sua mensagem..."
            />
            <Button onClick={handleSendMessage} className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              <Send className="mr-2" size={16} />
              Enviar via WhatsApp
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
