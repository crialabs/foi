import type { ReactNode } from "react"

export interface FormElementType {
  type: string
  icon: ReactNode
  label: string
}

export interface FormElement {
  id: string
  type: string
  attributes: {
    label: string
    placeholder: string
    required: boolean
    options?: string[]
    [key: string]: any
  }
}
