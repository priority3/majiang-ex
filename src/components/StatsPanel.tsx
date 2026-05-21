import type { GameMode } from './GameModeSelector'
import { AnimatePresence, motion } from 'framer-motion'

interface ModeStats {
  games: number
  wins: number
  totalScore: number
  bestStreak: number
}

interface StatsPanelProps {
  isOpen: boolean
  onClose: () => void
  totalGames: number
  totalWins: number
  score: number
  modeStats: Record<GameMode, ModeStats>
  getModeAccuracy: (mode: GameMode) => number
  getOverallAccuracy: () => number
}

const MODE_LABELS: Record<GameMode, { name: string, icon: string }> = {
  ting: { name: '听牌练习', icon: '🀄' },
  discard: { name: '出牌练习', icon: '🗑️' },
  pattern: { name: '牌型识别', icon: '🎯' },
  speed: { name: '速度挑战', icon: '⚡' },
}

export function StatsPanel({
  isOpen,
  onClose,
  totalGames,
  totalWins,
  score,
  modeStats,
  getModeAccuracy,
  getOverallAccuracy,
}: StatsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md glass-card z-50 p-6 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">练习统计</h2>
              <motion.button
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>

            {/* 总体统计 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-black/20 rounded-xl text-center">
                <div className="text-sm text-gray-400">总场次</div>
                <div className="text-3xl font-bold text-cyan-400">{totalGames}</div>
              </div>
              <div className="p-4 bg-black/20 rounded-xl text-center">
                <div className="text-sm text-gray-400">胜率</div>
                <div className="text-3xl font-bold text-green-400">
                  {getOverallAccuracy()}
                  %
                </div>
              </div>
              <div className="p-4 bg-black/20 rounded-xl text-center">
                <div className="text-sm text-gray-400">总积分</div>
                <div className="text-3xl font-bold text-yellow-400">{score}</div>
              </div>
              <div className="p-4 bg-black/20 rounded-xl text-center">
                <div className="text-sm text-gray-400">胜场</div>
                <div className="text-3xl font-bold text-orange-400">{totalWins}</div>
              </div>
            </div>

            {/* 各模式统计 */}
            <h3 className="text-lg font-bold text-white mb-3">各模式详情</h3>
            <div className="space-y-3">
              {Object.entries(MODE_LABELS).map(([mode, label]) => {
                const stats = modeStats[mode as GameMode]
                const accuracy = getModeAccuracy(mode as GameMode)
                return (
                  <div
                    key={mode}
                    className="p-4 bg-black/20 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{label.icon}</span>
                        <span className="font-bold text-white">{label.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${accuracy >= 70 ? 'text-green-400' : accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {accuracy}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>
                        场次：
                        {stats.games}
                      </span>
                      <span>
                        胜场：
                        {stats.wins}
                      </span>
                      <span>
                        最高连击：
                        {stats.bestStreak}
                      </span>
                    </div>
                    {/* 准确率进度条 */}
                    <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: accuracy >= 70
                            ? 'linear-gradient(90deg, #43e97b, #38f9d7)'
                            : accuracy >= 40
                              ? 'linear-gradient(90deg, #f093fb, #f5576c)'
                              : 'linear-gradient(90deg, #ff6b6b, #ee5a24)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
