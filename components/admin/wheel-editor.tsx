"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Save, RefreshCw, Upload, Download } from "lucide-react"
import WheelCanvas from "@/components/wheel-canvas"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Esquema de validação Zod para as configurações da roleta
const wheelConfigSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  outerBorderColor: z.string().min(1, "Cor da borda externa é obrigatória"),
  outerBorderWidth: z.number().min(0).max(20),
  innerRadius: z.number().min(0).max(100),
  innerBorderColor: z.string().min(1, "Cor da borda interna é obrigatória"),
  innerBorderWidth: z.number().min(0).max(20),
  radiusLineColor: z.string().min(1, "Cor das linhas de raio é obrigatória"),
  radiusLineWidth: z.number().min(0).max(10),
  fontFamily: z.string().min(1, "Família de fonte é obrigatória"),
  fontWeight: z.union([z.number(), z.string()]),
  fontSize: z.number().min(8).max(36),
  fontStyle: z.string(),
  perpendicularText: z.boolean(),
  textDistance: z.number().min(0).max(100),
})

type WheelConfigFormValues = z.infer<typeof wheelConfigSchema>

// Dados de exemplo para a roleta
const defaultPrizes = [
  { id: 1, name: "AMOSTRA", probability: 20, active: true, backgroundColor: "#FF6B6B", textColor: "#FFFFFF" },
  { id: 2, name: "FITA MÉTRICA", probability: 15, active: true, backgroundColor: "#4ECDC4", textColor: "#FFFFFF" },
  { id: 3, name: "CANETA", probability: 20, active: true, backgroundColor: "#45B7D1", textColor: "#FFFFFF" },
  { id: 4, name: "BRINDE ESPECIAL", probability: 5, active: true, backgroundColor: "#FFA5A5", textColor: "#FFFFFF" },
  { id: 5, name: "BLOCO", probability: 15, active: true, backgroundColor: "#A5FFD6", textColor: "#FFFFFF" },
  { id: 6, name: "SQUEEZE", probability: 10, active: true, backgroundColor: "#FFC145", textColor: "#FFFFFF" },
  { id: 7, name: "VISEIRA", probability: 10, active: true, backgroundColor: "#FF6B8B", textColor: "#FFFFFF" },
  { id: 8, name: "DESCONTO 10%", probability: 5, active: true, backgroundColor: "#845EC2", textColor: "#FFFFFF" },
]

export function WheelEditor() {
  const { toast } = useToast()
  const [prizes, setPrizes] = useState(defaultPrizes)
  const [activeTab, setActiveTab] = useState("appearance")
  const [rouletteUpdater, setRouletteUpdater] = useState(false)
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Configuração do formulário com Zod
  const form = useForm<WheelConfigFormValues>({
    resolver: zodResolver(wheelConfigSchema),
    defaultValues: {
      name: "Roleta de Prêmios ATENA",
      outerBorderColor: "#6d28d9",
      outerBorderWidth: 3,
      innerRadius: 40,
      innerBorderColor: "#a855f7",
      innerBorderWidth: 2,
      radiusLineColor: "#ffffff",
      radiusLineWidth: 1,
      fontFamily: "Geist",
      fontWeight: "bold",
      fontSize: 14,
      fontStyle: "normal",
      perpendicularText: true,
      textDistance: 75,
    },
  })

  // Preparar dados para o componente WheelCanvas
  const wheelData = prizes
    .filter((prize) => prize.active)
    .map((prize) => ({
      option: prize.name,
      optionSize: prize.probability,
      style: {
        backgroundColor: prize.backgroundColor,
        textColor: prize.textColor,
        fontFamily: form.watch("fontFamily"),
        fontSize: form.watch("fontSize"),
        fontStyle: form.watch("fontStyle"),
        fontWeight: form.watch("fontWeight"),
      },
    }))

  // Calcular o mapa de prêmios para o WheelCanvas
  const prizeMap = prizes.filter((prize) => prize.active).map((prize, index) => [index, prize.probability])

  // Atualizar a visualização da roleta quando as configurações mudarem
  useEffect(() => {
    setRouletteUpdater((prev) => !prev)
  }, [form.watch(), prizes])

  // Adicionar um novo prêmio
  const addPrize = () => {
    const newId = Math.max(...prizes.map((p) => p.id)) + 1
    const newPrize = {
      id: newId,
      name: `Prêmio ${newId}`,
      probability: 10,
      active: true,
      backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      textColor: "#FFFFFF",
    }
    setPrizes([...prizes, newPrize])
  }

  // Remover um prêmio
  const removePrize = (id: number) => {
    if (prizes.length <= 1) {
      toast({
        title: "Erro",
        description: "A roleta deve ter pelo menos um prêmio",
        variant: "destructive",
      })
      return
    }
    setPrizes(prizes.filter((prize) => prize.id !== id))
    if (selectedPrizeIndex !== null && prizes[selectedPrizeIndex].id === id) {
      setSelectedPrizeIndex(null)
    }
  }

  // Atualizar um prêmio
  const updatePrize = (id: number, data: Partial<(typeof prizes)[0]>) => {
    setPrizes(prizes.map((prize) => (prize.id === id ? { ...prize, ...data } : prize)))
  }

  // Salvar configurações da roleta
  const onSubmit = (data: WheelConfigFormValues) => {
    setIsLoading(true)

    // Simulação de salvamento
    setTimeout(() => {
      toast({
        title: "Configurações salvas",
        description: "As configurações da roleta foram salvas com sucesso",
      })
      setIsLoading(false)
    }, 1000)

    console.log("Configurações da roleta:", data)
    console.log("Prêmios:", prizes)
  }

  // Exportar configurações
  const exportConfig = () => {
    const config = {
      ...form.getValues(),
      prizes,
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "wheel-config.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Configuração exportada",
      description: "O arquivo de configuração foi baixado com sucesso",
    })
  }

  // Importar configurações
  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string)

        // Atualizar formulário
        form.reset(config)

        // Atualizar prêmios
        if (config.prizes && Array.isArray(config.prizes)) {
          setPrizes(config.prizes)
        }

        toast({
          title: "Configuração importada",
          description: "As configurações foram importadas com sucesso",
        })
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: "O arquivo não contém uma configuração válida",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Limpar input para permitir selecionar o mesmo arquivo novamente
    event.target.value = ""
  }

  // Verificar se o total de probabilidades é 100%
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)
  const isValidProbability = totalProbability === 100

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editor de Roleta</h1>
          <p className="text-muted-foreground">Personalize a aparência e os prêmios da roleta</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => document.getElementById("import-config")?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <input id="import-config" type="file" accept=".json" className="hidden" onChange={importConfig} />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Button type="submit" disabled={isLoading || !isValidProbability}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {!isValidProbability && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          <p className="text-sm font-medium">
            Atenção: O total de probabilidades deve ser 100%. Atual: {totalProbability}%
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualização da roleta */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Visualização</CardTitle>
            <CardDescription>Prévia da roleta com as configurações atuais</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="relative">
              <WheelCanvas
                width="300"
                height="300"
                data={wheelData}
                outerBorderColor={form.watch("outerBorderColor")}
                outerBorderWidth={form.watch("outerBorderWidth")}
                innerRadius={form.watch("innerRadius")}
                innerBorderColor={form.watch("innerBorderColor")}
                innerBorderWidth={form.watch("innerBorderWidth")}
                radiusLineColor={form.watch("radiusLineColor")}
                radiusLineWidth={form.watch("radiusLineWidth")}
                fontFamily={form.watch("fontFamily")}
                fontWeight={form.watch("fontWeight")}
                fontSize={form.watch("fontSize")}
                fontStyle={form.watch("fontStyle")}
                perpendicularText={form.watch("perpendicularText")}
                prizeMap={prizeMap}
                rouletteUpdater={rouletteUpdater}
                textDistance={form.watch("textDistance")}
              />
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2" style={{ marginLeft: "-20px" }}>
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-r-[20px] border-r-red-600 border-b-[10px] border-b-transparent" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => setRouletteUpdater(!rouletteUpdater)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Visualização
            </Button>
          </CardFooter>
        </Card>

        {/* Configurações da roleta */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Personalize a aparência e comportamento da roleta</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="appearance">Aparência</TabsTrigger>
                <TabsTrigger value="prizes">Prêmios</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance" className="space-y-6 pt-4">
                <Form {...form}>
                  <form className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Roleta</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="outerBorderColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor da Borda Externa</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: field.value }} />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="outerBorderWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Largura da Borda Externa: {field.value}px</FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={20}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="innerBorderColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor da Borda Interna</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: field.value }} />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="innerBorderWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Largura da Borda Interna: {field.value}px</FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={20}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="innerRadius"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raio Interno: {field.value}%</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="radiusLineColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor das Linhas de Raio</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: field.value }} />
                                <Input {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="radiusLineWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Largura das Linhas de Raio: {field.value}px</FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={10}
                                step={0.5}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fontFamily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Família de Fonte</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma fonte" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Geist">Geist</SelectItem>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                <SelectItem value="Verdana">Verdana</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Courier New">Courier New</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho da Fonte: {field.value}px</FormLabel>
                            <FormControl>
                              <Slider
                                min={8}
                                max={36}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fontWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso da Fonte</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um peso" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Negrito</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                                <SelectItem value="200">200</SelectItem>
                                <SelectItem value="300">300</SelectItem>
                                <SelectItem value="400">400</SelectItem>
                                <SelectItem value="500">500</SelectItem>
                                <SelectItem value="600">600</SelectItem>
                                <SelectItem value="700">700</SelectItem>
                                <SelectItem value="800">800</SelectItem>
                                <SelectItem value="900">900</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fontStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estilo da Fonte</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um estilo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="italic">Itálico</SelectItem>
                                <SelectItem value="oblique">Oblíquo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="textDistance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Distância do Texto: {field.value}%</FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                              />
                            </FormControl>
                            <FormDescription>Distância do texto em relação ao centro da roleta</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="perpendicularText"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Texto Perpendicular</FormLabel>
                              <FormDescription>Texto alinhado perpendicularmente ao raio</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="prizes" className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Lista de Prêmios</h3>
                  <Button onClick={addPrize}>Adicionar Prêmio</Button>
                </div>

                <div className="space-y-4">
                  {prizes.map((prize, index) => (
                    <Card key={prize.id} className={selectedPrizeIndex === index ? "border-primary" : ""}>
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">{prize.name}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedPrizeIndex(selectedPrizeIndex === index ? null : index)}
                            >
                              {selectedPrizeIndex === index ? "Fechar" : "Editar"}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => removePrize(prize.id)}>
                              Remover
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {selectedPrizeIndex === index && (
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`prize-${prize.id}-name`}>Nome do Prêmio</Label>
                                <Input
                                  id={`prize-${prize.id}-name`}
                                  value={prize.name}
                                  onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`prize-${prize.id}-probability`}>
                                  Probabilidade: {prize.probability}%
                                </Label>
                                <Slider
                                  id={`prize-${prize.id}-probability`}
                                  min={1}
                                  max={100}
                                  step={1}
                                  value={[prize.probability]}
                                  onValueChange={(value) => updatePrize(prize.id, { probability: value[0] })}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`prize-${prize.id}-bg-color`}>Cor de Fundo</Label>
                                <div className="flex gap-2">
                                  <div
                                    className="w-10 h-10 rounded-md border"
                                    style={{ backgroundColor: prize.backgroundColor }}
                                  />
                                  <Input
                                    id={`prize-${prize.id}-bg-color`}
                                    value={prize.backgroundColor}
                                    onChange={(e) => updatePrize(prize.id, { backgroundColor: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`prize-${prize.id}-text-color`}>Cor do Texto</Label>
                                <div className="flex gap-2">
                                  <div
                                    className="w-10 h-10 rounded-md border"
                                    style={{ backgroundColor: prize.textColor }}
                                  />
                                  <Input
                                    id={`prize-${prize.id}-text-color`}
                                    value={prize.textColor}
                                    onChange={(e) => updatePrize(prize.id, { textColor: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`prize-${prize.id}-active`}
                                checked={prize.active}
                                onCheckedChange={(checked) => updatePrize(prize.id, { active: checked })}
                              />
                              <Label htmlFor={`prize-${prize.id}-active`}>Ativo</Label>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
