"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"

interface ConfettiProps {
  duration?: number
  particleCount?: number
  spread?: number
  colors?: string[]
}

export function Confetti({
  duration = 3000,
  particleCount = 100,
  spread = 70,
  colors = ["#6d28d9", "#a855f7", "#f3c677", "#f43f5e", "#0ea5e9"],
}: ConfettiProps) {
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const end = Date.now() + duration
    const frame = () => {
      confetti({
        particleCount: particleCount / 10,
        angle: 60,
        spread,
        origin: { x: 0, y: 0.8 },
        colors,
      })
      confetti({
        particleCount: particleCount / 10,
        angle: 120,
        spread,
        origin: { x: 1, y: 0.8 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()

    const timeout = setTimeout(() => {
      setIsActive(false)
    }, duration)

    return () => {
      clearTimeout(timeout)
    }
  }, [isActive, duration, particleCount, spread, colors])

  return null
}
