import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface TutorialOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const TUTORIAL_STEPS = [
  {
    title: '欢迎来到麻将练习场！',
    content: '这是一个帮助你提升麻将技巧的练习工具。通过多种游戏模式，你可以锻炼听牌判断、出牌策略等核心技能。',
    icon: '🀄',
  },
  {
    title: '听牌练习',
    content: '观察手牌，判断哪些牌可以让你胡牌。记住：如果手牌不能胡，请选择"没有听牌"。答对加分，答错扣分！',
    icon: '🎯',
  },
  {
    title: '出牌练习',
    content: '从手牌中选择最佳出牌。好的出牌策略能让你更快听牌、胡牌。',
    icon: '🃏',
  },
  {
    title: '牌型识别',
    content: '快速识别麻将牌型：七对子、碰碰胡、清一色等。掌握牌型是提高牌技的基础。',
    icon: '🧩',
  },
  {
    title: '速度挑战',
    content: '在限定时间内回答尽可能多的问题。速度越快、连击越多，得分越高！',
    icon: '⚡',
  },
  {
    title: '积分与成就',
    content: '每次正确回答都会获得积分和连击奖励。解锁成就可以获得额外荣誉。加油成为麻将大师！',
    icon: '🏆',
  },
]

export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
    else {
      onClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 教程内容 */}
          <motion.div
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[80vh] glass-card z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {/* 进度指示器 */}
            <div className="flex gap-2 p-4 border-b border-white/10">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* 内容区 */}
            <div className="p-6 min-h-[300px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1"
                >
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">
                      {TUTORIAL_STEPS[currentStep].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">
                      {TUTORIAL_STEPS[currentStep].title}
                    </h2>
                    <p className="text-gray-300 leading-relaxed">
                      {TUTORIAL_STEPS[currentStep].content}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 按钮区 */}
              <div className="flex justify-between items-center mt-6">
                <button
                  className={`px-4 py-2 text-gray-400 hover:text-white transition-colors ${
                    currentStep === 0 ? 'invisible' : ''
                  }`}
                  onClick={handlePrev}
                >
                  上一步
                </button>
                <div className="text-sm text-gray-500">
                  {currentStep + 1}
                  {' '}
                  /
                  {TUTORIAL_STEPS.length}
                </div>
                <motion.button
                  className="neon-button px-6 py-2"
                  onClick={handleNext}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? '开始游戏' : '下一步'}
                </motion.button>
              </div>
            </div>

            {/* 跳过按钮 */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm"
              onClick={onClose}
            >
              跳过教程
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
