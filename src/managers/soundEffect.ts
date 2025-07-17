import breakFinishedSoundEffect from '@/assets/break-finished.mp3'

const SOUND_EFFECTS = {
  BREAK_FINISHED: 'breakFinished',
} as const

type SoundEffectType = (typeof SOUND_EFFECTS)[keyof typeof SOUND_EFFECTS]

type SoundEffectConfig = {
  [SOUND_EFFECTS.BREAK_FINISHED]: string
}

class SoundEffectManager {
  private sounds: Map<SoundEffectType, HTMLAudioElement> = new Map()
  private volume: number = 1

  constructor(config: SoundEffectConfig) {
    Object.entries(config).forEach(([type, src]) => {
      this.sounds.set(type as SoundEffectType, this.createAudio({ src }))
    })

    this.preloadAll()
  }

  private createAudio({ src }: { src: string }): HTMLAudioElement {
    const audio = new Audio(src)
    audio.volume = this.volume
    return audio
  }

  play({ type }: { type: SoundEffectType }) {
    const sound = this.sounds.get(type)
    if (sound) {
      sound.currentTime = 0
      sound.play().catch((e) => console.error('Error playing sound effect:', e))
    }
  }

  setVolume({ volume }: { volume: number }) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach((sound) => (sound.volume = this.volume))
  }

  getVolume(): number {
    return this.volume
  }

  preloadAll() {
    this.sounds.forEach((sound) => sound.load())
  }
}

let soundEffectManager: SoundEffectManager | null = null

function getSoundEffectManager(): SoundEffectManager {
  if (typeof window !== 'undefined' && !soundEffectManager) {
    soundEffectManager = new SoundEffectManager({
      [SOUND_EFFECTS.BREAK_FINISHED]: breakFinishedSoundEffect,
    })
  }

  if (!soundEffectManager) {
    throw new Error('Sound effect manager not initialized')
  }

  return soundEffectManager
}

export { getSoundEffectManager, SOUND_EFFECTS }
