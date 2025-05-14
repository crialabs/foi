"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PhoneInput } from "@/components/ui/phone-input"

// Esquema de validação Zod para o formulário de contato
const formSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  whatsapp: z.string().min(10, { message: "Número de WhatsApp deve ser válido" }),
})

interface ContactStepProps {
  name: string
  email: string
  whatsapp: string
  onChange: (data: { name?: string; email?: string; whatsapp?: string }) => void
}

export default function ContactStep({ name, email, whatsapp, onChange }: ContactStepProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name,
      email,
      whatsapp,
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onChange(values)
  }

  // Atualizar o formulário pai sempre que qualquer campo mudar
  const handleFieldChange = (field: keyof z.infer<typeof formSchema>, value: string) => {
    form.setValue(field, value)
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">Informações de Contato</h3>
        <p className="text-sm text-muted-foreground">Usaremos estas informações para enviar seu prêmio</p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Seu nome completo"
                    {...field}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    {...field}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de WhatsApp</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="(00) 00000-0000"
                    defaultCountry="BR"
                    {...field}
                    onChange={(value) => handleFieldChange("whatsapp", value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}
