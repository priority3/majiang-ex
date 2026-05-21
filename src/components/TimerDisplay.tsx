import { motion } from 'framer-motion'

interface TimerDisplayProps {
  time: number
  maxTime?: number
  isRunning: boolean
  isWarning?: boolean
}

export function TimerDisplay({ time, maxTime = 60, isRunning: _isRunning, isWarning = false }: TimerDisplayProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = maxTime > 0 ? (time / maxTime) * 100 : 0
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (isWarning)
      return '#ef4444'
    if (progress > 75)
      return '#22c55e'
    if (progress > 50)
      return '#eab308'
    if (progress > 25)
      return '#f97316'
    return '#ef4444'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG 圆形进度条 */}
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        {/* 背景圆 */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        {/* 进度圆 */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor()}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            filter: `drop-shadow(0 0 6px ${getColor()})`,
          }}
        />
      </svg>

      {/* 时间文字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="timer-display text-xl font-bold"
          style={{ color: getColor() }}
          animate={isWarning ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: isWarning ? Infinity : 0, duration: 1 }}
        >
          {formatTime(time)}
        </motion.div>
      </div>
    </div>
  )
}
