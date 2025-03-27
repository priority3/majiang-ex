import type { Tile } from '../types'
import { useState } from 'react'

export function useTileSelection() {
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([])
  const [showFeedback, setShowFeedback] = useState(false)

  const isSelected = (tile: Tile) => {
    return selectedTiles.some(t =>
      t.type === tile.type && t.value === tile.value,
    )
  }

  const handleTileSelect = (tile: Tile) => {
    setShowFeedback(false)
    if (showFeedback) {
      setSelectedTiles([tile])
      return
    }

    if (isSelected(tile)) {
      setSelectedTiles(selectedTiles.filter(t =>
        !(t.type === tile.type && t.value === tile.value),
      ))
    }
    else {
      setSelectedTiles([...selectedTiles, tile])
    }
  }

  const handleConfirm = () => {
    if (selectedTiles.length === 0)
      return

    setShowFeedback(true)
    return Date.now()
  }

  const resetSelection = () => {
    setSelectedTiles([])
    setShowFeedback(false)
  }

  return {
    selectedTiles,
    showFeedback,
    isSelected,
    handleTileSelect,
    handleConfirm,
    resetSelection,
  }
}
