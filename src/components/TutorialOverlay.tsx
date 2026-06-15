import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

interface TutorialOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const TUTORIAL_STEPS = [
  {
    title: '麻将牌有哪些',
    content: '本练习使用三种花色：万、条、筒，每种各有 1 到 9，共 27 种牌，每种 4 张。没有字牌（东南西北中发白）。',
    icon: '🀄',
  },
  {
    title: '怎样才算胡牌',
    content: '凑齐 14 张牌，组成「4 个面子 + 1 对将」即为胡牌。手里平时拿 13 张，再摸/碰到合适的第 14 张就能胡。',
    icon: '✅',
  },
  {
    title: '面子与将',
    content: '面子有两种：顺子（同花色三张连续，如 3万4万5万）、刻子（三张相同，如 7条7条7条）。将（雀头）是任意一对相同的牌。',
    icon: '🧩',
  },
  {
    title: '缺一门',
    content: '四川麻将规则：手牌只能保留两种花色，必须缺掉其中一门才能胡牌。所以判断时只看剩下的两门牌怎么组合。',
    icon: '🚫',
  },
  {
    title: '什么是听牌',
    content: '当手上 13 张牌「只差一张就能胡」时，就叫听牌。那些能让你胡牌的牌，就是你「听的牌」，可能有一张或多张。',
    icon: '🎯',
  },
  {
    title: '常见番型',
    content: '七对：七组对子凑成 14 张。清一色：整副牌只有一种花色。碰碰胡：全部由刻子加一对将组成，没有顺子。',
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
            {/* 顶部：进度指示器 + 跳过按钮（同一行，避免重叠） */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <div className="flex flex-1 gap-2">
                {TUTORIAL_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <button
                className="shrink-0 whitespace-nowrap text-sm text-gray-400 transition-colors hover:text-white"
                onClick={onClose}
              >
                跳过教程
              </button>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
