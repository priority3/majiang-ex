import type { Tile, TileType } from '../types'
import { useState } from 'react'
import { VALID_TYPES } from '../types'
import { generateTingTiles, getTingInfo } from '../utils/majiang'

export function useHandTiles() {
  const [handInfo, setHandInfo] = useState<{
    hand: Tile[]
    excludeType: TileType
  }>({
    hand: [],
    excludeType: VALID_TYPES[0],
  })
  const [tingTiles, setTingTiles] = useState<Tile[]>([])
  const [isSortedHandTile, setIsSortedHandTile] = useState(false)

  const generateNewHand = () => {
    const newHandInfo = generateTingTiles()
    setHandInfo(newHandInfo)
    setTingTiles(getTingInfo(newHandInfo.hand))
    setIsSortedHandTile(false)
    return Date.now()
  }

  const toggleHandTilesOrder = () => {
    if (isSortedHandTile) {
      // 乱序：随机打乱手牌顺序
      const shuffledHand = [...handInfo.hand].sort(() => Math.random() - 0.5)
      setHandInfo({ ...handInfo, hand: shuffledHand })
    }
    else {
      // 排序：按照条筒万顺序，从小到大排列
      const sortedHand = [...handInfo.hand].sort((a, b) => {
        // 首先按照类型排序（条筒万）
        const typeOrder = { 条: 0, 筒: 1, 万: 2 }
        const typeCompare = typeOrder[a.type] - typeOrder[b.type]
        if (typeCompare !== 0)
          return typeCompare
        // 同类型按照数字大小排序
        return a.value - b.value
      })
      setHandInfo({ ...handInfo, hand: sortedHand })
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
