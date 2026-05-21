import type { Tile, TileType } from '../types'
import { VALID_TYPES } from '../types'

export function compareTilesByMahjongOrder(a: Tile, b: Tile): number {
  const typeOrder = { 万: 0, 筒: 1, 条: 2 }
  const typeCompare = typeOrder[a.type] - typeOrder[b.type]
  if (typeCompare !== 0)
    return typeCompare
  return a.value - b.value
}

export function sortTilesByMahjongOrder(tiles: Tile[]): Tile[] {
  return [...tiles].sort(compareTilesByMahjongOrder)
}

// 生成一副完整的麻将牌（缺一门）
export function generateFullTiles(excludeType: TileType): Tile[] {
  const tiles: Tile[] = []
  const types: TileType[] = VALID_TYPES.filter(t => t !== excludeType)

  for (const type of types) {
    for (let value = 1; value <= 9; value++) {
      for (let i = 0; i < 4; i++) {
        tiles.push({ type, value })
      }
    }
  }

  return tiles
}

// 检查是否听牌
function isTing(tiles: Tile[], excludeType: TileType): boolean {
  const types = new Set(tiles.map(t => t.type))
  if (types.size !== 2 || types.has(excludeType))
    return false

  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.type !== b.type)
      return a.type.localeCompare(b.type)
    return a.value - b.value
  })

  const remainingTiles = generateFullTiles(excludeType)
  const shuffledTiles = [...remainingTiles].sort(() => Math.random() - 0.5)

  for (const tile of shuffledTiles) {
    const testTiles = [...sortedTiles, tile]
    if (canHu(testTiles)) {
      return true
    }
  }
  return false
}

// 检查是否可以胡牌
function canHu(tiles: Tile[]): boolean {
  if (tiles.length !== 14)
    return false

  if (isQiDui(tiles))
    return true

  return isNormalHu(tiles)
}

// 检查七对子
function isQiDui(tiles: Tile[]): boolean {
  if (tiles.length !== 14)
    return false

  const pairs = new Map<string, number>()
  for (const tile of tiles) {
    const key = `${tile.type}${tile.value}`
    pairs.set(key, (pairs.get(key) || 0) + 1)
  }

  return Array.from(pairs.values()).every(count => count === 2)
}

// 检查普通胡牌
function isNormalHu(tiles: Tile[]): boolean {
  if (tiles.length !== 14)
    return false

  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.type !== b.type)
      return a.type.localeCompare(b.type)
    return a.value - b.value
  })

  for (let i = 0; i < sortedTiles.length - 1; i++) {
    if (isSameTile(sortedTiles[i], sortedTiles[i + 1])) {
      const remainingTiles = [...sortedTiles]
      remainingTiles.splice(i, 2)
      if (canFormTripletsAndSequences(remainingTiles)) {
        return true
      }
    }
  }

  return false
}

// 检查两张牌是否相同
function isSameTile(a: Tile, b: Tile): boolean {
  return a.type === b.type && a.value === b.value
}

// 检查剩余牌是否可以组成刻子和顺子
function canFormTripletsAndSequences(tiles: Tile[]): boolean {
  if (tiles.length === 0)
    return true

  if (tiles.length >= 3 && isSameTile(tiles[0], tiles[1]) && isSameTile(tiles[1], tiles[2])) {
    const remaining = tiles.slice(3)
    if (canFormTripletsAndSequences(remaining))
      return true
  }

  if (tiles.length >= 3) {
    const first = tiles[0]
    const second = { type: first.type, value: first.value + 1 }
    const third = { type: first.type, value: first.value + 2 }

    const secondIndex = tiles.findIndex(t => isSameTile(t, second))
    const thirdIndex = tiles.findIndex(t => isSameTile(t, third))

    if (secondIndex !== -1 && thirdIndex !== -1) {
      const remaining = [...tiles]
      remaining.splice(Math.max(secondIndex, thirdIndex), 1)
      remaining.splice(Math.min(secondIndex, thirdIndex), 1)
      remaining.splice(0, 1)
      if (canFormTripletsAndSequences(remaining))
        return true
    }
  }

  return false
}

// 生成听牌序列（保证听牌）
export function generateTingTiles(): {
  hand: Tile[]
  excludeType: TileType
  isTing: boolean
} {
  const maxAttempts = 1000
  let attempts = 0
  let hand: Tile[] = []
  let excludeType: TileType = VALID_TYPES[0]
  while (attempts < maxAttempts) {
    hand = []
    excludeType = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]

    const tiles = generateFullTiles(excludeType)

    for (let i = 0; i < 13; i++) {
      const index = Math.floor(Math.random() * tiles.length)
      hand.push(tiles.splice(index, 1)[0])
    }

    if (isTing(hand, excludeType)) {
      return {
        hand,
        excludeType,
        isTing: true,
      }
    }

    attempts++
  }

  return {
    hand,
    excludeType,
    isTing: false,
  }
}

// 生成可能听牌也可能不听牌的序列（听牌概率约60%）
export function generateRandomHand(): {
  hand: Tile[]
  excludeType: TileType
  isTing: boolean
} {
  // 60%概率生成听牌序列，40%概率生成不听牌序列
  if (Math.random() < 0.6) {
    return generateTingTiles()
  }

  // 生成不听牌的序列
  const maxAttempts = 100
  let attempts = 0

  while (attempts < maxAttempts) {
    const excludeType = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
    const tiles = generateFullTiles(excludeType)
    const hand: Tile[] = []

    for (let i = 0; i < 13; i++) {
      const index = Math.floor(Math.random() * tiles.length)
      hand.push(tiles.splice(index, 1)[0])
    }

    // 检查是否不听牌
    if (!isTing(hand, excludeType)) {
      return {
        hand,
        excludeType,
        isTing: false,
      }
    }

    attempts++
  }

  // 如果都失败，返回一个听牌的序列
  return generateTingTiles()
}

// 获取听牌信息
export function getTingInfo(tiles: Tile[]): Tile[] {
  const tingTiles: Tile[] = []
  const types = new Set(tiles.map(t => t.type))

  if (types.size !== 2)
    return tingTiles

  const excludeType = VALID_TYPES.find(t => !types.has(t))!
  const remainingTiles = generateFullTiles(excludeType)
  const shuffledTiles = [...remainingTiles].sort(() => Math.random() - 0.5)

  for (const tile of shuffledTiles) {
    const testTiles = [...tiles, tile]
    if (canHu(testTiles) && !tingTiles.some(t => isSameTile(t, tile))) {
      tingTiles.push(tile)
    }
  }

  return tingTiles
}

// 计算手牌能胡几张牌（返回不同的牌的数量）
export function countTingTiles(hand: Tile[]): number {
  if (hand.length !== 13)
    return 0

  const types = new Set(hand.map(t => t.type))
  if (types.size > 2)
    return 0

  const excludeType = types.size === 1
    ? VALID_TYPES.find(t => !types.has(t))!
    : VALID_TYPES.find(t => !types.has(t))!

  const remainingTiles = generateFullTiles(excludeType)
  const seen = new Set<string>()
  let count = 0

  for (const tile of remainingTiles) {
    const key = `${tile.type}${tile.value}`
    if (seen.has(key))
      continue
    seen.add(key)

    const testTiles = [...hand, tile]
    if (canHu(testTiles)) {
      count++
    }
  }

  return count
}

// 生成特定牌型的有效手牌
export function generatePatternHand(patternId: string): Tile[] {
  switch (patternId) {
    case 'qiduizi': {
      const used = new Set<string>()
      const hand: Tile[] = []
      while (hand.length < 14) {
        const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
        const value = Math.floor(Math.random() * 9) + 1
        const key = `${type}${value}`
        if (!used.has(key)) {
          hand.push({ type, value }, { type, value })
          used.add(key)
        }
      }
      return hand
    }
    case 'pengpenghu': {
      const hand: Tile[] = []
      for (let i = 0; i < 4; i++) {
        const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
        const value = Math.floor(Math.random() * 9) + 1
        hand.push({ type, value }, { type, value }, { type, value })
      }
      const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
      const value = Math.floor(Math.random() * 9) + 1
      hand.push({ type, value }, { type, value })
      return hand
    }
    case 'qingyise': {
      const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
      const hand: Tile[] = []
      // 生成有效清一色：4组面子+1对将
      const values: number[] = []
      for (let i = 0; i < 4; i++) {
        const v = Math.floor(Math.random() * 7) + 1
        values.push(v, v + 1, v + 2)
      }
      const pairValue = Math.floor(Math.random() * 9) + 1
      values.push(pairValue, pairValue)
      for (const v of values) {
        hand.push({ type, value: v })
      }
      return hand
    }
    case 'hunyise': {
      const mainType = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
      const otherType = VALID_TYPES.filter(t => t !== mainType)[0]
      const hand: Tile[] = []
      // 主花色：3组面子
      for (let i = 0; i < 3; i++) {
        const v = Math.floor(Math.random() * 7) + 1
        hand.push({ type: mainType, value: v })
        hand.push({ type: mainType, value: v + 1 })
        hand.push({ type: mainType, value: v + 2 })
      }
      // 主花色对子
      const pv = Math.floor(Math.random() * 9) + 1
      hand.push({ type: mainType, value: pv })
      hand.push({ type: mainType, value: pv })
      // 其他花色刻子
      const ov = Math.floor(Math.random() * 9) + 1
      hand.push({ type: otherType, value: ov })
      hand.push({ type: otherType, value: ov })
      hand.push({ type: otherType, value: ov })
      return hand
    }
    default: {
      // 平胡：普通牌型，两种花色
      const type1 = VALID_TYPES[0]
      const type2 = VALID_TYPES[1]
      const hand: Tile[] = []
      // 4组面子
      for (let i = 0; i < 2; i++) {
        const v = Math.floor(Math.random() * 7) + 1
        hand.push({ type: type1, value: v })
        hand.push({ type: type1, value: v + 1 })
        hand.push({ type: type1, value: v + 2 })
      }
      for (let i = 0; i < 2; i++) {
        const v = Math.floor(Math.random() * 7) + 1
        hand.push({ type: type2, value: v })
        hand.push({ type: type2, value: v + 1 })
        hand.push({ type: type2, value: v + 2 })
      }
      // 对子
      const pv = Math.floor(Math.random() * 9) + 1
      hand.push({ type: type1, value: pv })
      hand.push({ type: type1, value: pv })
      return hand
    }
  }
}

export function generateSingleSequenceTiles(excludeType: TileType) {
  const singleSequenceTiles: Tile[] = []
  const tiles = generateFullTiles(excludeType)
  for (const tile of tiles) {
    if (singleSequenceTiles.some(t => t.value === tile.value && t.type === tile.type)) {
      continue
    }
    singleSequenceTiles.push(tile)
  }
  return singleSequenceTiles
}
