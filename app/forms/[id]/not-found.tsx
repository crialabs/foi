import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function FormNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Formulário não encontrado</h1>
        <p className="text-gray-600 mb-6">O formulário que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link href="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    </div>
  )
}
