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

interface HandShape {
  score: number
  triplets: number
  pairs: number
  sequences: number
  adjacentPairs: number
  gapPairs: number
  isolatedTiles: number
}

function sameTile(a: Tile, b: Tile): boolean {
  return a.type === b.type && a.value === b.value
}

function tileKey(tile: Tile): string {
  return `${tile.type}-${tile.value}`
}

function formatTile(tile: Tile): string {
  return `${tile.value}${tile.type}`
}

function removeOneTile(hand: Tile[], target: Tile): Tile[] {
  const targetIndex = hand.findIndex(tile => sameTile(tile, target))
  if (targetIndex === -1)
    return hand

  return hand.filter((_, index) => index !== targetIndex)
}

function countSameTile(hand: Tile[], target: Tile): number {
  return hand.filter(tile => sameTile(tile, target)).length
}

function hasTile(hand: Tile[], type: TileType, value: number): boolean {
  return value >= 1 && value <= 9 && hand.some(tile => tile.type === type && tile.value === value)
}

function getTileDiscardPreference(tile: Tile, hand: Tile[]): number {
  const sameCount = countSameTile(hand, tile)
  const hasPrev = hasTile(hand, tile.type, tile.value - 1)
  const hasNext = hasTile(hand, tile.type, tile.value + 1)
  const hasGapPrev = hasTile(hand, tile.type, tile.value - 2)
  const hasGapNext = hasTile(hand, tile.type, tile.value + 2)
  const hasDirect = hasPrev || hasNext
  const hasGap = hasGapPrev || hasGapNext

  if (sameCount >= 3)
    return -28
  if (sameCount === 2)
    return -18
  if (hasPrev && hasNext)
    return -14
  if (hasDirect)
    return -8
  if (hasGap)
    return -2

  return tile.value === 1 || tile.value === 9 ? 16 : 12
}

function evaluateRemainingShape(hand: Tile[]): HandShape {
  let triplets = 0
  let pairs = 0
  let sequences = 0
  let adjacentPairs = 0
  let gapPairs = 0
  let isolatedTiles = 0
  let middleTileWeight = 0

  for (const type of VALID_TYPES) {
    const counts = Array.from({ length: 10 }, () => 0)
    for (const tile of hand) {
      if (tile.type === type)
        counts[tile.value] += 1
    }

    for (let value = 1; value <= 9; value++) {
      const count = counts[value]
      if (count === 0)
        continue

      if (count >= 3)
        triplets += 1
      if (count >= 2)
        pairs += 1

      if (value >= 3 && value <= 7)
        middleTileWeight += count

      const hasDirect = counts[value - 1] > 0 || counts[value + 1] > 0
      const hasGap = counts[value - 2] > 0 || counts[value + 2] > 0
      if (count === 1 && !hasDirect && !hasGap)
        isolatedTiles += 1
    }

    for (let value = 1; value <= 7; value++)
      sequences += Math.min(counts[value], counts[value + 1], counts[value + 2])

    for (let value = 1; value <= 8; value++)
      adjacentPairs += Math.min(counts[value], counts[value + 1])

    for (let value = 1; value <= 7; value++)
      gapPairs += Math.min(counts[value], counts[value + 2])
  }

  const score = triplets * 30
    + sequences * 26
    + pairs * 18
    + adjacentPairs * 10
    + gapPairs * 5
    + middleTileWeight
    - isolatedTiles * 12

  return {
    score,
    triplets,
    pairs,
    sequences,
    adjacentPairs,
    gapPairs,
    isolatedTiles,
  }
}

function buildDiscardReason(tile: Tile, hand: Tile[], remainingShape: HandShape): string {
  const sameCount = countSameTile(hand, tile)
  const hasPrev = hasTile(hand, tile.type, tile.value - 1)
  const hasNext = hasTile(hand, tile.type, tile.value + 1)
  const hasGapPrev = hasTile(hand, tile.type, tile.value - 2)
  const hasGapNext = hasTile(hand, tile.type, tile.value + 2)
  const keptMelds = remainingShape.triplets + remainingShape.sequences
  const keptWaits = remainingShape.adjacentPairs + remainingShape.gapPairs
  const shapeSummary = `打出 ${formatTile(tile)} 后，剩下手牌可保留 ${keptMelds} 组已成型组合、${remainingShape.pairs} 组对子和 ${keptWaits} 组搭子。`

  if (sameCount === 1 && !hasPrev && !hasNext && !hasGapPrev && !hasGapNext) {
    return `${shapeSummary}${formatTile(tile)} 没有同张、邻张或隔张联系，是当前最孤立的牌。`
  }

  if (sameCount === 1 && !hasPrev && !hasNext) {
    return `${shapeSummary}${formatTile(tile)} 只有隔张联系，进张面比连续搭子更窄。`
  }

  if (sameCount === 1 && (hasPrev || hasNext) && !(hasPrev && hasNext)) {
    return `${shapeSummary}${formatTile(tile)} 只有一侧邻张，保留其他对子和双向连张的收益更高。`
  }

  return `${shapeSummary}这个选择让剩余手牌的成组、对子和连续搭子总评分最高。`
}

function analyzeDiscard(tile: Tile, hand: Tile[]): TileAnalysis {
  const remainingHand = removeOneTile(hand, tile)
  const remainingShape = evaluateRemainingShape(remainingHand)

  return {
    score: remainingShape.score + getTileDiscardPreference(tile, hand),
    reason: buildDiscardReason(tile, hand, remainingShape),
  }
}

function generateDeck(): Tile[] {
  const deck: Tile[] = []
  for (const type of VALID_TYPES) {
    for (let value = 1; value <= 9; value++) {
      for (let count = 0; count < 4; count++)
        deck.push({ type, value })
    }
  }
  return deck
}

// 生成一手牌
function generateHand(): { hand: Tile[], bestDiscard: Tile, discardReason: string } {
  const hand: Tile[] = []
  const deck = generateDeck()

  for (let i = 0; i < 13; i++) {
    const index = Math.floor(Math.random() * deck.length)
    hand.push(deck.splice(index, 1)[0])
  }

  let bestTile = hand[0]
  let bestAnalysis = analyzeDiscard(hand[0], hand)
  const checkedTiles = new Set<string>([tileKey(hand[0])])

  for (let i = 1; i < hand.length; i++) {
    const tile = hand[i]
    const key = tileKey(tile)
    if (checkedTiles.has(key))
      continue

    checkedTiles.add(key)
    const analysis = analyzeDiscard(tile, hand)
    if (analysis.score > bestAnalysis.score) {
      bestAnalysis = analysis
      bestTile = tile
    }
  }

  return { hand, bestDiscard: bestTile, discardReason: bestAnalysis.reason }
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

  const selectedTileIsCorrect = selectedTile ? sameTile(selectedTile, gameState.bestDiscard) : false
  const actionLabel = showResult
    ? round < maxRounds ? '下一把' : '完成练习'
    : '确认出牌'
  const canUseActionButton = showResult || !!selectedTile
  const handleAction = () => {
    if (showResult) {
      handleNextHand()
      return
    }

    handleConfirm()
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
      {showResult && (
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
              {selectedTile && !selectedTileIsCorrect && (
                <div className="mt-2 text-xs text-cyan-100/60">
                  你选择的是：
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
            selectedTileIsCorrect
              ? 'bg-green-500/20 border border-green-500/30'
              : 'bg-red-500/20 border border-red-500/30'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {selectedTileIsCorrect
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

      {/* 操作按钮 */}
      <motion.button
        className={`neon-button w-full ${canUseActionButton ? 'neon-button-success' : 'opacity-50 cursor-not-allowed'}`}
        onClick={handleAction}
        disabled={!canUseActionButton}
        whileHover={canUseActionButton ? { scale: 1.02 } : {}}
        whileTap={canUseActionButton ? { scale: 0.98 } : {}}
      >
        {actionLabel}
      </motion.button>
    </div>
  )
}
