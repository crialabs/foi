"use client"

import { useEffect, useState } from "react"

interface ModalProps {
  visible: boolean
  prize: string
  onClose: () => void
}

export const Modal = ({ visible, prize, onClose }: ModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (visible) {
      // Start confetti immediately when modal opens
      setShowConfetti(true)

      // Stop confetti after 8 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 8000)

      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-80 flex flex-col items-center shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
        <p className="text-lg mb-4">Você ganhou</p>
        <p className="text-lg font-bold mb-6 text-center">{prize}</p>
        <button onClick={onClose} className="bg-[#FFCA00] px-6 py-2 rounded-full font-bold">
          Fechar
        </button>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">{/* Confetti effect would be rendered here */}</div>
      )}
    </div>
  )
}
