import type { Tile } from '../types'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { VALID_TYPES } from '../types'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'
import { TimerDisplay } from './TimerDisplay'

interface SpeedModeProps {
  onComplete: (score: number, time: number) => void
}

// 计算手牌能胡几张牌（简化版本）
function calculateTingCount(hand: Tile[]): number {
  // 简化逻辑：计算手牌中不同花色的数量
  const types = new Set(hand.map(t => t.type))
  if (types.size > 2)
    return 0 // 超过2种花色，不能听牌

  // 统计每种花色的数量
  const typeCounts: Record<string, number> = {}
  for (const tile of hand) {
    typeCounts[tile.type] = (typeCounts[tile.type] || 0) + 1
  }

  // 简化计算：基于手牌结构估算
  const values = hand.map(t => t.value).sort((a, b) => a - b)
  const uniqueValues = new Set(values)

  // 如果有很多对子，听牌数可能较多
  const pairs = hand.length - uniqueValues.size
  return Math.min(8, Math.max(1, pairs + Math.floor(Math.random() * 3)))
}

function generateQuickHand(): { hand: Tile[], tingCount: number } {
  const hand: Tile[] = []

  // 生成13张牌，确保只有1-2种花色
  const mainType = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
  const secondType = Math.random() > 0.5
    ? VALID_TYPES.filter(t => t !== mainType)[Math.floor(Math.random() * 2)]
    : mainType

  for (let i = 0; i < 13; i++) {
    const type = Math.random() > 0.3 ? mainType : secondType
    const value = Math.floor(Math.random() * 9) + 1
    hand.push({ type, value })
  }

  const tingCount = calculateTingCount(hand)
  return { hand, tingCount }
}

export function SpeedMode({ onComplete }: SpeedModeProps) {
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [gameState, setGameState] = useState(() => generateQuickHand())
  const [options, setOptions] = useState<number[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)

  // 生成选项
  useEffect(() => {
    const correct = gameState.tingCount
    const optionSet = new Set([correct])
    while (optionSet.size < 4) {
      const random = Math.floor(Math.random() * 8) + 1
      optionSet.add(random)
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
          onComplete(score, 30)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, score, onComplete])

  const handleAnswer = (answer: number) => {
    if (!isRunning || showFeedback)
      return

    const isCorrect = answer === gameState.tingCount
    setLastCorrect(isCorrect)
    setShowFeedback(true)

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3)
      const streakBonus = streak * 15
      setScore(prev => prev + 100 + timeBonus + streakBonus)
      setStreak(prev => prev + 1)
    }
    else {
      setStreak(0)
      setScore(prev => Math.max(0, prev - 20))
    }

    // 0.5秒后进入下一题
    setTimeout(() => {
      setShowFeedback(false)
      setLastCorrect(null)
      setGameState(generateQuickHand())
    }, 800)
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
      >
        <div className="text-xl text-white font-bold mb-2">
          这手牌可以胡几张牌？
        </div>
        <div className="text-sm text-gray-400">
          快速选择正确的数量
        </div>
      </motion.div>

      {/* 反馈效果 */}
      {showFeedback && lastCorrect !== null && (
        <motion.div
          className={`text-center py-2 mb-4 rounded-xl ${
            lastCorrect
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          {lastCorrect ? '✓ 正确！' : `✗ 答案是 ${gameState.tingCount}`}
        </motion.div>
      )}

      {/* 选项按钮 */}
      <div className="grid grid-cols-4 gap-3">
        {options.map(option => (
          <motion.button
            key={option}
            className={`p-4 rounded-xl text-white text-xl font-bold transition-all ${
              showFeedback && option === gameState.tingCount
                ? 'bg-green-500/30 border-2 border-green-500'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50'
            }`}
            onClick={() => handleAnswer(option)}
            whileHover={!showFeedback ? { scale: 1.05 } : {}}
            whileTap={!showFeedback ? { scale: 0.95 } : {}}
            disabled={showFeedback}
          >
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
