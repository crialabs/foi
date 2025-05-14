"use client"

import { useState, useEffect, useRef, useCallback } from "react" // Adicionado useCallback
import { createClientSupabaseClient } from "@/lib/supabase/client" 
import { Button } from "@/components/ui/button" 
import { Confetti } from "@/components/magicui/confetti" 
import { WhatsAppButton } from "@/components/ui/whatsapp-button" 
import { Loader2 } from "lucide-react"

interface PrizeWheelProps {
  email: string
  onPrizeSelected: (prize: string) => void
  prizes?: PrizeConfig[] 
  settings?: any 
}

interface PrizeConfig {
  id: string
  name: string
  probability: number
  active: boolean
}

export function PrizeWheel({ email, onPrizeSelected, prizes: propPrizes, settings }: PrizeWheelProps) {
  const [prizes, setPrizes] = useState<PrizeConfig[]>([])
  const [selectedPrize, setSelectedPrize] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  interface WheelInstance {
    segments: string[]
    prizesData: PrizeConfig[] // Adicionado para manter os dados completos dos prémios
    winningSegment: string | null
    centerX: number
    centerY: number
    radius: number
    angleCurrent: number
    angleDestination: number
    angleDelta: number
    animationId: number
    isWheelObjectSpinning: boolean
    draw: () => void
    spin: () => void
    calculateAngles: () => Array<PrizeConfig & { startAngle: number; endAngle: number; midAngle: number }>; // Tipo explícito
  }
  const wheelRef = useRef<WheelInstance | null>(null)

  const sliceColorPurple = "#6d28d9"; 
  const sliceColorWhite = "#FFFFFF"; 
  const textColorWhite = "#FFFFFF";
  const textColorPurpleContrast = "#2d004f"; 

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        setIsLoading(true)
        setError(null)
        let fetchedPrizes: PrizeConfig[] = [];

        if (propPrizes && propPrizes.length > 0) {
          fetchedPrizes = propPrizes;
        } else {
          const supabase = createClientSupabaseClient()
          const { data, error: dbError } = await supabase.from("prize_configs").select("*") // Pega todos, filtra depois

          if (dbError) {
            throw dbError
          }
          fetchedPrizes = data || [];
        }
        
        const activePrizes = fetchedPrizes.filter(p => p.active);

        if (!activePrizes || activePrizes.length === 0) {
          setPrizes([
            { id: "1", name: "AMOSTRA GRÁTIS", probability: 20, active: true },
            { id: "2", name: "FITA MÉTRICA", probability: 15, active: true },
            { id: "3", name: "CANETA EXCLUSIVA", probability: 20, active: true },
            { id: "4", name: "BRINDE ESPECIAL", probability: 5, active: true },
            { id: "5", name: "BLOCO DE NOTAS", probability: 15, active: true },
            { id: "6", name: "SQUEEZE PREMIUM", probability: 10, active: true },
            { id: "7", name: "VISEIRA ESTILOSA", probability: 10, active: true },
            { id: "8", name: "DESCONTO 10%", probability: 5, active: true },
          ].filter(p => p.active))
        } else {
          setPrizes(activePrizes)
        }
      } catch (err) {
        console.error("Error fetching prizes:", err)
        setError("Falha ao carregar prémios. Por favor, tente novamente.")
        setPrizes([
            { id: "1", name: "AMOSTRA GRÁTIS", probability: 20, active: true },
            { id: "2", name: "FITA MÉTRICA", probability: 15, active: true },
            { id: "3", name: "CANETA EXCLUSIVA", probability: 20, active: true },
            { id: "4", name: "BRINDE ESPECIAL", probability: 5, active: true },
            { id: "5", name: "BLOCO DE NOTAS", probability: 15, active: true },
            { id: "6", name: "SQUEEZE PREMIUM", probability: 10, active: true },
            { id: "7", name: "VISEIRA ESTILOSA", probability: 10, active: true },
            { id: "8", name: "DESCONTO 10%", probability: 5, active: true },
        ].filter(p => p.active))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrizes()
  }, [propPrizes])

  useEffect(() => {
    if (prizes.length > 0 && canvasRef.current && !isLoading) {
      initWheel()
    }
    return () => {
      if (wheelRef.current && wheelRef.current.animationId) {
        cancelAnimationFrame(wheelRef.current.animationId);
      }
    };
  }, [prizes, isLoading, settings])

  const initWheel = () => {
    if (!canvasRef.current || prizes.length === 0) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const baseSize = 300; 
    canvas.width = baseSize * dpr;
    canvas.height = baseSize * dpr;
    canvas.style.width = `${baseSize}px`;
    canvas.style.height = `${baseSize}px`;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr); 
    ctx.clearRect(0, 0, baseSize, baseSize);

    const accentColor = settings?.accent_color || "#f3c677"; 

    // A função calculateAngles é agora parte do objeto wheel e usa os prémios atuais.
    const calculateAnglesFn = () => {
        // Usa os 'prizes' do estado do componente React, que são os prémios ativos.
        if (prizes.length === 0) return [];
        
        const anglePerPrize = 360 / prizes.length; // Graus por fatia
        let currentAngle = 0; // Em graus

        return prizes.map((prize) => {
          const startAngle = currentAngle;
          currentAngle += anglePerPrize;
          const endAngle = currentAngle;
          return {
            ...prize, 
            startAngle, // Em graus
            endAngle,   // Em graus
            midAngle: startAngle + anglePerPrize / 2, // Em graus
          };
        });
      };


    const wheel: WheelInstance = {
      segments: prizes.map((prize) => prize.name), // Nomes para desenho
      prizesData: [...prizes], // Cópia dos dados dos prémios para referência interna
      winningSegment: null,
      centerX: baseSize / 2,
      centerY: baseSize / 2,
      radius: baseSize / 2 - 5, 
      angleCurrent: 0, // Ângulo atual da roleta em radianos
      angleDestination: 0,
      angleDelta: 0,
      animationId: 0,
      isWheelObjectSpinning: false,
      calculateAngles: calculateAnglesFn, // Adiciona a função ao objeto wheel

      draw() {
        ctx.clearRect(0, 0, baseSize, baseSize);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#DDDDDD"; 
        
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();

        const prizesWithAngles = this.calculateAngles(); // Usa a função interna do objeto wheel
        if (prizesWithAngles.length === 0) return; // Se não houver prémios, não desenha fatias

        // const anglePerSegment = (Math.PI * 2) / this.segments.length; // Não mais necessário aqui, já que os ângulos vêm de calculateAngles
        
        for (let i = 0; i < prizesWithAngles.length; i++) {
          const prizeData = prizesWithAngles[i];
          // Converte ângulos de graus (de calculateAngles) para radianos para o desenho do arco
          const startAngleRad = (prizeData.startAngle * Math.PI) / 180;
          const endAngleRad = (prizeData.endAngle * Math.PI) / 180;
          const midAngleRad = (prizeData.midAngle * Math.PI) / 180;


          ctx.save(); 
          ctx.beginPath();
          ctx.moveTo(this.centerX, this.centerY);
          // Usa os ângulos em radianos para desenhar o arco
          ctx.arc(this.centerX, this.centerY, this.radius, this.angleCurrent + startAngleRad, this.angleCurrent + endAngleRad, false);
          ctx.lineTo(this.centerX, this.centerY);
          ctx.closePath();

          const currentSliceColor = i % 2 === 0 ? sliceColorPurple : sliceColorWhite;
          ctx.fillStyle = currentSliceColor;
          
          ctx.fill();
          ctx.stroke(); 
          ctx.restore(); 

          ctx.save(); 
          const textRadius = this.radius * 0.65; 
          // O ângulo do texto deve considerar a rotação atual da roleta (this.angleCurrent)
          // e o ângulo médio da fatia (midAngleRad)
          const actualTextAngle = this.angleCurrent + midAngleRad;
          
          ctx.translate(
            this.centerX + textRadius * Math.cos(actualTextAngle),
            this.centerY + textRadius * Math.sin(actualTextAngle)
          );
          ctx.rotate(actualTextAngle + Math.PI / 2); 
          
          ctx.fillStyle = currentSliceColor === sliceColorPurple ? textColorWhite : textColorPurpleContrast;
          
          const FONT_SIZE = 9;
          ctx.font = `bold ${FONT_SIZE}px Arial`; 
          ctx.textAlign = "center";
          ctx.textBaseline = "middle"; 
          
          const prizeName = prizeData.name; // Usa o nome do prizeData
          const MAX_LINE_WIDTH = ( (prizeData.endAngle - prizeData.startAngle) * Math.PI / 180 ) * textRadius * 0.7; // Ajuste na largura máxima
          const LINE_SPACING = 3; 

          let line1 = prizeName;
          let line2 = "";

          if (ctx.measureText(prizeName).width > MAX_LINE_WIDTH && prizeName.includes(" ")) {
              const words = prizeName.split(" ");
              let testLine1 = "";
              for (let k = 0; k < words.length; k++) {
                  const word = words[k];
                  const potentialLine1 = testLine1 ? testLine1 + " " + word : word;
                  if (ctx.measureText(potentialLine1).width <= MAX_LINE_WIDTH) {
                      testLine1 = potentialLine1;
                  } else {
                      if (k > 0) { 
                        line2 = words.slice(k).join(" ");
                      } else { 
                        line2 = words.slice(1).join(" "); 
                      }
                      break; 
                  }
              }
              if (testLine1) line1 = testLine1;
              if (!line2 && testLine1 !== prizeName) {
                  const indexPrimeiraPalavraLine1 = prizeName.indexOf(line1) + line1.length;
                  const resto = prizeName.substring(indexPrimeiraPalavraLine1).trim();
                  if(resto) line2 = resto;
              }
          }

          if (line2) {
            const yOffset = (FONT_SIZE + LINE_SPACING) / 2;
            ctx.fillText(line1, 0, -yOffset + (FONT_SIZE / 2) ); 
            ctx.fillText(line2, 0, yOffset - (FONT_SIZE / 2) + FONT_SIZE); 
          } else {
            ctx.fillText(line1, 0, 0); 
          }
          ctx.restore(); 
        }

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.radius * 0.12, 0, Math.PI * 2, false); 
        ctx.fillStyle = accentColor;
        ctx.fill();
        ctx.strokeStyle = "#AAAAAA";
        ctx.stroke();

        const pointerSize = this.radius * 0.08; 
        ctx.beginPath();
        const pointerBaseY = this.centerY - this.radius * 0.12 - 2; 
        ctx.moveTo(this.centerX, pointerBaseY - pointerSize * 1.5); 
        ctx.lineTo(this.centerX - pointerSize / 1.5, pointerBaseY); 
        ctx.lineTo(this.centerX + pointerSize / 1.5, pointerBaseY); 
        ctx.closePath();
        ctx.fillStyle = "#f00"; 
        ctx.fill();
      },

      spin() {
        if (this.isWheelObjectSpinning) return;
        this.isWheelObjectSpinning = true;
        setIsSpinning(true); 
        setShowConfetti(false); 

        // Determina o prémio vencedor com base nas probabilidades originais
        const totalProbability = this.prizesData.reduce((sum, prize) => sum + prize.probability, 0);
        if (totalProbability === 0) { 
            this.isWheelObjectSpinning = false;
            setIsSpinning(false);
            setError("Probabilidades dos prémios não configuradas corretamente.");
            return;
        }
        const random = Math.random() * totalProbability;
        let cumulativeProbability = 0;
        let winningPrizeData: PrizeConfig | null = null;
        let winningIndex = -1; // Índice do prémio vencedor na lista this.prizesData

        for (let i = 0; i < this.prizesData.length; i++) {
          cumulativeProbability += this.prizesData[i].probability;
          if (random < cumulativeProbability) {
            winningPrizeData = this.prizesData[i];
            winningIndex = i; // Guarda o índice do prémio vencedor
            break;
          }
        }
        
        if (!winningPrizeData) { // Fallback caso algo dê errado
            this.isWheelObjectSpinning = false;
            setIsSpinning(false);
            setError("Erro ao selecionar prémio.");
            return;
        }
        this.winningSegment = winningPrizeData.name;


        // Calcula o ângulo para parar na fatia visual correspondente ao winningIndex
        // Usa os ângulos calculados por calculateAngles (que são de fatias iguais)
        const prizesWithVisualAngles = this.calculateAngles();
        if (winningIndex < 0 || winningIndex >= prizesWithVisualAngles.length) {
             this.isWheelObjectSpinning = false;
             setIsSpinning(false);
             setError("Erro de índice do prémio.");
             return;
        }
        const visualWinningSlice = prizesWithVisualAngles[winningIndex];

        const arrowAngleRad = 3 * Math.PI / 2; // Seta no topo (270 graus)
        // Ângulo médio da fatia visual vencedora (já em radianos se calculateAngles usasse radianos, ou converter)
        const middleOfWinningSliceRad = (visualWinningSlice.midAngle * Math.PI) / 180; // Converte para radianos
        
        let targetRotationRad = arrowAngleRad - middleOfWinningSliceRad;

        this.angleDestination = this.angleCurrent + (Math.PI * 2 * (5 + Math.random()*2)) + targetRotationRad; 
        this.angleDelta = this.angleDestination - this.angleCurrent;
        const animationStartTime = performance.now();
        const animationDuration = 5000; 

        const animate = (currentTime: number) => {
          const elapsedTime = currentTime - animationStartTime;
          let spinProgress = elapsedTime / animationDuration;
          if (spinProgress >= 1) spinProgress = 1;
          
          const easedProgress = 1 - Math.pow(1 - spinProgress, 4);
          this.angleCurrent = (this.angleDestination - this.angleDelta) + (this.angleDelta * easedProgress);
          this.draw();

          if (spinProgress < 1) {
            this.animationId = requestAnimationFrame(animate);
          } else {
            this.angleCurrent = this.angleDestination; 
            this.draw(); 
            this.isWheelObjectSpinning = false;
            setIsSpinning(false); 
            if (this.winningSegment) { // winningSegment é o nome do prémio
              setSelectedPrize(this.winningSegment); 
              setShowConfetti(true);
              onPrizeSelected(this.winningSegment); 
            }
          }
        };
        this.animationId = requestAnimationFrame(animate);
      },
    };

    wheel.draw();
    wheelRef.current = wheel;
  };

  const handleSpin = () => {
    if (wheelRef.current && !isSpinning) { 
      wheelRef.current.spin();
    }
  };

  if (isLoading) { return ( <div className="flex h-64 flex-col items-center justify-center"> <Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="mt-2 text-sm text-muted-foreground">A carregar a roleta de prémios...</p> </div> ); }
  if (error) { return ( <div className="flex h-64 flex-col items-center justify-center"> <p className="text-red-500">{error}</p> <Button className="mt-4" onClick={() => window.location.reload()}> Tentar Novamente </Button> </div> ); }

  return ( 
    <div className="flex flex-col items-center">
      {showConfetti && <Confetti />}
      <h2 className="mb-4 text-xl font-bold text-gray-700">
        {selectedPrize ? "Parabéns!" : "Gire a Roleta!"}
      </h2>
      <div className="relative mb-4">
        <canvas ref={canvasRef} className="rounded-full border border-gray-200 shadow-lg" />
      </div>
      {selectedPrize ? (
        <div className="mt-4 text-center">
          <p className="mb-2 text-lg font-semibold text-gray-800">
            Você ganhou: <span style={{color: settings?.primary_color || sliceColorPurple }}>{selectedPrize}</span>
          </p>
          <p className="mb-4 text-sm text-gray-500">
            Entraremos em contacto via WhatsApp com detalhes sobre como resgatar o seu prémio.
          </p>
          <WhatsAppButton
            phoneNumber="5511999999999" 
            message={`Olá! Acabei de ganhar ${selectedPrize} na roleta de prémios. O meu email é ${email}. Como posso resgatar o meu prémio?`}
            buttonText="Falar via WhatsApp"
          />
        </div>
      ) : (
        <Button
          onClick={handleSpin}
          disabled={isSpinning || prizes.length === 0}
          className="mt-4 px-8 py-3 text-lg" 
          size="lg" 
          style={{
            backgroundColor: isSpinning || prizes.length === 0 ? undefined : (settings?.primary_color || sliceColorPurple), 
            borderColor: isSpinning || prizes.length === 0 ? undefined : (settings?.primary_color || sliceColorPurple),
          }}
        >
          {isSpinning ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A girar... </> ) : ( "Girar!" )}
        </Button>
      )}
    </div>
  );
}
