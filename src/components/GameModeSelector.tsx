import { motion } from 'framer-motion'

export type GameMode = 'ting' | 'discard' | 'pattern' | 'speed'

interface GameModeSelectorProps {
  currentMode: GameMode
  onSelectMode: (mode: GameMode) => void
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

export function GameModeSelector({ currentMode, onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {GAME_MODES.map((mode, index) => (
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
          <p className="text-sm text-gray-400">{mode.description}</p>
        </motion.button>
      ))}
    </div>
  )
}
