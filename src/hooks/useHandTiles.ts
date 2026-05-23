import type { Tile, TileType } from '../types'
import { useState } from 'react'
import { VALID_TYPES } from '../types'
import { generateRandomHand, getTingInfo, sortTilesByMahjongOrder } from '../utils/majiang'

const SORT_PREF_KEY = 'majiang-sort-pref'

function loadSortPref(): boolean {
  try {
    return localStorage.getItem(SORT_PREF_KEY) === 'true'
  }
  catch {
    return false
  }
}

function saveSortPref(sorted: boolean) {
  try {
    localStorage.setItem(SORT_PREF_KEY, String(sorted))
  }
  catch {}
}

export function useHandTiles(forceShuffle = false) {
  const [handInfo, setHandInfo] = useState<{
    hand: Tile[]
    excludeType: TileType
    isTing: boolean
  }>({
    hand: [],
    excludeType: VALID_TYPES[0],
    isTing: false,
  })
  const [tingTiles, setTingTiles] = useState<Tile[]>([])
  const [isSortedHandTile, setIsSortedHandTile] = useState(() => {
    // 困难模式强制乱序，不读取偏好
    if (forceShuffle) return false
    return loadSortPref()
  })

  const generateNewHand = () => {
    const newHandInfo = generateRandomHand()
    // 困难模式强制乱序
    if (forceShuffle || !isSortedHandTile) {
      newHandInfo.hand = [...newHandInfo.hand].sort(() => Math.random() - 0.5)
    }
    else {
      newHandInfo.hand = sortTilesByMahjongOrder(newHandInfo.hand)
    }
    setHandInfo(newHandInfo)
    if (newHandInfo.isTing) {
      setTingTiles(getTingInfo(newHandInfo.hand))
    }
    else {
      setTingTiles([])
    }
    // 困难模式始终为乱序状态
    if (forceShuffle) {
      setIsSortedHandTile(false)
    }
    return Date.now()
  }

  const toggleHandTilesOrder = () => {
    // 困难模式不允许排序
    if (forceShuffle) return

    if (isSortedHandTile) {
      const shuffledHand = [...handInfo.hand].sort(() => Math.random() - 0.5)
      setHandInfo({ ...handInfo, hand: shuffledHand })
    }
    else {
      setHandInfo({ ...handInfo, hand: sortTilesByMahjongOrder(handInfo.hand) })
    }
    const next = !isSortedHandTile
    setIsSortedHandTile(next)
    saveSortPref(next)
  }

  return {
    handInfo,
    tingTiles,
    isSortedHandTile,
    generateNewHand,
    toggleHandTilesOrder,
  }
}
