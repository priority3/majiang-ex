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

type SuitMeta = {
  border: string
  text: string
  deep: string
  light: string
  bg: string
  watermark: string
  label: string
}

const SUIT_META: Record<Tile['type'], SuitMeta> = {
  万: {
    border: '#a61d24',
    text: '#b71c1c',
    deep: '#7f1118',
    light: '#fff4f4',
    bg: 'linear-gradient(145deg, #fff9f9 0%, #fde8e8 48%, #f6c5c9 100%)',
    watermark: '萬',
    label: '万',
  },
  条: {
    border: '#1b5e20',
    text: '#1b5e20',
    deep: '#0f5d2b',
    light: '#f4fbf2',
    bg: 'linear-gradient(145deg, #f8fff6 0%, #edf8e9 48%, #cfe8c8 100%)',
    watermark: '竹',
    label: '条',
  },
  筒: {
    border: '#0d47a1',
    text: '#0d47a1',
    deep: '#0a3b86',
    light: '#f2f8ff',
    bg: 'linear-gradient(145deg, #f7fbff 0%, #e3f0ff 48%, #b9d5ff 100%)',
    watermark: '筒',
    label: '筒',
  },
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

type DotPosition = { x: number, y: number }

const TONG_LAYOUT: Record<number, DotPosition[]> = {
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

const TIAO_LAYOUT: Record<number, DotPosition[]> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 50, y: 28 }, { x: 50, y: 72 }],
  3: [{ x: 50, y: 20 }, { x: 34, y: 67 }, { x: 66, y: 67 }],
  4: [{ x: 34, y: 28 }, { x: 66, y: 28 }, { x: 34, y: 72 }, { x: 66, y: 72 }],
  5: [{ x: 34, y: 22 }, { x: 66, y: 22 }, { x: 50, y: 50 }, { x: 34, y: 78 }, { x: 66, y: 78 }],
  6: [{ x: 34, y: 18 }, { x: 66, y: 18 }, { x: 34, y: 50 }, { x: 66, y: 50 }, { x: 34, y: 82 }, { x: 66, y: 82 }],
  7: [{ x: 50, y: 16 }, { x: 30, y: 36 }, { x: 70, y: 36 }, { x: 50, y: 54 }, { x: 30, y: 73 }, { x: 70, y: 73 }, { x: 50, y: 90 }],
  8: [{ x: 30, y: 16 }, { x: 70, y: 16 }, { x: 30, y: 39 }, { x: 70, y: 39 }, { x: 30, y: 64 }, { x: 70, y: 64 }, { x: 50, y: 84 }, { x: 50, y: 29 }],
  9: [{ x: 30, y: 16 }, { x: 50, y: 16 }, { x: 70, y: 16 }, { x: 30, y: 50 }, { x: 50, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 84 }, { x: 50, y: 84 }, { x: 70, y: 84 }],
}

function CornerMark({
  color,
  position,
}: {
  color: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}) {
  const map = {
    'top-left': 'top-1 left-1',
    'top-right': 'top-1 right-1',
    'bottom-left': 'bottom-1 left-1',
    'bottom-right': 'bottom-1 right-1',
  }[position]

  return <span className={`absolute ${map} text-[7px] font-black leading-none opacity-55`} style={{ color }}>●</span>
}

function Watermark({ meta, small }: { meta: SuitMeta, small: boolean }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      style={{
        fontSize: small ? '36px' : '48px',
        color: meta.border,
        opacity: 0.07,
        fontWeight: 900,
        letterSpacing: 0,
      }}
    >
      {meta.watermark}
    </div>
  )
}

function WanArtwork({ value, small, meta }: { value: number, small: boolean, meta: SuitMeta }) {
  const numberSize = small ? 24 : 34
  const suitSize = small ? 10 : 12

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <Watermark meta={meta} small={small} />
      <div
        className="absolute inset-y-2 left-2 w-[1px] rounded-full opacity-55"
        style={{ background: `linear-gradient(${meta.border}, ${meta.light})` }}
      />
      <div
        className="absolute inset-y-2 right-2 w-[1px] rounded-full opacity-55"
        style={{ background: `linear-gradient(${meta.light}, ${meta.border})` }}
      />
      <div className="relative flex flex-col items-center justify-center">
        <span
          className="font-black leading-none"
          style={{
            fontSize: `${numberSize}px`,
            color: meta.text,
            textShadow: '0 1px 0 rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.14)',
          }}
        >
          {WAN_CHARS[value]}
        </span>
        <span
          className="font-bold leading-none"
          style={{
            fontSize: `${suitSize}px`,
            color: meta.deep,
            letterSpacing: 0,
          }}
        >
          万
        </span>
      </div>
    </div>
  )
}

function BambooStem({
  x,
  y,
  small,
  meta,
}: {
  x: number
  y: number
  small: boolean
  meta: SuitMeta
}) {
  const stemWidth = small ? 6 : 7
  const stemHeight = small ? 26 : 30
  const leafWidth = small ? 10 : 12
  const leafHeight = small ? 3 : 4

  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="relative rounded-full"
        style={{
          width: `${stemWidth}px`,
          height: `${stemHeight}px`,
          background: 'linear-gradient(90deg, #0f5f26 0%, #3c9a45 18%, #7ad37c 48%, #329040 78%, #124b1d 100%)',
          border: `1px solid ${meta.border}`,
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.45), 0 1px 2px rgba(0,0,0,0.18)',
        }}
      >
        <div className="absolute left-0 right-0 top-[31%] h-px bg-black/30" />
        <div className="absolute left-0 right-0 top-[66%] h-px bg-black/30" />
      </div>
      <div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '18%',
          width: `${leafWidth}px`,
          height: `${leafHeight}px`,
          background: 'linear-gradient(90deg, rgba(214,255,214,0.15), #92db8b)',
          transform: 'translate(-50%, -50%) rotate(-28deg)',
          opacity: 0.92,
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          left: '50%',
          top: '82%',
          width: `${leafWidth}px`,
          height: `${leafHeight}px`,
          background: 'linear-gradient(90deg, #92db8b, rgba(214,255,214,0.15))',
          transform: 'translate(-50%, -50%) rotate(28deg)',
          opacity: 0.92,
        }}
      />
    </div>
  )
}

function BambooArtwork({ count, small, meta }: { count: number, small: boolean, meta: SuitMeta }) {
  const positions = TIAO_LAYOUT[count] || TIAO_LAYOUT[1]

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Watermark meta={meta} small={small} />
      {positions.map((pos, index) => (
        <BambooStem
          key={index}
          x={pos.x}
          y={pos.y}
          small={small}
          meta={meta}
        />
      ))}
    </div>
  )
}

function TongDot({
  count,
  small,
  meta,
}: {
  count: number
  small: boolean
  meta: SuitMeta
}) {
  const positions = TONG_LAYOUT[count] || TONG_LAYOUT[1]
  const dotSize = small ? 9 : count <= 3 ? 13 : count <= 6 ? 11 : 10

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Watermark meta={meta} small={small} />
      {positions.map((pos, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              background: 'radial-gradient(circle at 35% 35%, #f8fdff 0%, #9ad0ff 30%, #419df4 62%, #0d4ba3 100%)',
              border: `1px solid ${meta.border}`,
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.85), inset 0 -1px 2px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.28)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              left: `${dotSize * 0.18}px`,
              top: `${dotSize * 0.18}px`,
              width: `${dotSize * 0.22}px`,
              height: `${dotSize * 0.22}px`,
              background: 'rgba(255,255,255,0.6)',
              filter: 'blur(0.2px)',
            }}
          />
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
  const stateClass = selected
    ? 'selected'
    : correct
      ? 'correct'
      : error
        ? 'error'
        : ''

  const meta = SUIT_META[tile.type]

  return (
    <div
      className={`mahjong-tile ${sizeClass} ${stateClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="mahjong-tile-inner">
        <div
          className="tile-face"
          style={{
            background: meta.bg,
            borderColor: meta.border,
          }}
        >
          <CornerMark color={meta.border} position="top-left" />
          <CornerMark color={meta.border} position="top-right" />
          <CornerMark color={meta.border} position="bottom-left" />
          <CornerMark color={meta.border} position="bottom-right" />

          <div className="relative flex items-center justify-center w-full h-full px-1">
            {tile.type === '万'
              ? (
                  <WanArtwork value={tile.value} small={small} meta={meta} />
                )
              : tile.type === '条'
                ? (
                    <BambooArtwork count={tile.value} small={small} meta={meta} />
                  )
                : (
                    <TongDot count={tile.value} small={small} meta={meta} />
                  )}

            <div
              className="absolute right-1 bottom-1 rounded-full px-1.5 py-0.5 font-black leading-none shadow-sm"
              style={{
                fontSize: small ? '7px' : '8px',
                color: meta.deep,
                background: 'rgba(255,255,255,0.72)',
                border: `1px solid ${meta.border}33`,
              }}
            >
              {meta.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
