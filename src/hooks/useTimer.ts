import { useState } from 'react'

export function useTimer() {
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(0)

  const start = () => {
    setStartTime(Date.now())
    setEndTime(0)
  }

  const end = () => {
    setEndTime(Date.now())
  }

  const getTimeSpent = () => {
    if (!startTime || !endTime)
      return undefined
    const timeSpent = Math.floor((endTime - startTime) / 1000)
    return timeSpent
  }

  return {
    startTime,
    endTime,
    start,
    end,
    getTimeSpent,
  }
}
