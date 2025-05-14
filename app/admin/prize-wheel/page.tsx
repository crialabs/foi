"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Save, Trash, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface PrizeConfig {
  id: string
  name: string
  probability: number
  active: boolean
}

export default function PrizeWheelPage() {
  const [prizes, setPrizes] = useState<PrizeConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newPrize, setNewPrize] = useState({
    name: "",
    probability: 10,
    active: true,
  })
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Calculate total probability
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)
  const totalActiveProbability = prizes
    .filter((prize) => prize.active)
    .reduce((sum, prize) => sum + prize.probability, 0)

  useEffect(() => {
    fetchPrizes()
  }, [])

  const fetchPrizes = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("prize_configs").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPrizes(data || [])
    } catch (error) {
      console.error("Falha ao buscar prêmios:", error)
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações de prêmios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPrize = async () => {
    if (!newPrize.name) {
      toast({
        title: "Erro",
        description: "Nome do prêmio é obrigatório",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("prize_configs")
        .insert({
          name: newPrize.name,
          probability: newPrize.probability,
          active: newPrize.active,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Prêmio adicionado com sucesso",
      })
      setNewPrize({
        name: "",
        probability: 10,
        active: true,
      })
      fetchPrizes()
    } catch (error) {
      console.error("Falha ao adicionar prêmio:", error)
      toast({
        title: "Erro",
        description: "Falha ao adicionar prêmio",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePrize = async (id: string, updatedData: Partial<PrizeConfig>) => {
    try {
      const prize = prizes.find((p) => p.id === id)
      if (!prize) return

      const { error } = await supabase
        .from("prize_configs")
        .update({
          ...prize,
          ...updatedData,
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Prêmio atualizado com sucesso",
      })
      fetchPrizes()
    } catch (error) {
      console.error("Falha ao atualizar prêmio:", error)
      toast({
        title: "Erro",
        description: "Falha ao atualizar prêmio",
        variant: "destructive",
      })
    }
  }

  const handleDeletePrize = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este prêmio?")) return

    try {
      const { error } = await supabase.from("prize_configs").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Prêmio excluído com sucesso",
      })
      fetchPrizes()
    } catch (error) {
      console.error("Falha ao excluir prêmio:", error)
      toast({
        title: "Erro",
        description: "Falha ao excluir prêmio",
        variant: "destructive",
      })
    }
  }

  const handleProbabilityChange = (id: string, value: string) => {
    const numValue = Number.parseInt(value, 10) || 0
    const updatedPrizes = prizes.map((prize) => (prize.id === id ? { ...prize, probability: numValue } : prize))
    setPrizes(updatedPrizes)
  }

  const handleToggleActive = (id: string, active: boolean) => {
    handleUpdatePrize(id, { active })
  }

  // Function to generate a random color based on ID
  const getRandomColor = (id: string) => {
    const colors = [
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
    ]
    // Use a hash function to convert the UUID to a number
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuração da Roleta de Prêmios</h1>
        <p className="text-muted-foreground">Gerencie os prêmios e suas probabilidades para a roleta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Novo Prêmio</CardTitle>
            <CardDescription>Crie um novo prêmio para a roleta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Prêmio</Label>
                <Input
                  id="name"
                  value={newPrize.name}
                  onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                  placeholder="Digite o nome do prêmio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="probability">Probabilidade (%)</Label>
                <Input
                  id="probability"
                  type="number"
                  min="1"
                  max="100"
                  value={newPrize.probability}
                  onChange={(e) => setNewPrize({ ...newPrize, probability: Number.parseInt(e.target.value, 10) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newPrize.active}
                  onCheckedChange={(checked) => setNewPrize({ ...newPrize, active: checked })}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>

              <Button onClick={handleAddPrize} disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Prêmio
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Probabilidade</CardTitle>
            <CardDescription>
              Probabilidade total: {totalProbability}% (Ativos: {totalActiveProbability}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalProbability !== 100 && (
              <div className="mb-4 rounded-md bg-yellow-50 p-3 text-yellow-800">
                <p className="text-sm">
                  <strong>Aviso:</strong> A probabilidade total deve ser 100%. Total atual: {totalProbability}%
                </p>
              </div>
            )}

            <div className="h-64 overflow-hidden rounded-md border">
              {prizes.length > 0 && totalActiveProbability > 0 ? (
                <div className="flex h-full flex-col">
                  {prizes
                    .filter((prize) => prize.active)
                    .map((prize) => (
                      <div
                        key={prize.id}
                        className="flex items-center justify-between border-b px-3 py-2"
                        style={{
                          height: `${(prize.probability / totalActiveProbability) * 100}%`,
                          backgroundColor: getRandomColor(prize.id),
                        }}
                      >
                        <span className="font-medium text-white">{prize.name}</span>
                        <span className="text-sm text-white">{prize.probability}%</span>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">Nenhum prêmio ativo configurado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Prêmios</CardTitle>
          <CardDescription>Edite ou exclua prêmios existentes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : prizes.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Probabilidade (%)</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prizes.map((prize) => (
                    <TableRow key={prize.id}>
                      <TableCell>{prize.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={prize.probability}
                            onChange={(e) => handleProbabilityChange(prize.id, e.target.value)}
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdatePrize(prize.id, { probability: prize.probability })}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={prize.active}
                          onCheckedChange={(checked) => handleToggleActive(prize.id, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePrize(prize.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum prêmio configurado ainda. Adicione seu primeiro prêmio acima.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
