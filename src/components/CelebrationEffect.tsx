import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CelebrationEffectProps {
  show: boolean
  type?: 'win' | 'combo' | 'levelup'
  onComplete?: () => void
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  velocityX: number
  velocityY: number
}

const CELEBRATION_COLORS = [
  '#FFD700', // 金色
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#96CEB4', // 绿色
  '#FFEAA7', // 浅黄
  '#DDA0DD', // 紫色
  '#FF69B4', // 粉色
]

const EMOJIS = ['🎉', '🎊', '✨', '🌟', '💫', '🎆', '🎇', '🏆']

export function CelebrationEffect({ show, type = 'win', onComplete }: CelebrationEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [showEmojis, setShowEmojis] = useState(false)

  useEffect(() => {
    if (show) {
      // 生成粒子
      const newParticles: Particle[] = []
      const count = type === 'combo' ? 50 : type === 'levelup' ? 80 : 30

      for (let i = 0; i < count; i++) {
        newParticles.push({
          id: i,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 50,
          color: CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)],
          size: 4 + Math.random() * 8,
          rotation: Math.random() * 360,
          velocityX: (Math.random() - 0.5) * 30,
          velocityY: -10 - Math.random() * 20,
        })
      }

      setParticles(newParticles)
      setShowEmojis(true)

      // 清理
      const timer = setTimeout(() => {
        setParticles([])
        setShowEmojis(false)
        onComplete?.()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [show, type, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {/* 粒子效果 */}
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size}px ${particle.color}`,
              }}
              initial={{
                opacity: 1,
                scale: 0,
                x: 0,
                y: 0,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1, 0.5],
                x: particle.velocityX * 10,
                y: particle.velocityY * 10,
                rotate: particle.rotation,
              }}
              transition={{
                duration: 1.5,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Emoji 飘落 */}
          {showEmojis && (
            <>
              {EMOJIS.map((emoji, index) => (
                <motion.div
                  key={`emoji-${index}`}
                  className="absolute text-4xl"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: '-10%',
                  }}
                  initial={{ opacity: 1, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [1, 1, 0],
                    y: '120vh',
                    rotate: (Math.random() - 0.5) * 720,
                    x: (Math.random() - 0.5) * 100,
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: index * 0.1,
                    ease: 'easeIn',
                  }}
                >
                  {emoji}
                </motion.div>
              ))}
            </>
          )}

          {/* 中央文字效果 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
            transition={{ duration: 1.5 }}
          >
            <div className={`text-6xl font-bold ${
              type === 'levelup'
                ? 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500'
                : type === 'combo'
                  ? 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500'
                  : 'bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500'
            } bg-clip-text text-transparent`}
            >
              {type === 'levelup'
                ? '🎉 升级！'
                : type === 'combo'
                  ? `🔥 ${EMOJIS[Math.floor(Math.random() * EMOJIS.length)]} 连击！`
                  : '✨ 正确！'}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
