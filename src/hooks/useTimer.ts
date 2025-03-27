import { useState } from 'react'

export function useTimer() {
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)

  const start = () => {
    setStartTime(Date.now())
    setEndTime(null)
  }

  const end = () => {
    setEndTime(Date.now())
  }

  const getTimeSpent = () => {
    if (!startTime || !endTime)
      return null
    return ((endTime - startTime) / 1000).toFixed(1)
  }

  return {
    start,
    end,
    getTimeSpent,
  }
}
