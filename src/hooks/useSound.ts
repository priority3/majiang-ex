import { useCallback, useRef } from 'react'

// 音效类型
type SoundType = 'click' | 'correct' | 'wrong' | 'combo' | 'levelup' | 'newgame'

// 使用 Web Audio API 生成音效（无需外部音频文件）
export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    }
    catch {
      // 静默处理音频错误
    }
  }, [getAudioContext])

  const playSound = useCallback((sound: SoundType) => {
    switch (sound) {
      case 'click':
        // 清脆的点击声
        playTone(800, 0.1, 'sine', 0.2)
        setTimeout(() => playTone(1200, 0.05, 'sine', 0.15), 50)
        break

      case 'correct':
        // 正确音效 - 上升音阶
        playTone(523, 0.15, 'sine', 0.3)
        setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 100)
        setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200)
        break

      case 'wrong':
        // 错误音效 - 下降音
        playTone(400, 0.2, 'sawtooth', 0.2)
        setTimeout(() => playTone(300, 0.3, 'sawtooth', 0.15), 150)
        break

      case 'combo':
        // 连击音效 - 快速上升
        playTone(880, 0.1, 'sine', 0.25)
        setTimeout(() => playTone(1100, 0.1, 'sine', 0.25), 60)
        setTimeout(() => playTone(1320, 0.15, 'sine', 0.3), 120)
        break

      case 'levelup': {
        // 升级音效 - 华丽上升
        const notes = [523, 659, 784, 1047]
        notes.forEach((freq, i) => {
          setTimeout(() => playTone(freq, 0.2, 'sine', 0.3), i * 100)
        })
        break
      }

      case 'newgame':
        // 新游戏音效
        playTone(440, 0.1, 'triangle', 0.2)
        setTimeout(() => playTone(554, 0.1, 'triangle', 0.2), 80)
        setTimeout(() => playTone(659, 0.15, 'triangle', 0.25), 160)
        break
    }
  }, [playTone])

  return { playSound }
}
