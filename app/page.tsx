import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import type { Database } from "@/lib/supabase/database.types"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { z } from "zod"

// Esquema de validação Zod para o formulário
const formSchema = z.object({
  age: z.string().min(1, { message: "Idade é obrigatória" }),
  supplements: z.array(z.string()).min(1, { message: "Selecione pelo menos um suplemento" }),
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  whatsapp: z.string().min(10, { message: "Número de WhatsApp deve ser válido" }),
})

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Buscar formulário ativo
  const { data: activeForms } = await supabase
    .from("forms")
    .select("id, title")
    .eq("published", true)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)

  const activeForm = activeForms && activeForms.length > 0 ? activeForms[0] : null

  // Buscar configurações
  const { data: settings } = await supabase.from("settings").select("*").single()

  // Se houver um formulário ativo, redirecionar para ele
  // Se houver um formulário ativo, usar seu ID para o link, caso contrário usar "/forms"
  const formUrl = activeForm?.id ? `/form/${activeForm.id}` : "/forms"

  // Se houver um formulário ativo, redirecionar para ele
  // if (activeForm?.id) {
  //   redirect(`/form/${activeForm.id}`)
  // }

  // Configurações padrão se não encontradas
  const defaultSettings = {
    primaryColor: "#6d28d9",
    secondaryColor: "#a855f7",
    accentColor: "#f3c677",
    fontFamily: "Geist",
    logoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ativo-5-1_310x_1f85aeca-8470-4f4b-aedc-718d644725cd%20%281%29-i4MrDQpYtMqcmvKo68WW8WjnUwrksd.png",
  }

  const siteSettings = settings || defaultSettings

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <Link href={activeForm ? `/forms/${activeForm.id}` : "/forms"} className="block w-full h-full">
          <Card className="w-full max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="w-full mb-6">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-si9b6oqeMPpKchCAZoGawxSxUziQzV.png"
                  alt="ATENA Nutrition"
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <p className="text-xl font-bold text-center">TOQUE AQUI PARA COMEÇAR</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  )
}
