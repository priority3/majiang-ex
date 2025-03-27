import type { Tile } from '../types'

interface FeedbackSectionProps {
  isCorrect: boolean
  showFeedback: boolean
  errorTitles: Tile[]
  missingTiles: Tile[]
  tingTiles: Tile[]
  timeSpent?: number
  onShowHint: () => void
  onShowAnswer: () => void
  showHint: boolean
  showAnswer: boolean
}

export function FeedbackSection({
  isCorrect,
  showFeedback,
  errorTitles,
  missingTiles,
  tingTiles,
  timeSpent,
  onShowHint,
  onShowAnswer,
  showHint,
  showAnswer,
}: FeedbackSectionProps) {
  const getFeedbackMessage = () => {
    if (errorTitles.length > 0 && missingTiles.length > 0) {
      return '你选择了一些错误的牌，同时也漏掉了一些正确的牌'
    }
    else if (errorTitles.length > 0) {
      return '你选择了一些错误的牌'
    }
    else if (missingTiles.length > 0) {
      return '你漏掉了一些正确的牌'
    }
    return ''
  }

  return (
    <div className={`mt-6 p-4 rounded-lg text-center text-lg font-semibold ${
      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    } ${showFeedback ? 'visible' : 'invisible'}`}
    >
      {isCorrect ? '回答正确！' : '回答错误，请重试'}
      {timeSpent && (
        <div className="mt-2 text-sm">
          用时：
          {timeSpent}
          秒
        </div>
      )}
      {!isCorrect && showFeedback && (
        <div className="mt-4 space-y-4">
          <p className="text-base">{getFeedbackMessage()}</p>
          <div className="flex justify-center gap-4">
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              onClick={onShowHint}
            >
              查看提示
            </button>
            <button
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              onClick={onShowAnswer}
            >
              查看答案
            </button>
          </div>
          {showHint && (
            <div className="mt-2 text-sm">
              提示：这手牌可以胡
              {' '}
              {tingTiles.length}
              {' '}
              张牌
            </div>
          )}
          {showAnswer && (
            <div className="mt-2 text-sm">
              正确答案是：
              {tingTiles.map(tile => `${tile.value}${tile.type}`).join('、')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
