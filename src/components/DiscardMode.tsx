import type { Tile, TileType } from '../types'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { VALID_TYPES } from '../types'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'

interface DiscardModeProps {
  onComplete: (score: number, time: number) => void
}

// 评估一张牌的"价值"（简化逻辑：孤张价值低，对子/刻子价值高）
function evaluateTileValue(tile: Tile, hand: Tile[]): number {
  const sameValueCount = hand.filter(t => t.value === tile.value && t.type === tile.type).length

  // 刻子或对子中的牌价值更高
  if (sameValueCount >= 3) return 100 // 刻子
  if (sameValueCount >= 2) return 80 // 对子

  // 检查是否能组成顺子
  const hasPrev = hand.some(t => t.type === tile.type && t.value === tile.value - 1)
  const hasNext = hand.some(t => t.type === tile.type && t.value === tile.value + 1)

  if (hasPrev && hasNext) return 60 // 顺子中间
  if (hasPrev || hasNext) return 40 // 顺子边张

  // 孤张
  return 20
}

// 生成一手牌
function generateHand(): { hand: Tile[], bestDiscard: Tile, discardReason: string } {
  const hand: Tile[] = []

  // 生成13张牌，确保有一定规律
  const types: TileType[] = VALID_TYPES
  for (let i = 0; i < 13; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const value = Math.floor(Math.random() * 9) + 1
    hand.push({ type, value })
  }

  // 找出价值最低的牌作为最佳出牌
  let minTile = hand[0]
  let minValue = evaluateTileValue(hand[0], hand)

  for (let i = 1; i < hand.length; i++) {
    const value = evaluateTileValue(hand[i], hand)
    if (value < minValue) {
      minValue = value
      minTile = hand[i]
    }
  }

  // 生成出牌理由
  let reason = '孤张'
  if (minValue <= 20) {
    const sameTypeCount = hand.filter(t => t.type === minTile.type).length
    if (sameTypeCount === 1) reason = '该花色仅此一张'
    else reason = '与其他牌无关联'
  }

  return { hand, bestDiscard: minTile, discardReason: reason }
}

export function DiscardMode({ onComplete }: DiscardModeProps) {
  const [gameState, setGameState] = useState(() => generateHand())
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [round, setRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(true)
  const maxRounds = 10

  // 倒计时
  useState(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
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
  })

  const handleSelectTile = (tile: Tile) => {
    if (showResult || !isRunning)
      return
    setSelectedTile(tile)
  }

  const handleConfirm = () => {
    if (!selectedTile || !isRunning)
      return

    setIsRunning(false)
    setShowResult(true)

    const isCorrect = selectedTile.type === gameState.bestDiscard.type
      && selectedTile.value === gameState.bestDiscard.value

    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft / 3)
      const streakBonus = streak * 20
      setScore(prev => prev + 100 + timeBonus + streakBonus)
      setStreak(prev => prev + 1)
    }
    else {
      setStreak(0)
      setScore(prev => Math.max(0, prev - 30))
    }

    setTimeout(() => {
      if (round < maxRounds) {
        setRound(prev => prev + 1)
        setGameState(generateHand())
        setSelectedTile(null)
        setShowResult(false)
        setTimeLeft(30)
        setIsRunning(true)
      }
      else {
        onComplete(score + (isCorrect ? 100 : 0), 30 - timeLeft)
      }
    }, 2500)
  }

  return (
    <div className="glass-card p-6">
      {/* 积分和进度 */}
      <div className="flex justify-between items-center mb-4 p-3 bg-black/20 rounded-xl">
        <div className="text-center">
          <div className="text-sm text-gray-400">当前积分</div>
          <div className="text-2xl font-bold text-yellow-400">{score}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">连击</div>
          <div className="text-2xl font-bold text-orange-400">
            {streak > 0 ? `${streak}x` : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">倒计时</div>
          <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'}`}>
            {timeLeft}s
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">本局</div>
          <div className="text-2xl font-bold text-cyan-400">
            {round}
            /
            {maxRounds}
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="text-center mb-6">
        <motion.div
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-purple-300">选择一张最应该打出的牌</span>
        </motion.div>
      </div>

      {/* 手牌显示 */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">你的手牌</h3>
        <motion.div
          className="flex flex-wrap justify-center gap-2 p-4 bg-black/20 rounded-xl"
          layout
        >
          {gameState.hand.map((tile, index) => (
            <AnimatedMajiangTile
              key={`discard-${tile.type}${tile.value}-${index}`}
              tile={tile}
              index={index}
              keyPrefix="discard-"
              selected={selectedTile?.type === tile.type && selectedTile?.value === tile.value}
              correct={showResult && tile.type === gameState.bestDiscard.type && tile.value === gameState.bestDiscard.value}
              error={showResult && selectedTile?.type === tile.type && selectedTile?.value === tile.value
                && !(tile.type === gameState.bestDiscard.type && tile.value === gameState.bestDiscard.value)}
              onClick={() => handleSelectTile(tile)}
            />
          ))}
        </motion.div>
      </div>

      {/* 结果提示 */}
      {showResult && (
        <motion.div
          className={`text-center p-4 rounded-xl mb-4 ${
            selectedTile?.type === gameState.bestDiscard.type && selectedTile?.value === gameState.bestDiscard.value
              ? 'bg-green-500/20 border border-green-500/30'
              : 'bg-red-500/20 border border-red-500/30'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {selectedTile?.type === gameState.bestDiscard.type && selectedTile?.value === gameState.bestDiscard.value
            ? (
                <div className="text-green-400 font-bold">
                  <span className="text-2xl mr-2">✓</span>
                  正确！
                  {gameState.discardReason}
                </div>
              )
            : (
                <div className="text-red-400 font-bold">
                  <span className="text-2xl mr-2">✗</span>
                  最佳出牌是
                  {' '}
                  {gameState.bestDiscard.value}
                  {gameState.bestDiscard.type}
                  <div className="text-sm font-normal mt-1 text-gray-400">{gameState.discardReason}</div>
                </div>
              )}
        </motion.div>
      )}

      {/* 确认按钮 */}
      {!showResult && (
        <motion.button
          className={`neon-button w-full ${selectedTile ? 'neon-button-success' : 'opacity-50 cursor-not-allowed'}`}
          onClick={handleConfirm}
          disabled={!selectedTile}
          whileHover={selectedTile ? { scale: 1.02 } : {}}
          whileTap={selectedTile ? { scale: 0.98 } : {}}
        >
          确认出牌
        </motion.button>
      )}
    </div>
  )
}
