import type { Tile, TileType } from '../types'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { VALID_TYPES } from '../types'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'
import { TimerDisplay } from './TimerDisplay'

interface SpeedModeProps {
  onComplete: (score: number, time: number) => void
}

function generateQuickHand(): { hand: Tile[], tingCount: number } {
  const types: TileType[] = VALID_TYPES
  const hand: Tile[] = []

  for (let i = 0; i < 13; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const value = Math.floor(Math.random() * 9) + 1
    hand.push({ type, value })
  }

  return { hand, tingCount: Math.floor(Math.random() * 5) + 1 }
}

export function SpeedMode({ onComplete }: SpeedModeProps) {
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [gameState, setGameState] = useState(() => generateQuickHand())
  const [options, setOptions] = useState<number[]>([])

  // 生成选项
  useEffect(() => {
    const correct = gameState.tingCount
    const optionSet = new Set([correct])
    while (optionSet.size < 4) {
      optionSet.add(Math.floor(Math.random() * 8) + 1)
    }
    setOptions(Array.from(optionSet).sort(() => Math.random() - 0.5))
  }, [gameState])

  // 倒计时
  useEffect(() => {
    if (!isRunning)
      return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRunning(false)
          onComplete(score, 30 - prev)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, score, onComplete])

  const handleAnswer = (answer: number) => {
    if (!isRunning)
      return

    if (answer === gameState.tingCount) {
      // 正确
      const timeBonus = Math.floor(timeLeft / 3)
      const streakBonus = streak * 10
      setScore(prev => prev + 100 + timeBonus + streakBonus)
      setStreak(prev => prev + 1)
    }
    else {
      // 错误
      setStreak(0)
    }

    // 进入下一题
    setGameState(generateQuickHand())
  }

  return (
    <div className="glass-card p-6">
      {/* 顶部信息 */}
      <div className="flex justify-between items-center mb-6">
        <TimerDisplay time={timeLeft} maxTime={30} isRunning={isRunning} isWarning={timeLeft <= 10} />
        <div className="text-right">
          <div className="text-gray-400 text-sm">得分</div>
          <motion.div
            className="text-3xl font-bold text-white"
            animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
            key={score}
          >
            {score}
          </motion.div>
          {streak > 0 && (
            <motion.div
              className="text-sm text-yellow-400"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {streak}
              {' '}
              连击 🔥
            </motion.div>
          )}
        </div>
      </div>

      {/* 手牌显示 */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-1 p-3 bg-black/20 rounded-xl">
          {gameState.hand.map((tile, index) => (
            <AnimatedMajiangTile
              key={`speed-${tile.type}${tile.value}-${index}`}
              tile={tile}
              index={index}
              keyPrefix="speed-"
              small
            />
          ))}
        </div>
      </div>

      {/* 问题 */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={gameState.tingCount}
      >
        <div className="text-xl text-white font-bold mb-2">
          这手牌可以胡几张牌？
        </div>
        <div className="text-sm text-gray-400">
          快速选择正确的数量
        </div>
      </motion.div>

      {/* 选项按钮 */}
      <div className="grid grid-cols-4 gap-3">
        {options.map(option => (
          <motion.button
            key={option}
            className="p-4 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-bold hover:bg-white/10 hover:border-blue-500/50 transition-all"
            onClick={() => handleAnswer(option)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
