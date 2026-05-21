import type { Tile, TileType } from '../types'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { VALID_TYPES } from '../types'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'

interface DiscardModeProps {
  onComplete: (score: number, time: number) => void
}

// 生成一手牌（包含4张相同的牌）
function generateHand(): { hand: Tile[], bestDiscard: Tile } {
  const types: TileType[] = VALID_TYPES
  const hand: Tile[] = []

  // 生成13张牌
  for (let i = 0; i < 13; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const value = Math.floor(Math.random() * 9) + 1
    hand.push({ type, value })
  }

  // 随机选择一张作为最佳出牌（简化逻辑）
  const bestDiscard = hand[Math.floor(Math.random() * hand.length)]

  return { hand, bestDiscard }
}

export function DiscardMode({ onComplete }: DiscardModeProps) {
  const [gameState, setGameState] = useState(() => generateHand())
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const maxRounds = 10

  const handleSelectTile = (tile: Tile) => {
    if (showResult)
      return
    setSelectedTile(tile)
  }

  const handleConfirm = () => {
    if (!selectedTile)
      return

    setShowResult(true)

    // 简化的评分逻辑
    const isCorrect = selectedTile.type === gameState.bestDiscard.type
      && selectedTile.value === gameState.bestDiscard.value

    if (isCorrect) {
      setScore(prev => prev + 100)
    }

    setTimeout(() => {
      if (round < maxRounds) {
        setRound(prev => prev + 1)
        setGameState(generateHand())
        setSelectedTile(null)
        setShowResult(false)
      }
      else {
        onComplete(score + (isCorrect ? 100 : 0), 0)
      }
    }, 2000)
  }

  return (
    <div className="glass-card p-6">
      {/* 进度显示 */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-400">
          第
          {' '}
          <span className="text-white font-bold">{round}</span>
          {' '}
          /
          {' '}
          {maxRounds}
          {' '}
          轮
        </div>
        <div className="text-gray-400">
          得分：
          <span className="text-yellow-400 font-bold">{score}</span>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="text-center mb-6">
        <motion.div
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-purple-300">选择一张牌打出，使手牌听牌</span>
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
                </div>
              )
            : (
                <div className="text-red-400 font-bold">
                  <span className="text-2xl mr-2">✗</span>
                  最佳出牌是
                  {' '}
                  {gameState.bestDiscard.value}
                  {gameState.bestDiscard.type}
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
