import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Award, Calendar } from "lucide-react"
import { StatsCard } from "@/components/admin/stats-card"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  // Get total leads
  const { count: totalLeads } = await supabase.from("quiz_submissions").select("*", { count: "exact", head: true })

  // Get today's leads
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todayLeads } = await supabase
    .from("quiz_submissions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from("quiz_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Format date to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "agora mesmo"
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} horas atrás`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} dias atrás`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua aplicação de quiz</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Leads"
          value={totalLeads || 0}
          description="Total de usuários coletados"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />

        <StatsCard
          title="Leads de Hoje"
          value={todayLeads || 0}
          description="Novos leads hoje"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        />

        <StatsCard
          title="Submissões"
          value={totalLeads || 0}
          description="Total de formulários enviados"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />

        <StatsCard
          title="Taxa de Conversão"
          value={`${totalLeads > 0 ? Math.round((totalLeads / totalLeads) * 100) : 0}%`}
          description="Leads para submissões"
          icon={<Award className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
            <CardDescription>Últimos usuários que completaram o quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Email</th>
                    <th className="p-2 text-left font-medium">WhatsApp</th>
                    <th className="p-2 text-left font-medium">Idade</th>
                    <th className="p-2 text-left font-medium">Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads?.map((lead) => (
                    <tr key={lead.id} className="border-b">
                      <td className="p-2 font-medium">{lead.email}</td>
                      <td className="p-2">{lead.whatsapp}</td>
                      <td className="p-2">{lead.age}</td>
                      <td className="p-2">{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                  {(!recentLeads || recentLeads.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        Nenhum lead encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Preferências de Suplementos</CardTitle>
            <CardDescription>Escolhas de suplementos mais populares</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">Gráfico será exibido aqui</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
