import { useState } from 'react'

export function useFeedback() {
  const [showAnswer, setShowAnswer] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const resetFeedback = () => {
    setShowAnswer(false)
    setShowHint(false)
  }

  return {
    showAnswer,
    showHint,
    setShowAnswer,
    setShowHint,
    resetFeedback,
  }
}
