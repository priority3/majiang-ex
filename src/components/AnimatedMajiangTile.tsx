import type { Tile } from '../types'
import { motion } from 'framer-motion'
import { MajiangTile } from './MajiangTile'

interface AnimatedMajiangTileProps {
  tile: Tile
  index: number
  selected?: boolean
  onClick?: () => void
  keyPrefix: string
}

export function AnimatedMajiangTile({
  tile,
  index,
  selected,
  onClick,
  keyPrefix,
}: AnimatedMajiangTileProps) {
  return (
    <motion.div
      key={`${keyPrefix}${tile.type}${tile.value}-${index}`}
      layout
      initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
    >
      <MajiangTile
        tile={tile}
        selected={selected}
        onClick={onClick}
      />
    </motion.div>
  )
}
