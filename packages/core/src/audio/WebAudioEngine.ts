import { Track, PlayerState, RepeatMode, EqualizerBand, EqualizerPreset } from '../types'
import { AudioEngine } from './AudioEngine'
import { Equalizer, DEFAULT_PRESETS } from './Equalizer'

export class WebAudioEngine implements AudioEngine {
  private audio: HTMLAudioElement
  private audioContext: AudioContext | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private equalizerNodes: BiquadFilterNode[] = []
  private analyserNode: AnalyserNode | null = null
  private equalizer: Equalizer
  private state: PlayerState
  private listeners: Set<(state: PlayerState) => void> = new Set()
  private onTrackEndCallback: (() => void) | null = null

  constructor() {
    this.audio = new Audio()
    this.equalizer = new Equalizer()
    this.state = {
      status: 'stopped',
      currentTrack: null,
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      repeatMode: 'none',
      shuffle: false,
    }
    this.setupAudioEvents()
  }

  private setupAudioEvents(): void {
    this.audio.addEventListener('play', () => this.updateState({ status: 'playing' }))
    this.audio.addEventListener('pause', () => this.updateState({ status: 'paused' }))
    this.audio.addEventListener('ended', () => this.handleTrackEnd())
    this.audio.addEventListener('loadedmetadata', () => this.updateState({ duration: this.audio.duration }))
    this.audio.addEventListener('timeupdate', () => this.updateState({ currentTime: this.audio.currentTime }))
    this.audio.addEventListener('error', () => this.updateState({ status: 'error' }))
  }

  private async initAudioContext(): Promise<void> {
    if (this.audioContext) return
    this.audioContext = new AudioContext()
    this.sourceNode = this.audioContext.createMediaElementSource(this.audio)
    this.gainNode = this.audioContext.createGain()
    this.analyserNode = this.audioContext.createAnalyser()
    this.equalizerNodes = this.createEqualizerNodes()

    let lastNode: AudioNode = this.sourceNode
    this.equalizerNodes.forEach(eq => { lastNode.connect(eq); lastNode = eq })
    lastNode.connect(this.gainNode)
    this.gainNode.connect(this.analyserNode)
    this.analyserNode.connect(this.audioContext.destination)
    this.applyEqualizer()
  }

  private createEqualizerNodes(): BiquadFilterNode[] {
    if (!this.audioContext) return []
    return this.equalizer.getBands().map((band) => {
      const filter = this.audioContext!.createBiquadFilter()
      filter.type = band.type
      filter.frequency.value = band.frequency
      filter.gain.value = band.gain
      filter.Q.value = 1
      return filter
    })
  }

  private applyEqualizer(): void {
    const bands = this.equalizer.getBands()
    this.equalizerNodes.forEach((node, i) => { if (bands[i]) node.gain.value = bands[i].gain })
  }

  private updateState(partial: Partial<PlayerState>): void {
    this.state = { ...this.state, ...partial }
    this.listeners.forEach(listener => listener(this.state))
  }

  private handleTrackEnd(): void {
    if (this.state.repeatMode === 'one') {
      this.audio.currentTime = 0
      this.audio.play()
    } else {
      this.updateState({ status: 'stopped', currentTime: 0 })
      if (this.onTrackEndCallback) {
        this.onTrackEndCallback()
      }
    }
  }

  onTrackEnd(callback: () => void): void {
    this.onTrackEndCallback = callback
  }

  setRepeatMode(mode: RepeatMode): void {
    this.state = { ...this.state, repeatMode: mode }
  }

  setShuffle(shuffle: boolean): void {
    this.state = { ...this.state, shuffle }
  }

  async play(source: Track | string): Promise<void> {
    await this.initAudioContext()
    if (this.audioContext!.state === 'suspended') await this.audioContext!.resume()
    const url = typeof source === 'string' ? source : source.sourceId
    this.audio.src = url
    const track: Track = typeof source === 'string'
      ? { id: url, title: url.split('/').pop() || 'Unknown', artist: 'Unknown', album: 'Unknown', duration: 0, source: 'url', sourceId: url, metadata: { format: 'mp3' } }
      : source
    this.updateState({ status: 'loading', currentTrack: track, currentTime: 0 })
    await this.audio.play()
  }

  pause(): void { this.audio.pause() }

  resume(): void { this.audio.play() }

  stop(): void {
    this.audio.pause()
    this.audio.currentTime = 0
    this.updateState({ status: 'stopped', currentTime: 0 })
  }

  seek(position: number): void {
    this.audio.currentTime = Math.max(0, Math.min(position, this.state.duration))
  }

  setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume))
    this.audio.volume = v
    if (this.gainNode) this.gainNode.gain.value = v
    this.updateState({ volume: v })
  }

  setMute(muted: boolean): void {
    this.audio.muted = muted
    this.updateState({ muted })
  }

  setEqualizer(bands: EqualizerBand[]): void {
    this.equalizer.setBands(bands)
    this.applyEqualizer()
  }

  loadPreset(preset: EqualizerPreset): void {
    this.equalizer.loadPreset(preset)
    this.applyEqualizer()
  }

  getEqualizerPresets(): EqualizerPreset[] {
    return DEFAULT_PRESETS
  }

  getState(): PlayerState {
    return { ...this.state }
  }

  onStateChange(callback: (state: PlayerState) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyserNode
  }

  destroy(): void {
    this.audio.pause()
    this.audio.src = ''
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.listeners.clear()
  }
}
