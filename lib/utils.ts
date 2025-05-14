import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createWhatsAppUrl(phone: string, message: string): string {
  // Clean the phone number (remove any non-digit characters)
  const cleanPhone = phone.replace(/\D/g, "")

  // Ensure the phone number has the country code (default to Brazil +55)
  const phoneWithCountryCode = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message)

  // Create the WhatsApp URL
  return `https://wa.me/${phoneWithCountryCode}?text=${encodedMessage}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}
