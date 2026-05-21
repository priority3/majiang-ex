import type { Tile, TileType } from '../types'
import { useState } from 'react'
import { VALID_TYPES } from '../types'
import { generateRandomHand, getTingInfo, sortTilesByMahjongOrder } from '../utils/majiang'

export function useHandTiles() {
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
  const [isSortedHandTile, setIsSortedHandTile] = useState(false)

  const generateNewHand = () => {
    const newHandInfo = generateRandomHand()
    setHandInfo(newHandInfo)
    // 只有听牌时才计算听牌信息
    if (newHandInfo.isTing) {
      setTingTiles(getTingInfo(newHandInfo.hand))
    }
    else {
      setTingTiles([])
    }
    setIsSortedHandTile(false)
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
    setIsSortedHandTile(!isSortedHandTile)
  }

  return {
    handInfo,
    tingTiles,
    isSortedHandTile,
    generateNewHand,
    toggleHandTilesOrder,
  }
}
