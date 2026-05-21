import { useMemo } from 'react'

interface ParticleBackgroundProps {
  count?: number
}

export function ParticleBackground({ count = 30 }: ParticleBackgroundProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${8 + Math.random() * 12}s`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${2 + Math.random() * 4}px`,
      color: ['#00f2fe', '#4facfe', '#f093fb', '#43e97b'][Math.floor(Math.random() * 4)],
    }))
  }, [count])

  return (
    <div className="particles">
      {particles.map(p => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </div>
  )
}
