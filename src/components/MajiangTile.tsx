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

// 万子的传统中文数字
const WAN_CHARS: Record<number, string> = {
  1: '一', 2: '二', 3: '三', 4: '四', 5: '五',
  6: '六', 7: '七', 8: '八', 9: '九',
}

// 筒子的圆点排列位置 (传统布局)
const TONG_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 50, y: 28 }, { x: 50, y: 72 }],
  3: [{ x: 50, y: 22 }, { x: 35, y: 62 }, { x: 65, y: 62 }],
  4: [{ x: 35, y: 28 }, { x: 65, y: 28 }, { x: 35, y: 72 }, { x: 65, y: 72 }],
  5: [{ x: 35, y: 22 }, { x: 65, y: 22 }, { x: 50, y: 50 }, { x: 35, y: 78 }, { x: 65, y: 78 }],
  6: [{ x: 35, y: 22 }, { x: 65, y: 22 }, { x: 35, y: 50 }, { x: 65, y: 50 }, { x: 35, y: 78 }, { x: 65, y: 78 }],
  7: [{ x: 50, y: 18 }, { x: 32, y: 38 }, { x: 68, y: 38 }, { x: 50, y: 55 }, { x: 32, y: 72 }, { x: 68, y: 72 }, { x: 50, y: 88 }],
  8: [{ x: 32, y: 18 }, { x: 68, y: 18 }, { x: 32, y: 42 }, { x: 68, y: 42 }, { x: 32, y: 68 }, { x: 68, y: 68 }, { x: 50, y: 85 }, { x: 50, y: 30 }],
  9: [{ x: 32, y: 18 }, { x: 50, y: 18 }, { x: 68, y: 18 }, { x: 32, y: 50 }, { x: 50, y: 50 }, { x: 68, y: 50 }, { x: 32, y: 82 }, { x: 50, y: 82 }, { x: 68, y: 82 }],
}

// 筒子圆点组件
function TongDot({ count }: { count: number }) {
  const positions = TONG_POSITIONS[count] || TONG_POSITIONS[1]
  return (
    <div className="relative w-full h-full">
      {positions.map((pos, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* 外圈 */}
          <div
            className="rounded-full"
            style={{
              width: count <= 3 ? '14px' : count <= 6 ? '11px' : '9px',
              height: count <= 3 ? '14px' : count <= 6 ? '11px' : '9px',
              background: 'radial-gradient(circle at 35% 35%, #81d4fa 0%, #29b6f6 40%, #0288d1 70%, #01579b 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </div>
      ))}
    </div>
  )
}

// 条子竹子组件
function TiaoBar({ count }: { count: number }) {
  // 传统条子布局
  const getBarPositions = (n: number) => {
    const positions: { x: number; y: number; rotate: number }[] = []
    if (n <= 3) {
      // 横排
      for (let i = 0; i < n; i++) {
        positions.push({ x: 25 + i * 25, y: 50, rotate: 0 })
      }
    }
    else if (n <= 6) {
      // 两排
      const topCount = Math.ceil(n / 2)
      for (let i = 0; i < topCount; i++) {
        positions.push({ x: 25 + i * 25, y: 32, rotate: 0 })
      }
      for (let i = 0; i < n - topCount; i++) {
        positions.push({ x: 25 + i * 25, y: 68, rotate: 0 })
      }
    }
    else {
      // 三排
      const rows = [3, 3, n - 6]
      let y = 20
      for (const row of rows) {
        for (let i = 0; i < row; i++) {
          positions.push({ x: 25 + i * 25, y, rotate: 0 })
        }
        y += 30
      }
    }
    return positions
  }

  const bars = getBarPositions(count)

  return (
    <div className="relative w-full h-full">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${bar.x}%`,
            top: `${bar.y}%`,
            transform: `translate(-50%, -50%) rotate(${bar.rotate}deg)`,
          }}
        >
          {/* 竹子主体 */}
          <div
            style={{
              width: count <= 3 ? '6px' : count <= 6 ? '5px' : '4px',
              height: count <= 3 ? '28px' : count <= 6 ? '22px' : '18px',
              background: 'linear-gradient(90deg, #1b5e20 0%, #388e3c 25%, #4caf50 50%, #388e3c 75%, #1b5e20 100%)',
              borderRadius: '2px',
              boxShadow: 'inset 0 0 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* 竹节 */}
            {count <= 6 && (
              <>
                <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: '1px', background: '#0d3311' }} />
                <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '1px', background: '#0d3311' }} />
              </>
            )}
          </div>
        </div>
      ))}
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
  const sizeClass = small ? 'w-10 h-14' : 'w-14 h-20'
  const wanTextClass = small ? 'text-lg' : 'text-xl'
  const typeTextClass = small ? 'text-[9px]' : 'text-[10px]'

  const stateClass = selected
    ? 'selected'
    : correct
      ? 'correct'
      : error
        ? 'error'
        : ''

  // 根据花色设置不同的颜色主题
  const colorTheme = tile.type === '万'
    ? {
        border: '#c62828',
        text: '#b71c1c',
        shadow: 'rgba(183, 28, 28, 0.3)',
      }
    : tile.type === '条'
      ? {
          border: '#2e7d32',
          text: '#1b5e20',
          shadow: 'rgba(27, 94, 32, 0.3)',
        }
      : {
          border: '#1565c0',
          text: '#0d47a1',
          shadow: 'rgba(13, 71, 161, 0.3)',
        }

  return (
    <div
      className={`mahjong-tile ${sizeClass} ${stateClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="mahjong-tile-inner">
        <div
          className="tile-face"
          style={{
            borderColor: colorTheme.border,
          }}
        >
          {/* 装饰圆点 - 四角 */}
          <div className="tile-dot" style={{ top: '3px', left: '3px' }} />
          <div className="tile-dot" style={{ top: '3px', right: '3px' }} />
          <div className="tile-dot" style={{ bottom: '3px', left: '3px' }} />
          <div className="tile-dot" style={{ bottom: '3px', right: '3px' }} />

          {/* 牌面内容 */}
          <div className="flex flex-col items-center justify-center h-full">
            {tile.type === '万'
              ? (
                  <>
                    <span
                      className={`${wanTextClass} font-bold`}
                      style={{ color: colorTheme.text }}
                    >
                      {WAN_CHARS[tile.value]}
                    </span>
                    <span
                      className={`${typeTextClass} font-bold -mt-0.5`}
                      style={{ color: colorTheme.text }}
                    >
                      万
                    </span>
                  </>
                )
              : tile.type === '条'
                ? (
                    <div className="w-full h-full p-1">
                      <TiaoBar count={tile.value} />
                    </div>
                  )
                : (
                    <div className="w-full h-full p-1">
                      <TongDot count={tile.value} />
                    </div>
                  )}
          </div>
        </div>
      </div>
    </div>
  )
}
