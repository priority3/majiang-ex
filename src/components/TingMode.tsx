import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAnswerValidation } from '../hooks/useAnswerValidation'
import { useFeedback } from '../hooks/useFeedback'
import { useHandTiles } from '../hooks/useHandTiles'
import { useSound } from '../hooks/useSound'
import { useStatistics } from '../hooks/useStatistics'
import { useTileSelection } from '../hooks/useTileSelection'
import { useTimer } from '../hooks/useTimer'
import { generateSingleSequenceTiles } from '../utils/majiang'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'
import { FeedbackSection } from './FeedbackSection'
import { ParticleBurst } from './ParticleBurst'
import { SortButton } from './SortButton'
import { StatisticsSection } from './StatisticsSection'
import { TimerDisplay } from './TimerDisplay'

interface TingModeProps {
  onComplete: (score: number, time: number) => void
  soundEnabled: boolean
  difficulty: 'easy' | 'normal' | 'hard'
}

export function TingMode({ onComplete, soundEnabled, difficulty }: TingModeProps) {
  const {
    handInfo,
    tingTiles,
    isSortedHandTile,
    generateNewHand,
    toggleHandTilesOrder,
  } = useHandTiles()

  const {
    selectedTiles,
    showFeedback,
    isSelected,
    handleTileSelect,
    handleConfirm,
    resetSelection,
  } = useTileSelection()

  const { startTime, start, end, getTimeSpent } = useTimer()
  const { isCorrect, errorTitles, missingTiles } = useAnswerValidation(tingTiles, selectedTiles)

  const {
    showAnswer,
    showHint,
    setShowAnswer,
    setShowHint,
    resetFeedback,
  } = useFeedback()

  const {
    attemptTimes,
    completedHands,
    currentAttemptTime,
    recordAttempt,
  } = useStatistics()

  const { playSound } = useSound()

  const [round, setRound] = useState(1)
  const maxRounds = 10

  const maxTime = difficulty === 'easy' ? 120 : difficulty === 'normal' ? 60 : 30
  const [timeLeft, setTimeLeft] = useState(maxTime)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // 积分状态
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showNoTingOption, setShowNoTingOption] = useState(false)
  const [showBurst, setShowBurst] = useState(false)

  const handleGenerateNewHand = () => {
    generateNewHand()
    start()
    resetSelection()
    resetFeedback()
    setTimeLeft(maxTime)
    setIsTimerRunning(true)
    setShowNoTingOption(false)
    if (soundEnabled)
      playSound('newgame')
  }

  const handleNextRound = () => {
    if (round < maxRounds) {
      setRound(prev => prev + 1)
      handleGenerateNewHand()
    }
  }

  const handleConfirmSelection = () => {
    const endTime = handleConfirm()
    if (endTime) {
      end()
      setIsTimerRunning(false)
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)

      // 判断是否选择正确
      const userSaysNoTing = selectedTiles.length === 0 && showNoTingOption
      const handIsTing = handInfo.isTing

      let isAnswerCorrect = false

      if (userSaysNoTing && !handIsTing) {
        // 用户说没有听牌，且确实没有听牌 -> 正确
        isAnswerCorrect = true
      }
      else if (!userSaysNoTing && handIsTing && isCorrect) {
        // 用户选择了听牌的牌，且选择正确 -> 正确
        isAnswerCorrect = true
      }

      // 计算得分
      if (isAnswerCorrect) {
        setShowBurst(true)
        const baseScore = 100
        const timeBonus = Math.floor(timeLeft / 3)
        const streakBonus = streak * 20
        const totalPoints = baseScore + timeBonus + streakBonus
        setScore(prev => prev + totalPoints)
        setStreak(prev => prev + 1)
      }
      else {
        // 答错扣分
        const penalty = Math.max(30, score * 0.1) // 至少扣30分
        setScore(prev => Math.max(0, prev - penalty))
        setStreak(0)
      }

      if (timeSpent !== undefined) {
        recordAttempt(timeSpent, isAnswerCorrect)
      }

      if (soundEnabled) {
        playSound(isAnswerCorrect ? 'correct' : 'wrong')
      }

      onComplete(isAnswerCorrect ? 100 : 0, timeSpent || 0)

      setTimeout(() => {
        handleNextRound()
      }, 2000)
    }
  }

  useEffect(() => {
    handleGenerateNewHand()
  }, [])

  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0)
      return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsTimerRunning(false)
          handleConfirmSelection()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimerRunning])

  const fullTiles = generateSingleSequenceTiles(handInfo.excludeType)

  // 处理"没有听牌"选项的点击
  const handleNoTingClick = () => {
    setShowNoTingOption(true)
    resetSelection()
  }

  // 处理选择听牌牌的点击（取消"没有听牌"选项）
  const handleTileSelectWrapper = (tile: any) => {
    setShowNoTingOption(false)
    handleTileSelect(tile)
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFeedback) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          handleNextRound()
        }
        return
      }

      switch (e.key) {
        case ' ':
        case 'Enter':
          if (selectedTiles.length > 0 || showNoTingOption) {
            e.preventDefault()
            handleConfirmSelection()
          }
          break
        case 'Backspace':
        case 'Delete':
          if (selectedTiles.length > 0) {
            e.preventDefault()
            const lastTile = selectedTiles[selectedTiles.length - 1]
            handleTileSelect(lastTile)
          }
          break
        case 'n':
        case 'N':
          e.preventDefault()
          if (!showNoTingOption)
            handleNoTingClick()
          else
            setShowNoTingOption(false)
          break
        case 'r':
        case 'R':
          if (e.ctrlKey || e.metaKey)
            break
          e.preventDefault()
          handleGenerateNewHand()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedTiles, showNoTingOption, showFeedback, handleConfirmSelection, handleNextRound, handleNoTingClick, handleGenerateNewHand, handleTileSelect])

  return (
    <div className="glass-card p-6 relative">
      <ParticleBurst show={showBurst} onComplete={() => setShowBurst(false)} />
      {/* 积分显示 */}
      <div className="flex justify-between items-center mb-4 p-3 bg-black/20 rounded-xl">
        <div className="text-center">
          <div className="text-sm text-gray-400">当前积分</div>
          <motion.div
            className="text-2xl font-bold text-yellow-400"
            animate={score > 0 ? { scale: [1, 1.1, 1] } : {}}
            key={score}
          >
            {score}
          </motion.div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-400">连击</div>
          <motion.div
            className="text-2xl font-bold text-orange-400"
            animate={streak > 0 ? { scale: [1, 1.2, 1] } : {}}
            key={streak}
          >
            {streak > 0 ? `${streak}x` : '-'}
          </motion.div>
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

      {/* 进度和计时器 */}
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
        <TimerDisplay
          time={timeLeft}
          maxTime={maxTime}
          isRunning={isTimerRunning}
          isWarning={timeLeft <= 10}
        />
        <div className="text-gray-400">
          缺：
          <span className="text-red-400 font-bold">{handInfo.excludeType}</span>
        </div>
      </div>

      {/* 统计信息 */}
      <StatisticsSection
        attemptTimes={attemptTimes}
        completedHands={completedHands}
        currentAttemptTime={currentAttemptTime}
      />

      {/* 操作按钮 */}
      <div className="flex gap-3 mb-6">
        <motion.button
          className="neon-button flex-1"
          onClick={handleGenerateNewHand}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          🎲 重新生成
        </motion.button>
        {handInfo.hand.length > 0 && (
          <SortButton
            isSorted={isSortedHandTile}
            onClick={toggleHandTilesOrder}
          />
        )}
      </div>

      {/* 手牌显示 */}
      <div className="mb-6">
        <div className="flex justify-between items-center text-gray-300 border-b border-white/10 pb-2 mb-4">
          <h2 className="text-xl font-bold">你的手牌</h2>
          {handInfo.excludeType && (
            <div className="text-sm text-gray-400">
              缺：
              <span className="text-red-400 font-bold">{handInfo.excludeType}</span>
            </div>
          )}
        </div>
        <motion.div
          className="flex flex-wrap justify-center gap-2 p-4 bg-black/20 rounded-xl"
          layout
          transition={{
            layout: {
              duration: 0.3,
              delay: 0.3,
              ease: 'easeOut',
            },
          }}
        >
          <AnimatePresence mode="popLayout">
            {handInfo.hand.map((tile, index) => (
              <AnimatedMajiangTile
                key={`hand-${tile.type}${tile.value}-${index}`}
                tile={tile}
                index={index}
                keyPrefix="hand-"
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 可选牌区域 */}
      <div className="mb-6">
        <div className="text-gray-300 border-b border-white/10 pb-2 mb-4">
          <h2 className="text-xl font-bold">选择可以胡的牌</h2>
          <p className="text-sm text-gray-500 mt-1">如果这手牌不能胡，请选择"没有听牌"</p>
        </div>
        <motion.div
          className="flex flex-wrap justify-center gap-2 p-4 bg-black/20 rounded-xl"
          layout
        >
          <AnimatePresence mode="popLayout">
            {handInfo.hand.length > 0
              ? fullTiles.map((tile, index) => (
                  <AnimatedMajiangTile
                    key={`ting-${tile.type}${tile.value}-${index}`}
                    tile={tile}
                    index={index}
                    keyPrefix="ting-"
                    selected={isSelected(tile)}
                    correct={showFeedback && handInfo.isTing && tingTiles.some(t => t.type === tile.type && t.value === tile.value)}
                    error={showFeedback && handInfo.isTing && selectedTiles.some(t => t.type === tile.type && t.value === tile.value) && !tingTiles.some(t => t.type === tile.type && t.value === tile.value)}
                    onClick={() => handleTileSelectWrapper(tile)}
                  />
                ))
              : null}
          </AnimatePresence>
        </motion.div>

        {/* 没有听牌按钮 */}
        <div className="mt-4 flex justify-center">
          <motion.button
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              showNoTingOption
                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            onClick={handleNoTingClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ❌ 没有听牌
          </motion.button>
        </div>
      </div>

      {/* 选择的牌/状态 */}
      {(selectedTiles.length > 0 || showNoTingOption) && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-gray-400 text-sm mb-2">你的选择：</div>
          {showNoTingOption
            ? (
                <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 inline-block">
                  没有听牌
                </div>
              )
            : (
                <div className="flex flex-wrap gap-2">
                  {selectedTiles.map((tile, index) => (
                    <div
                      key={`selected-${tile.type}${tile.value}-${index}`}
                      className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300"
                    >
                      {tile.value}
                      {tile.type}
                    </div>
                  ))}
                </div>
              )}
        </motion.div>
      )}

      {/* 确认按钮 */}
      {(selectedTiles.length > 0 || showNoTingOption) && !showFeedback && (
        <motion.button
          className="neon-button neon-button-success w-full mb-4"
          onClick={handleConfirmSelection}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ✓ 确认选择
        </motion.button>
      )}

      {/* 结果提示 */}
      {showFeedback && (
        <motion.div
          className={`text-center p-4 rounded-xl mb-4 ${
            (showNoTingOption && !handInfo.isTing) || (!showNoTingOption && handInfo.isTing && isCorrect)
              ? 'bg-green-500/20 border border-green-500/30'
              : 'bg-red-500/20 border border-red-500/30'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {(showNoTingOption && !handInfo.isTing) || (!showNoTingOption && handInfo.isTing && isCorrect)
            ? (
                <div className="text-green-400 font-bold">
                  <span className="text-2xl mr-2">✓</span>
                  正确！
                  {!handInfo.isTing ? '这手牌确实没有听牌' : `可以胡 ${tingTiles.length} 张牌`}
                </div>
              )
            : (
                <div className="text-red-400 font-bold">
                  <span className="text-2xl mr-2">✗</span>
                  错误！
                  {handInfo.isTing
                    ? `这手牌可以胡：${tingTiles.map(t => `${t.value}${t.type}`).join('、')}`
                    : '这手牌没有听牌'}
                </div>
              )}
        </motion.div>
      )}

      {/* 反馈区域 */}
      <FeedbackSection
        isCorrect={isCorrect}
        showFeedback={showFeedback}
        errorTitles={errorTitles}
        missingTiles={missingTiles}
        tingTiles={tingTiles}
        timeSpent={getTimeSpent()}
        onShowHint={() => setShowHint(true)}
        onShowAnswer={() => setShowAnswer(true)}
        showHint={showHint}
        showAnswer={showAnswer}
      />
    </div>
  )
}
