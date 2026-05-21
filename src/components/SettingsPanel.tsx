import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  difficulty: 'easy' | 'normal' | 'hard'
  onSetDifficulty: (d: 'easy' | 'normal' | 'hard') => void
  onResetStats?: () => void
}

export function SettingsPanel({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  difficulty,
  onSetDifficulty,
  onResetStats,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'game'>('general')

  const difficulties = [
    { id: 'easy' as const, name: '简单', desc: '显示提示信息', icon: '🌱' },
    { id: 'normal' as const, name: '普通', desc: '标准难度', icon: '🎯' },
    { id: 'hard' as const, name: '困难', desc: '限时挑战', icon: '🔥' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 设置面板 */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* 头部 */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">设置</h2>
                <button
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={onClose}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 标签页 */}
              <div className="flex gap-2 mt-4">
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'general'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  通用设置
                </button>
                <button
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'game'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab('game')}
                >
                  游戏设置
                </button>
              </div>
            </div>

            {/* 内容区 */}
            <div className="p-6 overflow-y-auto h-[calc(100%-180px)]">
              {activeTab === 'general'
                ? (
                    <div className="space-y-6">
                      {/* 音效开关 */}
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                          <div className="text-white font-medium">音效</div>
                          <div className="text-sm text-gray-400">开启或关闭游戏音效</div>
                        </div>
                        <button
                          className={`w-14 h-8 rounded-full transition-colors relative ${
                            soundEnabled ? 'bg-blue-500' : 'bg-gray-600'
                          }`}
                          onClick={onToggleSound}
                        >
                          <motion.div
                            className="w-6 h-6 rounded-full bg-white shadow-md absolute top-1"
                            animate={{ left: soundEnabled ? 30 : 4 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      {/* 主题颜色 */}
                      <div className="p-4 bg-white/5 rounded-xl">
                        <div className="text-white font-medium mb-3">主题颜色</div>
                        <div className="flex gap-3">
                          {['#00f2fe', '#f093fb', '#43e97b', '#fa709a'].map(color => (
                            <button
                              key={color}
                              className="w-10 h-10 rounded-full border-2 border-transparent hover:border-white/50 transition-colors"
                              style={{ background: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 重置统计 */}
                      {onResetStats && (
                        <div className="p-4 bg-white/5 rounded-xl">
                          <div className="text-white font-medium mb-2">数据管理</div>
                          <div className="text-sm text-gray-400 mb-3">重置所有练习统计和积分数据</div>
                          <button
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
                            onClick={onResetStats}
                          >
                            重置统计数据
                          </button>
                        </div>
                      )}
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      {/* 难度选择 */}
                      <div className="text-white font-medium mb-4">难度选择</div>
                      {difficulties.map(d => (
                        <button
                          key={d.id}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            difficulty === d.id
                              ? 'bg-blue-500/20 border border-blue-500/30'
                              : 'bg-white/5 hover:bg-white/10 border border-transparent'
                          }`}
                          onClick={() => onSetDifficulty(d.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{d.icon}</span>
                            <div>
                              <div className="text-white font-medium">{d.name}</div>
                              <div className="text-sm text-gray-400">{d.desc}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
            </div>

            {/* 底部信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-gray-900/80">
              <div className="text-center text-sm text-gray-500">
                <p>麻将练习 v1.0</p>
                <p className="mt-1">Made with ❤️</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
