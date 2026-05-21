import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  angle: number
  velocity: number
}

interface ParticleBurstProps {
  show: boolean
  x?: number
  y?: number
  colors?: string[]
  count?: number
  onComplete?: () => void
}

const DEFAULT_COLORS = ['#43e97b', '#38f9d7', '#f093fb', '#f5576c', '#ffd700', '#00f2fe']

export function ParticleBurst({
  show,
  x = 50,
  y = 50,
  colors = DEFAULT_COLORS,
  count = 20,
  onComplete,
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!show) {
      setParticles([])
      return
    }

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x,
      y,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5,
      velocity: Math.random() * 100 + 50,
    }))

    setParticles(newParticles)

    const timer = setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, 800)

    return () => clearTimeout(timer)
  }, [show, x, y, colors, count, onComplete])

  return (
    <AnimatePresence>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size}px ${p.color}`,
          }}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.velocity,
            y: Math.sin(p.angle) * p.velocity,
            opacity: 0,
            scale: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </AnimatePresence>
  )
}
