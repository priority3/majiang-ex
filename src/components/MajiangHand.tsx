import type { GameMode } from './GameModeSelector'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { useSound } from '../hooks/useSound'
import { trackGameComplete, trackModeSelect } from '../utils/tracker'
import { AchievementSystem } from './AchievementSystem'
import { CelebrationEffect } from './CelebrationEffect'
import { DiscardMode } from './DiscardMode'
import { GameModeSelector } from './GameModeSelector'
import { PatternMode } from './PatternMode'
import { ScoreBoard } from './ScoreBoard'
import { SettingsPanel } from './SettingsPanel'
import { SpeedMode } from './SpeedMode'
import { StatsPanel } from './StatsPanel'
import { TingMode } from './TingMode'
import { TutorialOverlay } from './TutorialOverlay'

export function MajiangHand() {
  const {
    score,
    combo,
    level,
    exp,
    totalGames,
    totalWins,
    currentMode,
    modeStats,
    addScore,
    setMode,
    getModeAccuracy,
    getOverallAccuracy,
    resetStats,
  } = useGameState()

  const { playSound } = useSound()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('hard')
  const [celebrationType, setCelebrationType] = useState<'win' | 'combo' | 'levelup'>('win')
  const [showCelebration, setShowCelebration] = useState(false)

  const handleModeSelect = (mode: GameMode) => {
    setMode(mode)
    playSound('newgame')
    trackModeSelect(mode)
  }

  const gameStartTime = useState(Date.now())[0]
  const handleGameComplete = (gameScore: number, _time: number) => {
    const isWin = gameScore > 0
    const prevLevel = level

    addScore(gameScore, isWin, currentMode)
    trackGameComplete(currentMode, gameScore, isWin, Date.now() - gameStartTime)

    if (soundEnabled) {
      playSound(isWin ? 'correct' : 'wrong')
    }

    // 触发庆祝效果
    if (isWin) {
      if (combo >= 2) {
        setCelebrationType('combo')
        if (soundEnabled)
          playSound('combo')
      }
      else {
        setCelebrationType('win')
      }
      setShowCelebration(true)
    }

    // 升级庆祝
    if (level > prevLevel) {
      setTimeout(() => {
        setCelebrationType('levelup')
        setShowCelebration(true)
        if (soundEnabled)
          playSound('levelup')
      }, 1000)
    }
  }

  const handleToggleSound = () => {
    setSoundEnabled(prev => !prev)
  }

  return (
    <div className="relative z-10">
      {/* 教程弹窗 */}
      <TutorialOverlay
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />

      {/* 庆祝效果 */}
      <CelebrationEffect
        show={showCelebration}
        type={celebrationType}
        onComplete={() => setShowCelebration(false)}
      />

      {/* 成就系统 */}
      <AchievementSystem
        score={score}
        combo={combo}
        level={level}
        totalGames={totalGames}
        totalWins={totalWins}
      />

      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          className="text-4xl font-bold neon-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          麻将练习场
        </motion.h1>
        <div className="flex gap-3">
          {/* 帮助按钮 */}
          <motion.button
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setTutorialOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-xl">?</span>
          </motion.button>
          {/* 统计按钮 */}
          <motion.button
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setStatsOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </motion.button>
          {/* 设置按钮 */}
          <motion.button
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setSettingsOpen(true)}
            whileHover={{ scale: 1.1, rotate: 45 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* 计分板 */}
      <ScoreBoard
        score={score}
        combo={combo}
        level={level}
        exp={exp}
        showCombo={combo >= 3}
      />

      {/* 游戏模式选择 */}
      <GameModeSelector
        currentMode={currentMode}
        onSelectMode={handleModeSelect}
        getModeAccuracy={getModeAccuracy}
      />

      {/* 游戏区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMode}
          className={combo >= 3 ? 'combo-fire combo-glow rounded-2xl' : ''}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentMode === 'ting' && (
            <TingMode
              onComplete={handleGameComplete}
              soundEnabled={soundEnabled}
              difficulty={difficulty}
            />
          )}
          {currentMode === 'discard' && (
            <DiscardMode onComplete={handleGameComplete} />
          )}
          {currentMode === 'speed' && (
            <SpeedMode onComplete={handleGameComplete} />
          )}
          {currentMode === 'pattern' && (
            <PatternMode onComplete={handleGameComplete} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        difficulty={difficulty}
        onSetDifficulty={setDifficulty}
        onResetStats={resetStats}
      />

      {/* 统计面板 */}
      <StatsPanel
        isOpen={statsOpen}
        onClose={() => setStatsOpen(false)}
        totalGames={totalGames}
        totalWins={totalWins}
        score={score}
        modeStats={modeStats}
        getModeAccuracy={getModeAccuracy}
        getOverallAccuracy={getOverallAccuracy}
      />
    </div>
  )
}
