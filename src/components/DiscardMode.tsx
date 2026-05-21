import type { Tile, TileType } from '../types'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { VALID_TYPES } from '../types'
import { sortTilesByMahjongOrder } from '../utils/majiang'
import { trackAnswer } from '../utils/tracker'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'
import { MajiangTile } from './MajiangTile'
import { SortButton } from './SortButton'

interface DiscardModeProps {
  onComplete: (score: number, time: number) => void
}

interface TileAnalysis {
  score: number
  reason: string
}

// 评估一张牌的"价值"（简化逻辑：孤张价值低，对子/刻子价值高）
function evaluateTileValue(tile: Tile, hand: Tile[]): TileAnalysis {
  const sameValueCount = hand.filter(t => t.value === tile.value && t.type === tile.type).length

  // 刻子或对子中的牌价值更高
  if (sameValueCount >= 3)
    return { score: 100, reason: '这是刻子，已经成组，应该优先保留。' }
  if (sameValueCount >= 2)
    return { score: 80, reason: '这是对子，后续更容易组合成有效面子。' }

  // 检查是否能组成顺子
  const hasPrev = hand.some(t => t.type === tile.type && t.value === tile.value - 1)
  const hasNext = hand.some(t => t.type === tile.type && t.value === tile.value + 1)

  if (hasPrev && hasNext)
    return { score: 60, reason: '这是顺子中张，两边都能进张，留着更灵活。' }
  if (hasPrev || hasNext)
    return { score: 40, reason: '这是顺子边张，能进张但空间比中张更窄。' }

  // 孤张
  const sameTypeCount = hand.filter(t => t.type === tile.type).length
  return {
    score: 20,
    reason: sameTypeCount === 1
      ? '这张牌是孤张，这个花色里只有这一张。'
      : '这张牌和其他牌没有明显搭子关系，优先处理。',
  }
}

function sameTile(a: Tile, b: Tile): boolean {
  return a.type === b.type && a.value === b.value
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
  let minAnalysis = evaluateTileValue(hand[0], hand)

  for (let i = 1; i < hand.length; i++) {
    const analysis = evaluateTileValue(hand[i], hand)
    if (analysis.score < minAnalysis.score) {
      minAnalysis = analysis
      minTile = hand[i]
    }
  }

  return { hand, bestDiscard: minTile, discardReason: minAnalysis.reason }
}

export function DiscardMode({ onComplete }: DiscardModeProps) {
  const [gameState, setGameState] = useState(() => generateHand())
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isSortedHandTile, setIsSortedHandTile] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [round, setRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isRunning, setIsRunning] = useState(true)
  const maxRounds = 10
  const onCompleteRef = useRef(onComplete)
  const scoreRef = useRef(score)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    if (!isRunning || showResult)
      return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsRunning(false)
          onCompleteRef.current(scoreRef.current, 30)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, showResult])

  const displayHand = useMemo(() => {
    return isSortedHandTile
      ? sortTilesByMahjongOrder(gameState.hand)
      : gameState.hand
  }, [gameState.hand, isSortedHandTile])

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
    trackAnswer('discard', isCorrect, 'best_discard')
  }

  const handleNextHand = () => {
    if (round < maxRounds) {
      setRound(prev => prev + 1)
      setGameState(generateHand())
      setSelectedTile(null)
      setShowResult(false)
      setTimeLeft(30)
      setIsRunning(true)
      setIsSortedHandTile(false)
      return
    }

    onCompleteRef.current(scoreRef.current, 30 - timeLeft)
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
            {timeLeft}
            s
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
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-bold text-white">你的手牌</h3>
          <SortButton
            isSorted={isSortedHandTile}
            onClick={() => setIsSortedHandTile(prev => !prev)}
          />
        </div>
        <motion.div
          className="flex flex-wrap justify-center gap-2 p-4 bg-black/20 rounded-xl"
          layout
        >
          {displayHand.map((tile, index) => (
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

      {/* 推荐分析 */}
      {(selectedTile || showResult) && (
        <motion.div
          className="mb-6 p-4 rounded-xl border border-cyan-400/20 bg-cyan-500/10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <MajiangTile
              tile={gameState.bestDiscard}
              correct
              small
            />
            <div className="min-w-0 flex-1">
              <div className="text-cyan-200 font-semibold">
                推荐出牌：
                {gameState.bestDiscard.value}
                {gameState.bestDiscard.type}
              </div>
              <div className="mt-1 text-sm text-cyan-100/80">
                理由：
                {gameState.discardReason}
              </div>
              {selectedTile && !sameTile(selectedTile, gameState.bestDiscard) && !showResult && (
                <div className="mt-2 text-xs text-cyan-100/60">
                  你当前选择：
                  {selectedTile.value}
                  {selectedTile.type}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

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

      {/* 下一把 */}
      {showResult && (
        <motion.button
          className="neon-button neon-button-success w-full"
          onClick={handleNextHand}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {round < maxRounds ? '下一把' : '完成练习'}
        </motion.button>
      )}
    </div>
  )
}
