import type { Tile } from '../types'

export function useAnswerValidation(tingTiles: Tile[], selectedTiles: Tile[]) {
  const errorTitles: Tile[] = []
  const correctTitles: Tile[] = []
  const missingTiles: Tile[] = []

  // 检查选错的牌
  selectedTiles.forEach((tile) => {
    const isCorrect = tingTiles.some(
      tingTile => tingTile.type === tile.type && tingTile.value === tile.value,
    )
    if (isCorrect) {
      correctTitles.push(tile)
    }
    else {
      errorTitles.push(tile)
    }
  })

  // 检查漏选的牌
  tingTiles.forEach((tingTile) => {
    const isSelected = selectedTiles.some(
      selectedTile =>
        selectedTile.type === tingTile.type && selectedTile.value === tingTile.value,
    )
    if (!isSelected) {
      missingTiles.push(tingTile)
    }
  })

  const isCorrect = errorTitles.length === 0 && missingTiles.length === 0

  return {
    errorTitles,
    correctTitles,
    missingTiles,
    isCorrect,
  }
}
