import { Track, PlayerState, EqualizerBand, EqualizerPreset } from '../types'

export interface AudioEngine {
  play(source: Track | string): Promise<void>
  pause(): void
  resume(): void
  stop(): void
  seek(position: number): void
  setVolume(volume: number): void
  setMute(muted: boolean): void
  setEqualizer(bands: EqualizerBand[]): void
  loadPreset(preset: EqualizerPreset): void
  getEqualizerPresets(): EqualizerPreset[]
  getState(): PlayerState
  onStateChange(callback: (state: PlayerState) => void): () => void
  destroy(): void
}
