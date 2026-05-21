import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

interface AchievementSystemProps {
  score: number
  combo: number
  level: number
  totalGames: number
  totalWins: number
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', name: '初露锋芒', description: '完成第一局', icon: '🌟', unlocked: false },
  { id: 'combo_3', name: '势如破竹', description: '达成3连击', icon: '🔥', unlocked: false },
  { id: 'combo_5', name: '无人能挡', description: '达成5连击', icon: '💪', unlocked: false },
  { id: 'combo_10', name: '十连绝世', description: '达成10连击', icon: '👑', unlocked: false },
  { id: 'score_1000', name: '千分达人', description: '得分超过1000', icon: '💎', unlocked: false },
  { id: 'score_5000', name: '万夫莫敌', description: '得分超过5000', icon: '🏆', unlocked: false },
  { id: 'level_5', name: '身经百战', description: '达到5级', icon: '🎖️', unlocked: false },
  { id: 'level_10', name: '麻将大师', description: '达到10级', icon: '🏅', unlocked: false },
  { id: 'games_10', name: '勤学苦练', description: '完成10局', icon: '📚', unlocked: false },
  { id: 'games_50', name: '炉火纯青', description: '完成50局', icon: '🎯', unlocked: false },
  { id: 'perfect_10', name: '完美无瑕', description: '连续10局全对', icon: '✨', unlocked: false },
  { id: 'speed_demon', name: '电光火石', description: '10秒内完成一题', icon: '⚡', unlocked: false },
]

interface UnlockedNotification {
  achievement: Achievement
  timestamp: number
}

export function AchievementSystem({ score, combo, level, totalGames, totalWins }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [showNotification, setShowNotification] = useState<UnlockedNotification | null>(null)
  const [showPanel, setShowPanel] = useState(false)

  // 检查成就解锁
  useEffect(() => {
    const newUnlocked: Achievement[] = []

    const checkAchievement = (id: string, condition: boolean) => {
      const achievement = achievements.find(a => a.id === id)
      if (achievement && !achievement.unlocked && condition) {
        newUnlocked.push({ ...achievement, unlocked: true, unlockedAt: Date.now() })
      }
    }

    checkAchievement('first_win', totalWins >= 1)
    checkAchievement('combo_3', combo >= 3)
    checkAchievement('combo_5', combo >= 5)
    checkAchievement('combo_10', combo >= 10)
    checkAchievement('score_1000', score >= 1000)
    checkAchievement('score_5000', score >= 5000)
    checkAchievement('level_5', level >= 5)
    checkAchievement('level_10', level >= 10)
    checkAchievement('games_10', totalGames >= 10)
    checkAchievement('games_50', totalGames >= 50)

    if (newUnlocked.length > 0) {
      setAchievements(prev =>
        prev.map((a) => {
          const unlocked = newUnlocked.find(u => u.id === a.id)
          return unlocked || a
        }),
      )
      // 显示第一个新解锁的通知
      setShowNotification({ achievement: newUnlocked[0], timestamp: Date.now() })
      setTimeout(() => setShowNotification(null), 3000)
    }
  }, [score, combo, level, totalGames, totalWins])

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <>
      {/* 成就通知弹窗 */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, x: 100, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="glass-card p-4 flex items-center gap-4 glow-border">
              <div className="text-4xl animate-bounce">
                {showNotification.achievement.icon}
              </div>
              <div>
                <div className="text-yellow-400 font-bold text-sm">成就解锁！</div>
                <div className="text-white font-bold">{showNotification.achievement.name}</div>
                <div className="text-gray-400 text-sm">{showNotification.achievement.description}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成就入口按钮 */}
      <motion.button
        className="fixed bottom-4 left-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg cursor-pointer"
        onClick={() => setShowPanel(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🏆
        {unlockedCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unlockedCount}
          </div>
        )}
      </motion.button>

      {/* 成就面板 */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              className="fixed inset-x-4 top-[10%] bottom-[10%] max-w-2xl mx-auto glass-card z-50 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              {/* 头部 */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">🏆 成就殿堂</h2>
                  <div className="text-gray-400">
                    {unlockedCount}
                    {' '}
                    /
                    {achievements.length}
                  </div>
                </div>
                <div className="progress-bar mt-4">
                  <div
                    className="progress-fill"
                    style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* 成就列表 */}
              <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
                <div className="grid grid-cols-2 gap-4">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      className={`p-4 rounded-xl transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                          : 'bg-white/5 border border-white/10 opacity-50'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold ${achievement.unlocked ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {achievement.name}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {achievement.description}
                          </div>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
