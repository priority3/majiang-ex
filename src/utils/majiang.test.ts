import { describe, it, expect } from 'vitest';
import { generateTingTiles, getTingInfo } from './majiang';
import type { Tile } from '../types';

describe('麻将听牌生成器', () => {
  it('应该能生成一个有效的听牌序列', () => {
    const tingTiles = generateTingTiles();
    console.log('生成的听牌序列：', tingTiles.map((tile: Tile) => `${tile.value}${tile.type}`).join(' '));
    
    // 验证生成的牌数量是否正确
    expect(tingTiles).toHaveLength(13);
    
    // 验证是否只有两种花色
    const types = new Set(tingTiles.map(t => t.type));
    expect(types.size).toBe(2);
    
    // 验证是否真的听牌
    const tingInfo = getTingInfo(tingTiles);
    console.log('可以听的牌：', tingInfo.map((tile: Tile) => `${tile.value}${tile.type}`).join(' '));
    expect(tingInfo.length).toBeGreaterThan(0);
  });

  it('应该能成功生成听牌序列', () => {
    const testCount = 100;
    let successCount = 0;
    
    for (let i = 0; i < testCount; i++) {
      try {
        generateTingTiles();
        successCount++;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // 忽略错误
      }
    }
    
    const successRate = (successCount / testCount) * 100;
    console.log(`测试次数：${testCount}`);
    console.log(`成功次数：${successCount}`);
    console.log(`成功率：${successRate.toFixed(2)}%`);
    
    // 期望成功率至少达到50%
    expect(successRate).toBeGreaterThan(50);
  });
}); 
