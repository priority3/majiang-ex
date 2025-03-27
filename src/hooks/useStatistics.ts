import { useState } from 'react'

export function useStatistics() {
  const [attemptTimes, setAttemptTimes] = useState<number[]>([])
  const [completedHands, setCompletedHands] = useState(0)
  const [currentAttemptTime, setCurrentAttemptTime] = useState<number | null>(null)

  const recordAttempt = (timeSpent: number, isCorrect: boolean) => {
    setCurrentAttemptTime(timeSpent)
    setAttemptTimes(prev => [...prev, timeSpent])
    if (isCorrect) {
      setCompletedHands(prev => prev + 1)
    }
  }

  const finalizeCurrentAttempt = () => {
    if (currentAttemptTime !== null) {
      setAttemptTimes(prev => [...prev, currentAttemptTime])
      setCurrentAttemptTime(null)
    }
  }

  return {
    attemptTimes,
    completedHands,
    currentAttemptTime,
    recordAttempt,
    finalizeCurrentAttempt,
  }
}
