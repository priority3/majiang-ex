import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ScoreBoardProps {
  score: number
  combo: number
  level: number
  exp: number
  showCombo?: boolean
}

export function ScoreBoard({ score, combo, level, exp, showCombo = false }: ScoreBoardProps) {
  const [displayScore, setDisplayScore] = useState(score)
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)

  // 分数动画效果
  useEffect(() => {
    if (score !== displayScore) {
      setShowScoreAnimation(true)
      const diff = score - displayScore
      const steps = Math.min(Math.abs(diff), 20)
      const stepValue = diff / steps
      let current = displayScore
      let step = 0

      const timer = setInterval(() => {
        step++
        current += stepValue
        setDisplayScore(Math.round(current))
        if (step >= steps) {
          clearInterval(timer)
          setDisplayScore(score)
          setShowScoreAnimation(false)
        }
      }, 30)

      return () => clearInterval(timer)
    }
  }, [score])

  const expToNextLevel = level * 100
  const expProgress = (exp % expToNextLevel) / expToNextLevel * 100

  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* 等级显示 */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {level}
          </div>
          <div>
            <div className="text-sm text-gray-400">等级</div>
            <div className="progress-bar w-24 mt-1">
              <div className="progress-fill" style={{ width: `${expProgress}%` }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {exp % expToNextLevel}
              /
              {expToNextLevel}
              {' '}
              EXP
            </div>
          </div>
        </div>

        {/* 分数显示 */}
        <div className="text-center">
          <div className="text-sm text-gray-400">得分</div>
          <motion.div
            className={`score-display ${showScoreAnimation ? 'animate-pulse-glow' : ''}`}
            animate={showScoreAnimation ? { scale: [1, 1.1, 1] } : {}}
          >
            {displayScore.toLocaleString()}
          </motion.div>
        </div>

        {/* 连击显示 */}
        <div className="text-center min-w-[100px]">
          <div className="text-sm text-gray-400">连击</div>
          <AnimatePresence mode="wait">
            {combo > 0
              ? (
                  <motion.div
                    key={combo}
                    className="combo-display"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    {combo}
                    x
                  </motion.div>
                )
              : (
                  <motion.div
                    className="text-gray-600 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    -
                  </motion.div>
                )}
          </AnimatePresence>
        </div>
      </div>

      {/* 连击特效 */}
      <AnimatePresence>
        {showCombo && combo >= 3 && (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: Math.min(combo, 10) }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-yellow-400"
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                }}
                animate={{
                  x: `${20 + Math.random() * 60}%`,
                  y: `${20 + Math.random() * 60}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
