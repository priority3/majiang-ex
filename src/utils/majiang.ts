import type { MeldGroup, Tile, TileType, TingPattern } from '../types'
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

// 生成某一花色的完整牌池（1-9 各 4 张，共 36 张）
function generateQingyiseTilePool(type: TileType): Tile[] {
  const tiles: Tile[] = []
  for (let value = 1; value <= 9; value++) {
    for (let i = 0; i < 4; i++) {
      tiles.push({ type, value })
    }
  }
  return tiles
}

// 从给定花色牌池中随机抽 13 张
function drawQingyiseHand(type: TileType): Tile[] {
  const pool = generateQingyiseTilePool(type)
  const hand: Tile[] = []
  for (let i = 0; i < 13; i++) {
    const index = Math.floor(Math.random() * pool.length)
    hand.push(pool.splice(index, 1)[0])
  }
  return hand
}

// Reason: 清一色缺两门，excludeType 字段无实际意义，
// 返回任意一个非手牌花色作为占位，保持现有数据结构兼容
function pickPlaceholderExcludeType(type: TileType): TileType {
  return VALID_TYPES.find(t => t !== type)!
}

// 生成清一色听牌手牌（13 张同花色，保证听牌）
function generateQingyiseTingTiles(): {
  hand: Tile[]
  excludeType: TileType
  isTing: boolean
} {
  const maxAttempts = 1000
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
    const hand = drawQingyiseHand(type)
    if (getTingInfo(hand).length > 0) {
      return { hand, excludeType: pickPlaceholderExcludeType(type), isTing: true }
    }
  }

  // Reason: 随机抽牌极少数情况下命中不到听牌，用有效清一色胡牌去掉一张兜底
  const winning = generatePatternHand('qingyise')
  winning.splice(Math.floor(Math.random() * winning.length), 1)
  const fallbackType = winning[0].type
  return { hand: winning, excludeType: pickPlaceholderExcludeType(fallbackType), isTing: true }
}

// 生成清一色不听牌手牌（13 张同花色，保证不听牌）
function generateQingyiseNoTingTiles(): {
  hand: Tile[]
  excludeType: TileType
  isTing: boolean
} {
  const maxAttempts = 200
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const type = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)]
    const hand = drawQingyiseHand(type)
    if (getTingInfo(hand).length === 0) {
      return { hand, excludeType: pickPlaceholderExcludeType(type), isTing: false }
    }
  }

  // Reason: 极少数情况下抽不到不听牌组合，退化为听牌题，保证流程不阻塞
  return generateQingyiseTingTiles()
}

// 生成清一色练习手牌（困难模式专用）：约 60% 听牌、40% 不听牌
export function generateQingyiseHand(): {
  hand: Tile[]
  excludeType: TileType
  isTing: boolean
} {
  if (Math.random() < 0.6) {
    return generateQingyiseTingTiles()
  }
  return generateQingyiseNoTingTiles()
}

// 获取听牌信息
export function getTingInfo(tiles: Tile[]): Tile[] {
  const tingTiles: Tile[] = []
  const types = new Set(tiles.map(t => t.type))

  // 清一色（单花色）：只在本花色 1-9 范围内寻找可胡的牌
  if (types.size === 1) {
    const type = tiles[0].type
    for (let value = 1; value <= 9; value++) {
      const tile: Tile = { type, value }
      const testTiles = [...tiles, tile]
      if (canHu(testTiles) && !tingTiles.some(t => isSameTile(t, tile))) {
        tingTiles.push(tile)
      }
    }
    return tingTiles
  }

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

// 用于给牌/组合生成唯一键，便于去重与归并
function tileKey(t: Tile): string {
  const order = { 万: 0, 筒: 1, 条: 2 }
  return `${order[t.type]}-${t.value}`
}

function meldKey(g: MeldGroup): string {
  return `${g.kind}:${g.tiles.map(tileKey).join(',')}`
}

function meldsKey(groups: MeldGroup[]): string {
  return groups.map(meldKey).sort().join(';')
}

function tilesKey(tiles: Tile[]): string {
  return [...tiles].sort(compareTilesByMahjongOrder).map(tileKey).join(',')
}

// 枚举把（已排序的）牌拆成顺子/刻子的所有方案
function splitMeldsAll(tiles: Tile[]): MeldGroup[][] {
  if (tiles.length === 0)
    return [[]]

  const results: MeldGroup[][] = []
  const seen = new Set<string>()
  const pushUnique = (combo: MeldGroup[]) => {
    const key = meldsKey(combo)
    if (!seen.has(key)) {
      seen.add(key)
      results.push(combo)
    }
  }

  // 刻子（三张相同）
  if (tiles.length >= 3 && isSameTile(tiles[0], tiles[1]) && isSameTile(tiles[1], tiles[2])) {
    for (const rest of splitMeldsAll(tiles.slice(3)))
      pushUnique([{ kind: 'triplet', tiles: [tiles[0], tiles[1], tiles[2]] }, ...rest])
  }

  // 顺子（同花色三连）
  const first = tiles[0]
  const second = { type: first.type, value: first.value + 1 }
  const third = { type: first.type, value: first.value + 2 }
  const si = tiles.findIndex(t => isSameTile(t, second))
  const ti = tiles.findIndex(t => isSameTile(t, third))
  if (si !== -1 && ti !== -1) {
    const remaining = [...tiles]
    // Reason: 从大到小删除索引，避免删除后索引错位
    remaining.splice(Math.max(si, ti), 1)
    remaining.splice(Math.min(si, ti), 1)
    remaining.splice(0, 1)
    for (const rest of splitMeldsAll(remaining))
      pushUnique([{ kind: 'sequence', tiles: [first, { ...second }, { ...third }] }, ...rest])
  }

  return results
}

// 枚举 14 张胡牌的所有「将 + 4 面子」拆法（含七对）
function decomposeWinningHandAll(tiles: Tile[]): MeldGroup[][] {
  if (tiles.length !== 14)
    return []

  const sorted = sortTilesByMahjongOrder(tiles)
  const all: MeldGroup[][] = []
  const seen = new Set<string>()

  // 普通胡：枚举每一对作为将，剩余拆面子
  for (let i = 0; i < sorted.length - 1; i++) {
    if (!isSameTile(sorted[i], sorted[i + 1]))
      continue
    const rest = [...sorted]
    const pair: MeldGroup = { kind: 'pair', tiles: [rest[i], rest[i + 1]] }
    rest.splice(i, 2)
    for (const melds of splitMeldsAll(rest)) {
      const full = [pair, ...melds]
      const key = meldsKey(full)
      if (!seen.has(key)) {
        seen.add(key)
        all.push(full)
      }
    }
  }

  // 七对
  if (isQiDui(sorted)) {
    const groups: MeldGroup[] = []
    for (let i = 0; i < sorted.length; i += 2)
      groups.push({ kind: 'qiduiPair', tiles: [sorted[i], sorted[i + 1]] })
    const key = meldsKey(groups)
    if (!seen.has(key)) {
      seen.add(key)
      all.push(groups)
    }
  }

  return all
}

// 分析听牌结构：把 13 张手牌拆成所有「固定面子 + 搭子」组合，
// 并归并出每种组合可以胡的牌（例：固定 456条 + 搭子 23条 → 听 1条、4条）
export function analyzeTingPatterns(hand: Tile[], tingTiles: Tile[]): TingPattern[] {
  const map = new Map<string, TingPattern>()

  for (const win of tingTiles) {
    for (const decomp of decomposeWinningHandAll([...hand, win])) {
      // win 可能落在多个组里（如手里已有同点数的牌），逐组生成对应的「搭子+听」解读
      for (let gi = 0; gi < decomp.length; gi++) {
        const group = decomp[gi]
        const idx = group.tiles.findIndex(t => isSameTile(t, win))
        if (idx === -1)
          continue
        const wait = group.tiles.filter((_, k) => k !== idx) // 去掉胡的那张，剩下的即手中搭子
        const melds = decomp.filter((_, k) => k !== gi) // 其余为已成型的固定面子
        const key = `${meldsKey(melds)}#${tilesKey(wait)}`
        if (!map.has(key))
          map.set(key, { melds, wait, winsOn: [] })
        const entry = map.get(key)!
        if (!entry.winsOn.some(t => isSameTile(t, win)))
          entry.winsOn.push(win)
      }
    }
  }

  const meldOrder = { sequence: 0, triplet: 1, pair: 2, qiduiPair: 3 }
  const patterns = [...map.values()]
  for (const p of patterns) {
    p.winsOn.sort(compareTilesByMahjongOrder)
    p.melds.sort((a, b) =>
      meldOrder[a.kind] - meldOrder[b.kind] || compareTilesByMahjongOrder(a.tiles[0], b.tiles[0]))
  }
  // 固定面子多（搭子规整）的组合排前面，更易读
  patterns.sort((a, b) => b.melds.length - a.melds.length)
  return patterns
}

// 生成清一色可选牌（某花色 1-9 各一张，共 9 张），供选择区展示
export function generateQingyiseSelectionTiles(type: TileType): Tile[] {
  const tiles: Tile[] = []
  for (let value = 1; value <= 9; value++) {
    tiles.push({ type, value })
  }
  return tiles
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
