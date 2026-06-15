// 麻将牌的类型定义
export type TileType = '万' | '条' | '筒'

// 所有有效的牌类型
export const VALID_TYPES: TileType[] = ['万', '条', '筒']

// 麻将牌的结构
export interface Tile {
  type: TileType
  value: number // 1-9
}

// 胡牌拆解后的一组牌
export interface MeldGroup {
  // sequence=顺子, triplet=刻子, pair=将（雀头）, qiduiPair=七对中的对子
  kind: 'sequence' | 'triplet' | 'pair' | 'qiduiPair'
  tiles: Tile[]
}

// 听牌结构：一种「固定面子 + 搭子」组合及其可胡的牌
export interface TingPattern {
  melds: MeldGroup[] // 已成型的固定面子/将
  wait: Tile[] // 等待成型的搭子（缺一张的部分）
  winsOn: Tile[] // 这种组合下可以胡的牌
}
