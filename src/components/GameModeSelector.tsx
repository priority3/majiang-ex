import { motion } from 'framer-motion'

export type GameMode = 'ting' | 'discard' | 'pattern' | 'speed'

interface GameModeSelectorProps {
  currentMode: GameMode
  onSelectMode: (mode: GameMode) => void
  getModeAccuracy?: (mode: GameMode) => number
}

const GAME_MODES = [
  {
    id: 'ting' as GameMode,
    name: '听牌练习',
    icon: '🀄',
    description: '判断手牌可以胡哪些牌',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'discard' as GameMode,
    name: '出牌练习',
    icon: '🎯',
    description: '选择最佳出牌策略',
    color: 'from-purple-500 to-pink-400',
  },
  {
    id: 'pattern' as GameMode,
    name: '牌型识别',
    icon: '🧩',
    description: '快速识别麻将牌型',
    color: 'from-orange-500 to-yellow-400',
  },
  {
    id: 'speed' as GameMode,
    name: '速度挑战',
    icon: '⚡',
    description: '限时完成胡牌判断',
    color: 'from-green-500 to-emerald-400',
  },
]

export function GameModeSelector({ currentMode, onSelectMode, getModeAccuracy }: GameModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {GAME_MODES.map((mode, index) => {
        const accuracy = getModeAccuracy?.(mode.id) ?? 0
        return (
          <motion.button
            key={mode.id}
            className={`mode-card text-left ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => onSelectMode(mode.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}>
              {mode.icon}
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{mode.name}</h3>
            <p className="text-sm text-gray-400 mb-2">{mode.description}</p>
            {accuracy > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${accuracy}%`,
                      background: accuracy >= 70
                        ? 'linear-gradient(90deg, #43e97b, #38f9d7)'
                        : accuracy >= 40
                          ? 'linear-gradient(90deg, #f093fb, #f5576c)'
                          : 'linear-gradient(90deg, #ff6b6b, #ee5a24)',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400">
                  {accuracy}
                  %
                </span>
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
