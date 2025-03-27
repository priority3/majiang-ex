import { useState } from 'react'
import { useAnswerValidation } from '../hooks/useAnswerValidation'
import { useHandTiles } from '../hooks/useHandTiles'
import { useTileSelection } from '../hooks/useTileSelection'
import { useTimer } from '../hooks/useTimer'
import { generateSingleSequenceTiles } from '../utils/majiang'
import { FeedbackSection } from './FeedbackSection'
import { MajiangTile } from './MajiangTile'
import { SortButton } from './SortButton'

export function MajiangHand() {
  const {
    handInfo,
    tingTiles,
    isSortedHandTile,
    generateNewHand: _generateNewHand,
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

  const { start, end, getTimeSpent } = useTimer()

  const { isCorrect, errorTitles, missingTiles } = useAnswerValidation(tingTiles, selectedTiles)

  const [showAnswer, setShowAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleGenerateNewHand = () => {
    _generateNewHand()
    start()
    resetSelection()
    setShowAnswer(false)
    setShowHint(false)
  }

  const handleConfirmSelection = () => {
    const endTime = handleConfirm()
    if (endTime) {
      end()
    }
  }

  const fullTiles = generateSingleSequenceTiles(handInfo.excludeType)

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <button
        className="w-full mb-8 px-6 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:transform active:scale-95"
        onClick={handleGenerateNewHand}
      >
        生成新的听牌序列
      </button>

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
        <div className="grid grid-cols-9 gap-4 p-6 bg-gray-50 rounded-xl shadow-inner">
          {handInfo.hand.map((tile, index) => (
            <MajiangTile
              key={`${tile.type}${tile.value}-${index}`}
              tile={tile}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex text-gray-800 border-b pb-2">
          <h2 className="text-2xl font-bold mb-4">选择可以胡的牌</h2>
        </div>
        <div className="grid grid-cols-9 gap-4 p-6 bg-gray-50 rounded-xl shadow-inner">
          {handInfo.hand.length > 0
            ? fullTiles.map((tile, index) => (
                <MajiangTile
                  key={`ting-${tile.type}${tile.value}-${index}`}
                  tile={tile}
                  selected={isSelected(tile)}
                  onClick={() => handleTileSelect(tile)}
                />
              ))
            : null}
        </div>

        {selectedTiles.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              className="px-8 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg active:transform active:scale-95"
              onClick={handleConfirmSelection}
            >
              确认选择
            </button>
          </div>
        )}
      </div>

      <FeedbackSection
        isCorrect={isCorrect}
        showFeedback={showFeedback}
        errorTitles={errorTitles}
        missingTiles={missingTiles}
        tingTiles={tingTiles}
        timeSpent={getTimeSpent() || undefined}
        onShowHint={() => setShowHint(true)}
        onShowAnswer={() => setShowAnswer(true)}
        showHint={showHint}
        showAnswer={showAnswer}
      />
    </div>
  )
}
