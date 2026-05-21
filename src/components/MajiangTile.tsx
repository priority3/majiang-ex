import type { Tile } from '../types'

interface MajiangTileProps {
  tile: Tile
  onClick?: () => void
  selected?: boolean
  correct?: boolean
  error?: boolean
  disabled?: boolean
  small?: boolean
}

// 牌面字符映射 - 使用更传统的麻将符号
const TILE_CHARS: Record<string, { value: string, type: string }> = {
  '1万': { value: '一', type: '万' },
  '2万': { value: '二', type: '万' },
  '3万': { value: '三', type: '万' },
  '4万': { value: '四', type: '万' },
  '5万': { value: '五', type: '万' },
  '6万': { value: '六', type: '万' },
  '7万': { value: '七', type: '万' },
  '8万': { value: '八', type: '万' },
  '9万': { value: '九', type: '万' },
  '1条': { value: '①', type: '条' },
  '2条': { value: '②', type: '条' },
  '3条': { value: '③', type: '条' },
  '4条': { value: '④', type: '条' },
  '5条': { value: '⑤', type: '条' },
  '6条': { value: '⑥', type: '条' },
  '7条': { value: '⑦', type: '条' },
  '8条': { value: '⑧', type: '条' },
  '9条': { value: '⑨', type: '条' },
  '1筒': { value: '⊙', type: '筒' },
  '2筒': { value: '⊙', type: '筒' },
  '3筒': { value: '⊙', type: '筒' },
  '4筒': { value: '⊙', type: '筒' },
  '5筒': { value: '⊙', type: '筒' },
  '6筒': { value: '⊙', type: '筒' },
  '7筒': { value: '⊙', type: '筒' },
  '8筒': { value: '⊙', type: '筒' },
  '9筒': { value: '⊙', type: '筒' },
}

// 筒子图案渲染
function TongPattern({ count }: { count: number }) {
  const positions = getTongPositions(count)
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            background: 'radial-gradient(circle, #4fc3f7 0%, #0288d1 60%, #01579b 100%)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      ))}
    </div>
  )
}

function getTongPositions(count: number): { x: number, y: number }[] {
  const positions: Record<number, { x: number, y: number }[]> = {
    1: [{ x: 50, y: 50 }],
    2: [{ x: 50, y: 30 }, { x: 50, y: 70 }],
    3: [{ x: 50, y: 25 }, { x: 35, y: 65 }, { x: 65, y: 65 }],
    4: [{ x: 35, y: 30 }, { x: 65, y: 30 }, { x: 35, y: 70 }, { x: 65, y: 70 }],
    5: [{ x: 35, y: 25 }, { x: 65, y: 25 }, { x: 50, y: 50 }, { x: 35, y: 75 }, { x: 65, y: 75 }],
    6: [{ x: 35, y: 22 }, { x: 65, y: 22 }, { x: 35, y: 50 }, { x: 65, y: 50 }, { x: 35, y: 78 }, { x: 65, y: 78 }],
    7: [{ x: 50, y: 20 }, { x: 30, y: 40 }, { x: 70, y: 40 }, { x: 50, y: 55 }, { x: 30, y: 75 }, { x: 70, y: 75 }, { x: 50, y: 85 }],
    8: [{ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 30, y: 45 }, { x: 70, y: 45 }, { x: 30, y: 70 }, { x: 70, y: 70 }, { x: 50, y: 88 }, { x: 50, y: 35 }],
    9: [{ x: 30, y: 20 }, { x: 50, y: 20 }, { x: 70, y: 20 }, { x: 30, y: 50 }, { x: 50, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 80 }, { x: 50, y: 80 }, { x: 70, y: 80 }],
  }
  return positions[count] || positions[1]
}

// 条子图案渲染
function TiaoPattern({ count }: { count: number }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="flex flex-wrap justify-center items-center gap-0.5 p-1">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="relative"
            style={{
              width: count <= 3 ? '8px' : count <= 6 ? '6px' : '5px',
              height: count <= 3 ? '24px' : count <= 6 ? '20px' : '16px',
            }}
          >
            {/* 竹子主体 */}
            <div
              className="absolute inset-0 rounded-sm"
              style={{
                background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 30%, #66bb6a 50%, #4caf50 70%, #2e7d32 100%)',
                boxShadow: 'inset 0 0 2px rgba(255,255,255,0.4)',
              }}
            />
            {/* 竹节 */}
            {count <= 3 && (
              <>
                <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-green-800 opacity-50" />
                <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-green-800 opacity-50" />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function MajiangTile({
  tile,
  onClick,
  selected = false,
  correct = false,
  error = false,
  disabled = false,
  small = false,
}: MajiangTileProps) {
  const tileKey = `${tile.value}${tile.type}`
  const tileChars = TILE_CHARS[tileKey] || { value: String(tile.value), type: tile.type }

  const sizeClass = small ? 'w-10 h-14' : 'w-14 h-20'
  const textClass = small ? 'text-xl' : 'text-2xl'
  const typeTextClass = small ? 'text-xs' : 'text-sm'

  const stateClass = selected
    ? 'selected'
    : correct
      ? 'correct'
      : error
        ? 'error'
        : ''

  const tileTypeClass = tile.type === '万'
    ? 'tile-wan'
    : tile.type === '条'
      ? 'tile-tiao'
      : 'tile-tong'

  return (
    <div
      className={`mahjong-tile ${sizeClass} ${stateClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="mahjong-tile-inner">
        <div className={`tile-face ${tileTypeClass}`}>
          {/* 装饰圆点 */}
          <div className="tile-dot" style={{ top: '4px', left: '4px' }} />
          <div className="tile-dot" style={{ top: '4px', right: '4px' }} />
          <div className="tile-dot" style={{ bottom: '4px', left: '4px' }} />
          <div className="tile-dot" style={{ bottom: '4px', right: '4px' }} />

          {/* 牌面内容 */}
          {tile.type === '筒'
            ? (
                <>
                  <TongPattern count={tile.value} />
                  <span className={`absolute bottom-1 ${typeTextClass} font-bold opacity-60`}>
                    {tile.type}
                  </span>
                </>
              )
            : tile.type === '条'
              ? (
                  <>
                    <TiaoPattern count={tile.value} />
                    <span className={`absolute bottom-1 ${typeTextClass} font-bold opacity-60`}>
                      {tile.type}
                    </span>
                  </>
                )
              : (
                  <>
                    <span className={`${textClass} font-bold`}>{tileChars.value}</span>
                    <span className={`${typeTextClass} font-bold -mt-1`}>{tileChars.type}</span>
                  </>
                )}
        </div>
      </div>
    </div>
  )
}
