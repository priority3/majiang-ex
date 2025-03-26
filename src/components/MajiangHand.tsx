import { useState } from 'react';
import { Tile } from '../types';
import { MajiangTile } from './MajiangTile';
import { generateTingTiles, getTingInfo } from '../utils/majiang';

export function MajiangHand() {
  const [hand, setHand] = useState<Tile[]>([]);
  const [tingTiles, setTingTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);

  const generateNewHand = () => {
    try {
      const newHand = generateTingTiles();
      setHand(newHand);
      setTingTiles(getTingInfo(newHand));
      setSelectedTile(null);
    } catch (e) {
      console.error('Failed to generate ting tiles:', e);
    }
  };

  const isSelected = (tile: Tile) => {
    return selectedTile !== null && 
           selectedTile.type === tile.type && 
           selectedTile.value === tile.value;
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <button
        className="w-full mb-8 px-6 py-4 bg-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg active:transform active:scale-95"
        onClick={generateNewHand}
      >
        生成新的听牌序列
      </button>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">手牌</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-gray-50 rounded-xl shadow-inner">
          {hand.map((tile, index) => (
            <MajiangTile
              key={`${tile.type}${tile.value}-${index}`}
              tile={tile}
              selected={isSelected(tile)}
              onClick={() => setSelectedTile(tile)}
            />
          ))}
        </div>
      </div>

      {tingTiles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">可以听的牌</h2>
          <div className="flex flex-wrap gap-4 p-6 bg-gray-50 rounded-xl shadow-inner">
            {tingTiles.map((tile, index) => (
              <MajiangTile
                key={`ting-${tile.type}${tile.value}-${index}`}
                tile={tile}
                selected={isSelected(tile)}
                onClick={() => setSelectedTile(tile)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
