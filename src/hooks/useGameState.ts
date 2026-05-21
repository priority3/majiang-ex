import type { GameMode } from '../components/GameModeSelector'
import { useCallback, useState } from 'react'

interface ModeStats {
  games: number
  wins: number
  totalScore: number
  bestStreak: number
}

interface GameState {
  score: number
  combo: number
  maxCombo: number
  level: number
  exp: number
  totalGames: number
  totalWins: number
  currentMode: GameMode
  modeStats: Record<GameMode, ModeStats>
}

const EXP_PER_LEVEL = 100

const initialModeStats: Record<GameMode, ModeStats> = {
  ting: { games: 0, wins: 0, totalScore: 0, bestStreak: 0 },
  discard: { games: 0, wins: 0, totalScore: 0, bestStreak: 0 },
  pattern: { games: 0, wins: 0, totalScore: 0, bestStreak: 0 },
  speed: { games: 0, wins: 0, totalScore: 0, bestStreak: 0 },
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('majiang-stats')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          ...parsed,
          modeStats: { ...initialModeStats, ...parsed.modeStats },
        }
      }
      catch {
        // ignore
      }
    }
    return {
      score: 0,
      combo: 0,
      maxCombo: 0,
      level: 1,
      exp: 0,
      totalGames: 0,
      totalWins: 0,
      currentMode: 'ting',
      modeStats: initialModeStats,
    }
  })

  const saveStats = (state: GameState) => {
    localStorage.setItem('majiang-stats', JSON.stringify({
      score: state.score,
      level: state.level,
      exp: state.exp,
      totalGames: state.totalGames,
      totalWins: state.totalWins,
      modeStats: state.modeStats,
    }))
  }

  const addScore = useCallback((points: number, isWin: boolean, mode: GameMode) => {
    setGameState((prev) => {
      const newCombo = isWin ? prev.combo + 1 : 0
      const comboBonus = Math.floor(points * (newCombo > 1 ? (newCombo - 1) * 0.1 : 0))
      const totalPoints = points + comboBonus
      const newExp = prev.exp + totalPoints
      const newLevel = Math.floor(newExp / EXP_PER_LEVEL) + 1

      const prevModeStats = prev.modeStats[mode]
      const newModeStats: ModeStats = {
        games: prevModeStats.games + 1,
        wins: prevModeStats.wins + (isWin ? 1 : 0),
        totalScore: prevModeStats.totalScore + totalPoints,
        bestStreak: isWin
          ? Math.max(prevModeStats.bestStreak, newCombo)
          : prevModeStats.bestStreak,
      }

      const newState: GameState = {
        ...prev,
        score: prev.score + totalPoints,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo),
        exp: newExp,
        level: newLevel,
        totalGames: prev.totalGames + 1,
        totalWins: prev.totalWins + (isWin ? 1 : 0),
        modeStats: { ...prev.modeStats, [mode]: newModeStats },
      }

      saveStats(newState)
      return newState
    })
  }, [])

  const setMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({ ...prev, currentMode: mode }))
  }, [])

  const resetCombo = useCallback(() => {
    setGameState(prev => ({ ...prev, combo: 0 }))
  }, [])

  const getModeAccuracy = useCallback((mode: GameMode) => {
    const stats = gameState.modeStats[mode]
    if (stats.games === 0)
      return 0
    return Math.round((stats.wins / stats.games) * 100)
  }, [gameState.modeStats])

  const getOverallAccuracy = useCallback(() => {
    if (gameState.totalGames === 0)
      return 0
    return Math.round((gameState.totalWins / gameState.totalGames) * 100)
  }, [gameState.totalGames, gameState.totalWins])

  const resetStats = useCallback(() => {
    const freshState: GameState = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      level: 1,
      exp: 0,
      totalGames: 0,
      totalWins: 0,
      currentMode: 'ting',
      modeStats: initialModeStats,
    }
    setGameState(freshState)
    localStorage.removeItem('majiang-stats')
  }, [])

  return {
    ...gameState,
    addScore,
    setMode,
    resetCombo,
    getModeAccuracy,
    getOverallAccuracy,
    resetStats,
  }
}
