import type { Tile } from '../types'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { VALID_TYPES } from '../types'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'

interface PatternModeProps {
  onComplete: (score: number, time: number) => void
}

// 牌型定义
const PATTERNS = [
  { id: 'qiduizi', name: '七对子', desc: '7个对子组成的胡牌', icon: '🀄' },
  { id: 'pengpenghu', name: '碰碰胡', desc: '全部由刻子和将组成', icon: '🎯' },
  { id: 'qingyise', name: '清一色', desc: '全部同一花色', icon: '✨' },
  { id: 'hunyise', name: '混一色', desc: '只有一种花色+字牌', icon: '🌈' },
  { id: 'pinghu', name: '平胡', desc: '基本胡牌牌型', icon: ' basic' },
]

// 生成特定牌型的手牌
function generatePatternHand(pattern: typeof PATTERNS[0]): { hand: Tile[], patternId: string } {
  const hand: Tile[] = []

  switch (pattern.id) {
    case 'qiduizi': {
      // 七对子：7个对子
      const used = new Set<string>()
      while (hand.length < 14) {
        const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
        const value = Math.floor(Math.random() * 9) + 1
        const key = `${type}${value}`
        if (!used.has(key)) {
          hand.push({ type, value }, { type, value })
          used.add(key)
        }
      }
      break
    }
    case 'pengpenghu': {
      // 碰碰胡：4个刻子+1个将
      for (let i = 0; i < 4; i++) {
        const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
        const value = Math.floor(Math.random() * 9) + 1
        hand.push({ type, value }, { type, value }, { type, value })
      }
      const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
      const value = Math.floor(Math.random() * 9) + 1
      hand.push({ type, value }, { type, value })
      break
    }
    case 'qingyise': {
      // 清一色：全部同一花色
      const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
      for (let i = 0; i < 14; i++) {
        const value = Math.floor(Math.random() * 9) + 1
        hand.push({ type, value })
      }
      break
    }
    default: {
      // 普通牌型
      for (let i = 0; i < 13; i++) {
        const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
        const value = Math.floor(Math.random() * 9) + 1
        hand.push({ type, value })
      }
      break
    }
  }

  return { hand, patternId: pattern.id }
}

export function PatternMode({ onComplete }: PatternModeProps) {
  const [currentPattern] = useState(() => PATTERNS[Math.floor(Math.random() * PATTERNS.length)])
  const [gameState] = useState(() => generatePatternHand(currentPattern))
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [startTime] = useState(Date.now())
  const maxRounds = 5

  const handleSelectPattern = (patternId: string) => {
    if (showResult)
      return
    setSelectedPattern(patternId)
  }

  const handleConfirm = () => {
    if (!selectedPattern)
      return

    setShowResult(true)
    const isCorrect = selectedPattern === currentPattern.id
    if (isCorrect) {
      setScore(prev => prev + 200)
    }

    setTimeout(() => {
      if (round < maxRounds) {
        setRound(prev => prev + 1)
        setSelectedPattern(null)
        setShowResult(false)
        // 这里应该重新生成，简化处理
      }
      else {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000)
        onComplete(score + (isCorrect ? 200 : 0), timeSpent)
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
          题
        </div>
        <div className="text-gray-400">
          得分：
          <span className="text-yellow-400 font-bold">{score}</span>
        </div>
      </div>

      {/* 问题提示 */}
      <motion.div
        className="text-center mb-6 p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-500/30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-orange-300 text-lg">判断这手牌属于什么牌型</span>
      </motion.div>

      {/* 手牌显示 */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-1 p-3 bg-black/20 rounded-xl">
          {gameState.hand.map((tile, index) => (
            <AnimatedMajiangTile
              key={`pattern-${tile.type}${tile.value}-${index}`}
              tile={tile}
              index={index}
              keyPrefix="pattern-"
              small
            />
          ))}
        </div>
      </div>

      {/* 牌型选项 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PATTERNS.map(pattern => (
          <motion.button
            key={pattern.id}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedPattern === pattern.id
                ? 'bg-blue-500/20 border-2 border-blue-500/50'
                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
            } ${showResult && pattern.id === currentPattern.id ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => handleSelectPattern(pattern.id)}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{pattern.icon}</span>
              <div>
                <div className="text-white font-bold">{pattern.name}</div>
                <div className="text-xs text-gray-400">{pattern.desc}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* 结果提示 */}
      {showResult && (
        <motion.div
          className={`text-center p-4 rounded-xl mb-4 ${
            selectedPattern === currentPattern.id
              ? 'bg-green-500/20 border border-green-500/30'
              : 'bg-red-500/20 border border-red-500/30'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {selectedPattern === currentPattern.id
            ? (
                <div className="text-green-400 font-bold">
                  <span className="text-2xl mr-2">✓</span>
                  正确！这是
                  {currentPattern.name}
                </div>
              )
            : (
                <div className="text-red-400 font-bold">
                  <span className="text-2xl mr-2">✗</span>
                  正确答案是：
                  {currentPattern.name}
                </div>
              )}
        </motion.div>
      )}

      {/* 确认按钮 */}
      {!showResult && (
        <motion.button
          className={`neon-button w-full ${selectedPattern ? 'neon-button-success' : 'opacity-50 cursor-not-allowed'}`}
          onClick={handleConfirm}
          disabled={!selectedPattern}
          whileHover={selectedPattern ? { scale: 1.02 } : {}}
          whileTap={selectedPattern ? { scale: 0.98 } : {}}
        >
          确认答案
        </motion.button>
      )}
    </div>
  )
}
