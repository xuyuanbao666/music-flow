import { EqualizerBand, EqualizerPreset } from '../types'

export const DEFAULT_PRESETS: EqualizerPreset[] = [
  {
    id: 'flat',
    name: '平坦',
    bands: [
      { frequency: 32, gain: 0, type: 'lowshelf' },
      { frequency: 64, gain: 0, type: 'peaking' },
      { frequency: 125, gain: 0, type: 'peaking' },
      { frequency: 250, gain: 0, type: 'peaking' },
      { frequency: 500, gain: 0, type: 'peaking' },
      { frequency: 1000, gain: 0, type: 'peaking' },
      { frequency: 2000, gain: 0, type: 'peaking' },
      { frequency: 4000, gain: 0, type: 'peaking' },
      { frequency: 8000, gain: 0, type: 'peaking' },
      { frequency: 16000, gain: 0, type: 'highshelf' },
    ],
  },
  {
    id: 'bass-boost',
    name: '低音增强',
    bands: [
      { frequency: 32, gain: 6, type: 'lowshelf' },
      { frequency: 64, gain: 5, type: 'peaking' },
      { frequency: 125, gain: 4, type: 'peaking' },
      { frequency: 250, gain: 2, type: 'peaking' },
      { frequency: 500, gain: 0, type: 'peaking' },
      { frequency: 1000, gain: 0, type: 'peaking' },
      { frequency: 2000, gain: 0, type: 'peaking' },
      { frequency: 4000, gain: 0, type: 'peaking' },
      { frequency: 8000, gain: 0, type: 'peaking' },
      { frequency: 16000, gain: 0, type: 'highshelf' },
    ],
  },
  {
    id: 'vocal',
    name: '人声',
    bands: [
      { frequency: 32, gain: -2, type: 'lowshelf' },
      { frequency: 64, gain: -1, type: 'peaking' },
      { frequency: 125, gain: 0, type: 'peaking' },
      { frequency: 250, gain: 2, type: 'peaking' },
      { frequency: 500, gain: 4, type: 'peaking' },
      { frequency: 1000, gain: 4, type: 'peaking' },
      { frequency: 2000, gain: 3, type: 'peaking' },
      { frequency: 4000, gain: 1, type: 'peaking' },
      { frequency: 8000, gain: 0, type: 'peaking' },
      { frequency: 16000, gain: -1, type: 'highshelf' },
    ],
  },
]

export class Equalizer {
  private bands: EqualizerBand[]

  constructor(bands?: EqualizerBand[]) {
    this.bands = bands || DEFAULT_PRESETS[0].bands
  }

  getBands(): EqualizerBand[] {
    return [...this.bands]
  }

  setBands(bands: EqualizerBand[]): void {
    this.bands = bands.map(band => ({
      ...band,
      gain: Math.max(-12, Math.min(12, band.gain)),
    }))
  }

  loadPreset(preset: EqualizerPreset): void {
    this.setBands(preset.bands)
  }

  getPresets(): EqualizerPreset[] {
    return DEFAULT_PRESETS
  }
}
