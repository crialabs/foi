import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Database } from "@/lib/supabase/database.types"

export const dynamic = "force-dynamic"

export default async function FormsPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Buscar formulários publicados
  const { data: forms, error } = await supabase
    .from("forms")
    .select("*")
    .eq("published", true)
    .eq("active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Erro ao buscar formulários:", error)
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar formulários</h1>
        <p>Ocorreu um erro ao carregar os formulários. Por favor, tente novamente mais tarde.</p>
      </div>
    )
  }

  // Se houver apenas um formulário, redirecionar diretamente para ele
  if (forms && forms.length === 1) {
    redirect(`/forms/${forms[0].id}`)
  }

  // Buscar configurações de estilo
  const { data: settings } = await supabase.from("settings").select("*").single()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: settings?.primary_color ? `${settings.primary_color}15` : undefined,
      }}
    >
      <main className="flex-1 container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Formulários Disponíveis</h1>

        {forms && forms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{form.title}</CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Clique para participar e concorrer a prêmios!</p>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full"
                    style={{
                      backgroundColor: settings?.primary_color || undefined,
                    }}
                  >
                    <Link href={`/forms/${form.id}`}>Participar</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4">Nenhum formulário disponível no momento.</p>
            <Button asChild>
              <Link href="/">Voltar para a página inicial</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
