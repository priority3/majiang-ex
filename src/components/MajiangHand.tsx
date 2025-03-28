import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useAnswerValidation } from '../hooks/useAnswerValidation'
import { useFeedback } from '../hooks/useFeedback'
import { useHandTiles } from '../hooks/useHandTiles'
import { useStatistics } from '../hooks/useStatistics'
import { useTileSelection } from '../hooks/useTileSelection'
import { useTimer } from '../hooks/useTimer'
import { generateSingleSequenceTiles } from '../utils/majiang'
import { AnimatedMajiangTile } from './AnimatedMajiangTile'
import { FeedbackSection } from './FeedbackSection'
import { SortButton } from './SortButton'
import { StatisticsSection } from './StatisticsSection'

export function MajiangHand() {
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

  const handleGenerateNewHand = () => {
    generateNewHand()
    start()
    resetSelection()
    resetFeedback()
  }
  useEffect(() => {
    handleGenerateNewHand()
  }, [])

  const handleConfirmSelection = () => {
    const endTime = handleConfirm()
    if (endTime) {
      end()
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      if (timeSpent !== undefined) {
        recordAttempt(timeSpent, isCorrect)
      }
    }
  }

  const fullTiles = generateSingleSequenceTiles(handInfo.excludeType)

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <StatisticsSection
        attemptTimes={attemptTimes}
        completedHands={completedHands}
        currentAttemptTime={currentAttemptTime}
      />
      <motion.button
        className="w-full mb-8 px-6 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:transform active:scale-95 cursor-pointer"
        onClick={handleGenerateNewHand}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        生成新的听牌序列
      </motion.button>

      <div className="mb-8">
        <div className="flex justify-between items-center text-gray-800 border-b pb-2">
          <h2 className="text-2xl font-bold">手牌</h2>
          {handInfo.hand.length
            ? (
                <SortButton
                  isSorted={isSortedHandTile}
                  onClick={toggleHandTilesOrder}
                />
              )
            : null}
        </div>
        <motion.div
          className="mt-3 grid grid-cols-9 gap-4 p-6 bg-gray-50 rounded-xl shadow-inner"
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

      <div>
        <div className="flex text-gray-800 border-b pb-2">
          <h2 className="text-2xl font-bold mb-4">选择可以胡的牌</h2>
        </div>
        <motion.div
          className="mt-3 grid grid-cols-9 gap-4 p-6 bg-gray-50 rounded-xl shadow-inner"
          layout
        >
          <AnimatePresence mode="popLayout">
            {handInfo.hand.length > 0
              ? fullTiles.map((tile, index) => (
                  <AnimatedMajiangTile
                    key={`ting-${tile.type}${tile.value}-${index}`}
                    tile={tile}
                    index={index}
                    selected={isSelected(tile)}
                    onClick={() => handleTileSelect(tile)}
                    keyPrefix="ting-"
                  />
                ))
              : null}
          </AnimatePresence>
        </motion.div>

        {selectedTiles.length > 0 && (
          <motion.div
            className="mt-4 flex justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              className="cursor-pointer px-8 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg active:transform active:scale-95"
              onClick={handleConfirmSelection}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              确认选择
            </motion.button>
            {isCorrect && showFeedback && (
              <motion.button
                className="cursor-pointer px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:transform active:scale-95"
                onClick={handleGenerateNewHand}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                重新生成
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

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
