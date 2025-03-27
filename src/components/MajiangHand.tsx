import { useAnswerValidation } from '../hooks/useAnswerValidation'
import { useHandTiles } from '../hooks/useHandTiles'
import { useTileSelection } from '../hooks/useTileSelection'
import { useTimer } from '../hooks/useTimer'
import { generateSingleSequenceTiles } from '../utils/majiang'
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

  const { isCorrect } = useAnswerValidation(tingTiles, selectedTiles)

  const handleGenerateNewHand = () => {
    _generateNewHand()
    start()
    resetSelection()
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

      <div className={`mt-6 p-4 rounded-lg text-center text-lg font-semibold ${
        isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      } ${showFeedback ? 'visible' : 'invisible'}`}
      >
        {isCorrect ? '回答正确！' : '回答错误，请重试'}
        {getTimeSpent() && (
          <div className="mt-2 text-sm">
            用时：
            {getTimeSpent()}
            秒
          </div>
        )}
      </div>
    </div>
  )
}
