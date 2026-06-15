import type { Tile, TileType } from '../types'
import { useState } from 'react'
import { VALID_TYPES } from '../types'
import { generateQingyiseHand, generateRandomHand, getTingInfo, sortTilesByMahjongOrder } from '../utils/majiang'

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

// qingyise: 是否生成清一色（单花色）手牌，困难模式使用
export function useHandTiles(qingyise = false) {
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
  const [isSortedHandTile, setIsSortedHandTile] = useState(() => loadSortPref())

  const generateNewHand = () => {
    // 困难模式生成清一色（单花色）手牌，其余模式为缺一门手牌
    const newHandInfo = qingyise ? generateQingyiseHand() : generateRandomHand()
    // 按当前排序偏好决定手牌展示顺序
    if (isSortedHandTile) {
      newHandInfo.hand = sortTilesByMahjongOrder(newHandInfo.hand)
    }
    else {
      newHandInfo.hand = [...newHandInfo.hand].sort(() => Math.random() - 0.5)
    }
    setHandInfo(newHandInfo)
    if (newHandInfo.isTing) {
      setTingTiles(getTingInfo(newHandInfo.hand))
    }
    else {
      setTingTiles([])
    }
    return Date.now()
  }

  const toggleHandTilesOrder = () => {
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
