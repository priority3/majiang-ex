import { Tile } from '../types';

interface MajiangTileProps {
  tile: Tile;
  onClick?: () => void;
  selected?: boolean;
}

export function MajiangTile({ tile, onClick, selected }: MajiangTileProps) {
  // 根据牌的类型设置不同的颜色
  const getTileColor = (type: string) => {
    switch (type) {
      case '万':
        return 'bg-red-50 text-red-700 border-red-300';
      case '条':
        return 'bg-green-50 text-green-700 border-green-300';
      case '筒':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  return (
    <div
      className={`
        relative w-14 h-20 rounded-lg shadow-md cursor-pointer
        flex items-center justify-center text-2xl font-bold
        border-2 transition-all duration-200
        hover:scale-110 hover:shadow-lg hover:border-opacity-100
        ${getTileColor(tile.type)}
        ${selected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}
      onClick={onClick}
    >
      {/* 装饰性圆点 */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-current opacity-30"></div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-current opacity-30"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-current opacity-30"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-current opacity-30"></div>
      
      {/* 牌面内容 */}
      <div className="flex flex-col items-center">
        <span className="text-3xl">{tile.value}</span>
        <span className="text-lg mt-1">{tile.type}</span>
      </div>
    </div>
  );
} 
