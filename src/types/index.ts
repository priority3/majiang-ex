// 麻将牌的类型定义
export type TileType = '万' | '条' | '筒';

// 所有有效的牌类型
export const VALID_TYPES: TileType[] = ['万', '条', '筒'];

// 麻将牌的结构
export interface Tile {
  type: TileType;
  value: number;  // 1-9
}
