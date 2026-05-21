import type { GameMode } from '../components/GameModeSelector'
import { useCallback, useState } from 'react'

interface GameState {
  score: number
  combo: number
  maxCombo: number
  level: number
  exp: number
  totalGames: number
  totalWins: number
  currentMode: GameMode
}

const EXP_PER_LEVEL = 100

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    level: 1,
    exp: 0,
    totalGames: 0,
    totalWins: 0,
    currentMode: 'ting',
  })

  const addScore = useCallback((points: number, isWin: boolean) => {
    setGameState((prev) => {
      const newCombo = isWin ? prev.combo + 1 : 0
      const comboBonus = Math.floor(points * (newCombo > 1 ? (newCombo - 1) * 0.1 : 0))
      const totalPoints = points + comboBonus
      const newExp = prev.exp + totalPoints
      const newLevel = Math.floor(newExp / EXP_PER_LEVEL) + 1

      return {
        ...prev,
        score: prev.score + totalPoints,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        exp: newExp,
        level: newLevel,
        totalGames: prev.totalGames + 1,
        totalWins: prev.totalWins + (isWin ? 1 : 0),
      }
    })
  }, [])

  const setMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({ ...prev, currentMode: mode }))
  }, [])

  const resetCombo = useCallback(() => {
    setGameState(prev => ({ ...prev, combo: 0 }))
  }, [])

  return {
    ...gameState,
    addScore,
    setMode,
    resetCombo,
  }
}
