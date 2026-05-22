import type { Tile } from '../types'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { generatePatternHand } from '../utils/majiang'
import { trackAnswer } from '../utils/tracker'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'

interface PatternModeProps {
  onComplete: (score: number, time: number) => void
}

const PATTERNS = [
  { id: 'qiduizi', name: '七对子', desc: '7个对子组成的胡牌', icon: '🀄', color: 'from-purple-500 to-pink-500' },
  { id: 'pengpenghu', name: '碰碰胡', desc: '全部由刻子和将组成', icon: '🎯', color: 'from-red-500 to-orange-500' },
  { id: 'qingyise', name: '清一色', desc: '全部同一花色', icon: '✨', color: 'from-blue-500 to-cyan-500' },
  { id: 'hunyise', name: '混一色', desc: '只有一种花色+字牌', icon: '🌈', color: 'from-green-500 to-emerald-500' },
  { id: 'pinghu', name: '平胡', desc: '基本胡牌牌型', icon: '📋', color: 'from-yellow-500 to-amber-500' },
]

export function PatternMode({ onComplete }: PatternModeProps) {
  const [currentPattern, setCurrentPattern] = useState(() => PATTERNS[Math.floor(Math.random() * PATTERNS.length)])
  const [hand, setHand] = useState<Tile[]>(() => generatePatternHand(currentPattern.id))
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [round, setRound] = useState(1)
  const [startTime] = useState(Date.now())
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false)
  const maxRounds = 10

  const handleSelectPattern = (patternId: string) => {
    if (showResult)
      return
    setSelectedPattern(patternId)
  }

  const handleNextQuestion = () => {
    if (round < maxRounds) {
      setRound(prev => prev + 1)
      const newPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
      setCurrentPattern(newPattern)
      setHand(generatePatternHand(newPattern.id))
      setSelectedPattern(null)
      setShowResult(false)
    }
    else {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      onComplete(score, timeSpent)
    }
  }

  const handleConfirm = () => {
    if (!selectedPattern)
      return

    setShowResult(true)
    const isCorrect = selectedPattern === currentPattern.id
    setLastAnswerCorrect(isCorrect)

    if (isCorrect) {
      const streakBonus = streak * 20
      setScore(prev => prev + 200 + streakBonus)
      setStreak(prev => prev + 1)

      setTimeout(() => {
        handleNextQuestion()
      }, 2000)
    }
    else {
      setStreak(0)
      setScore(prev => Math.max(0, prev - 50))
    }
    trackAnswer('pattern', isCorrect, 'pattern_recognition')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResult && !lastAnswerCorrect) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          handleNextQuestion()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showResult, lastAnswerCorrect])

  return (
    <div className="glass-card p-6">
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
          <div className="text-sm text-gray-400">本局</div>
          <div className="text-2xl font-bold text-cyan-400">
            {round}
            /
            {maxRounds}
          </div>
        </div>
      </div>

      <motion.div
        className="text-center mb-6 p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-500/30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-orange-300 text-lg">判断这手牌属于什么牌型</span>
      </motion.div>

      <div className="mb-6">
        <div className="flex flex-wrap justify-center gap-1 p-3 bg-black/20 rounded-xl">
          {hand.map((tile, index) => (
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {PATTERNS.map(pattern => (
          <motion.button
            key={pattern.id}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedPattern === pattern.id
                ? `bg-gradient-to-r ${pattern.color} text-white border-2 border-white/30`
                : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
            } ${showResult && pattern.id === currentPattern.id ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-transparent' : ''}`}
            onClick={() => handleSelectPattern(pattern.id)}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{pattern.icon}</span>
              <div>
                <div className="font-bold">{pattern.name}</div>
                <div className="text-xs opacity-80">{pattern.desc}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

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

      {showResult && !lastAnswerCorrect && (
        <motion.button
          className="neon-button neon-button-success w-full"
          onClick={handleNextQuestion}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          下一题
        </motion.button>
      )}
    </div>
  )
}
