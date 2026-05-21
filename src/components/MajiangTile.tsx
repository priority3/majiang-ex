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
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '七',
  8: '八',
  9: '九',
}

// 筒子的圆点排列位置 (传统布局 - 更大更清晰)
const TONG_POSITIONS: Record<number, { x: number, y: number }[]> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 50, y: 30 }, { x: 50, y: 70 }],
  3: [{ x: 50, y: 25 }, { x: 35, y: 65 }, { x: 65, y: 65 }],
  4: [{ x: 35, y: 30 }, { x: 65, y: 30 }, { x: 35, y: 70 }, { x: 65, y: 70 }],
  5: [{ x: 35, y: 25 }, { x: 65, y: 25 }, { x: 50, y: 50 }, { x: 35, y: 75 }, { x: 65, y: 75 }],
  6: [{ x: 35, y: 22 }, { x: 65, y: 22 }, { x: 35, y: 50 }, { x: 65, y: 50 }, { x: 35, y: 78 }, { x: 65, y: 78 }],
  7: [{ x: 50, y: 18 }, { x: 30, y: 38 }, { x: 70, y: 38 }, { x: 50, y: 55 }, { x: 30, y: 72 }, { x: 70, y: 72 }, { x: 50, y: 88 }],
  8: [{ x: 30, y: 18 }, { x: 70, y: 18 }, { x: 30, y: 42 }, { x: 70, y: 42 }, { x: 30, y: 68 }, { x: 70, y: 68 }, { x: 50, y: 85 }, { x: 50, y: 30 }],
  9: [{ x: 30, y: 18 }, { x: 50, y: 18 }, { x: 70, y: 18 }, { x: 30, y: 50 }, { x: 50, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 82 }, { x: 50, y: 82 }, { x: 70, y: 82 }],
}

// 筒子圆点组件 - 更大更清晰
function TongDot({ count, small }: { count: number, small: boolean }) {
  const positions = TONG_POSITIONS[count] || TONG_POSITIONS[1]
  const dotSize = small ? 8 : count <= 3 ? 12 : count <= 6 ? 10 : 8

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
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              background: 'radial-gradient(circle at 35% 35%, #e3f2fd 0%, #42a5f5 30%, #1e88e5 60%, #1565c0 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8), inset 0 -1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.3)',
              border: '1px solid #0d47a1',
            }}
          />
        </div>
      ))}
    </div>
  )
}

// 条子竹子组件 - 更清晰的竹子图案
function TiaoBar({ count, small }: { count: number, small: boolean }) {
  // 传统条子布局
  const getBarPositions = (n: number) => {
    const positions: { x: number, y: number }[] = []
    if (n <= 3) {
      // 单排
      for (let i = 0; i < n; i++) {
        positions.push({ x: 20 + i * 30, y: 50 })
      }
    }
    else if (n <= 6) {
      // 两排
      const topCount = Math.ceil(n / 2)
      for (let i = 0; i < topCount; i++) {
        positions.push({ x: 20 + i * 30, y: 32 })
      }
      for (let i = 0; i < n - topCount; i++) {
        positions.push({ x: 20 + i * 30, y: 68 })
      }
    }
    else {
      // 三排
      const rows = [3, 3, n - 6]
      let y = 20
      for (const row of rows) {
        for (let i = 0; i < row; i++) {
          positions.push({ x: 20 + i * 30, y })
        }
        y += 30
      }
    }
    return positions
  }

  const bars = getBarPositions(count)
  const barWidth = small ? 4 : 5
  const barHeight = small ? 16 : count <= 3 ? 24 : count <= 6 ? 20 : 16

  return (
    <div className="relative w-full h-full">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${bar.x}%`,
            top: `${bar.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* 竹子主体 */}
          <div
            style={{
              width: `${barWidth}px`,
              height: `${barHeight}px`,
              background: 'linear-gradient(90deg, #1b5e20 0%, #388e3c 20%, #66bb6a 50%, #388e3c 80%, #1b5e20 100%)',
              borderRadius: '2px',
              boxShadow: 'inset 0 0 3px rgba(255,255,255,0.4), 0 1px 3px rgba(0,0,0,0.3)',
              position: 'relative',
              border: '1px solid #0d3311',
            }}
          >
            {/* 竹节 */}
            {!small && (
              <>
                <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: '1px', background: '#0d3311' }} />
                <div style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: '1px', background: '#0d3311' }} />
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
  const wanTextClass = small ? 'text-lg' : 'text-2xl'
  const typeTextClass = small ? 'text-[9px]' : 'text-xs'

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
        border: '#b71c1c',
        text: '#b71c1c',
        bg: 'linear-gradient(145deg, #fff5f5 0%, #ffebee 50%, #ffcdd2 100%)',
      }
    : tile.type === '条'
      ? {
          border: '#1b5e20',
          text: '#1b5e20',
          bg: 'linear-gradient(145deg, #f1f8e9 0%, #e8f5e9 50%, #c8e6c9 100%)',
        }
      : {
          border: '#0d47a1',
          text: '#0d47a1',
          bg: 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
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
            background: colorTheme.bg,
            borderColor: colorTheme.border,
          }}
        >
          {/* 装饰圆点 - 四角 */}
          <div className="tile-dot" style={{ top: '3px', left: '3px', background: colorTheme.border, opacity: 0.3 }} />
          <div className="tile-dot" style={{ top: '3px', right: '3px', background: colorTheme.border, opacity: 0.3 }} />
          <div className="tile-dot" style={{ bottom: '3px', left: '3px', background: colorTheme.border, opacity: 0.3 }} />
          <div className="tile-dot" style={{ bottom: '3px', right: '3px', background: colorTheme.border, opacity: 0.3 }} />

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
                      <TiaoBar count={tile.value} small={small} />
                    </div>
                  )
                : (
                    <div className="w-full h-full p-1">
                      <TongDot count={tile.value} small={small} />
                    </div>
                  )}
          </div>
        </div>
      </div>
    </div>
  )
}
