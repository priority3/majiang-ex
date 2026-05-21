import type { ComponentType, KeyboardEvent, SVGProps } from 'react'
import type { Tile } from '../types'
import {
  RegularMan1M,
  RegularMan2M,
  RegularMan3M,
  RegularMan4M,
  RegularMan5M,
  RegularMan6M,
  RegularMan7M,
  RegularMan8M,
  RegularMan9M,
  RegularPin1M,
  RegularPin2M,
  RegularPin3M,
  RegularPin4M,
  RegularPin5M,
  RegularPin6M,
  RegularPin7M,
  RegularPin8M,
  RegularPin9M,
  RegularSou1M,
  RegularSou2M,
  RegularSou3M,
  RegularSou4M,
  RegularSou5M,
  RegularSou6M,
  RegularSou7M,
  RegularSou8M,
  RegularSou9M,
} from 'riichi-mahjong-tiles'

interface MajiangTileProps {
  tile: Tile
  onClick?: () => void
  selected?: boolean
  correct?: boolean
  error?: boolean
  disabled?: boolean
  small?: boolean
}

type TileSvg = ComponentType<SVGProps<SVGSVGElement>>

const TILE_COMPONENTS: Record<Tile['type'], Record<number, TileSvg>> = {
  万: {
    1: RegularMan1M,
    2: RegularMan2M,
    3: RegularMan3M,
    4: RegularMan4M,
    5: RegularMan5M,
    6: RegularMan6M,
    7: RegularMan7M,
    8: RegularMan8M,
    9: RegularMan9M,
  },
  条: {
    1: RegularSou1M,
    2: RegularSou2M,
    3: RegularSou3M,
    4: RegularSou4M,
    5: RegularSou5M,
    6: RegularSou6M,
    7: RegularSou7M,
    8: RegularSou8M,
    9: RegularSou9M,
  },
  筒: {
    1: RegularPin1M,
    2: RegularPin2M,
    3: RegularPin3M,
    4: RegularPin4M,
    5: RegularPin5M,
    6: RegularPin6M,
    7: RegularPin7M,
    8: RegularPin8M,
    9: RegularPin9M,
  },
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
  const TileImage = TILE_COMPONENTS[tile.type][tile.value]
  const sizeClass = small ? 'w-10 h-14' : 'w-14 h-20'
  const stateClass = selected
    ? 'selected'
    : correct
      ? 'correct'
      : error
        ? 'error'
        : ''

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || disabled) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={`mahjong-tile ${sizeClass} ${stateClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-label={`${tile.value}${tile.type}`}
    >
      <div className="mahjong-tile-inner">
        <div className="tile-face">
          <TileImage className="tile-svg" aria-hidden="true" focusable="false" />
        </div>
      </div>
    </div>
  )
}
