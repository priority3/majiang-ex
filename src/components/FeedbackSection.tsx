import type { Tile } from '../types'
import { AnimatePresence, motion } from 'framer-motion'

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
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          className={`mt-6 p-5 rounded-xl text-center ${
            isCorrect
              ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
              : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30'
          }`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* 结果图标和文字 */}
          <div className="mb-4">
            <motion.div
              className={`text-5xl mb-3 ${isCorrect ? '' : 'animate-shake'}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              {isCorrect ? '🎉' : '😢'}
            </motion.div>
            <div className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {isCorrect ? '回答正确！' : '回答错误'}
            </div>
            {timeSpent && (
              <motion.div
                className="text-sm text-gray-400 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                用时：
                {timeSpent}
                秒
              </motion.div>
            )}
          </div>

          {/* 错误详情 */}
          {!isCorrect && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-300 text-sm mb-3">{getFeedbackMessage()}</p>
              <div className="flex justify-center gap-3">
                <motion.button
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-medium shadow-lg"
                  onClick={onShowHint}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💡 查看提示
                </motion.button>
                <motion.button
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg"
                  onClick={onShowAnswer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  👁️ 查看答案
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* 提示信息 */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="mt-4 p-4 bg-black/20 rounded-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <span className="text-xl">💡</span>
                  <span className="font-medium">
                    提示：这手牌可以胡
                    {' '}
                    {tingTiles.length}
                    {' '}
                    张牌
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 答案信息 */}
          <AnimatePresence>
            {showAnswer && (
              <motion.div
                className="mt-4 p-4 bg-black/20 rounded-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="text-purple-400 font-medium mb-2">
                  <span className="text-xl mr-2">👁️</span>
                  正确答案：
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {tingTiles.map((tile, index) => (
                    <motion.div
                      key={`answer-${tile.type}${tile.value}-${index}`}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 font-bold"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {tile.value}
                      {tile.type}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
