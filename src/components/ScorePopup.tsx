import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ScorePopupProps {
  score: number
  show: boolean
  onComplete?: () => void
}

export function ScorePopup({ score, show, onComplete }: ScorePopupProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show && score > 0) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onComplete?.()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [show, score, onComplete])

  return (
    <AnimatePresence>
      {visible && score > 0 && (
        <motion.div
          className="fixed top-1/3 left-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: 0, x: '-50%', scale: 0.5 }}
          animate={{ opacity: 1, y: -60, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -100, x: '-50%', scale: 0.8 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div
            className="text-4xl font-black text-yellow-400 whitespace-nowrap"
            style={{
              textShadow: '0 0 20px rgba(250, 204, 21, 0.8), 0 0 40px rgba(250, 204, 21, 0.4)',
            }}
          >
            +
            {score}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
