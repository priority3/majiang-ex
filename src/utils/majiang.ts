import type { Tile, TileType } from '../types'
import { VALID_TYPES } from '../types'

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
