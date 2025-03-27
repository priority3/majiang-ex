import type { Tile } from '../types'

export function useAnswerValidation(tingTiles: Tile[], selectedTiles: Tile[]) {
  const errorTitles: Tile[] = []
  const correctTitles: Tile[] = []

  selectedTiles.forEach((t) => {
    if (tingTiles.some(tingTile => tingTile.type === t.type && tingTile.value === t.value)) {
      correctTitles.push(t)
    }
    else {
      errorTitles.push(t)
    }
  })

  const isCorrect = correctTitles.length === tingTiles.length && errorTitles.length === 0

  return {
    errorTitles,
    correctTitles,
    isCorrect,
  }
}
