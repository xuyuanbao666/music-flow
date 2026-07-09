import { useCallback, useRef, useState } from 'react'
import { Button } from '@music-flow/ui'
import { usePlayerStore } from '../../store'
import { DEFAULT_PRESETS, EqualizerBand } from '@music-flow/core'

function VerticalSlider({
  value,
  min = -12,
  max = 12,
  step = 1,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const calculateValue = useCallback(
    (clientY: number) => {
      if (!sliderRef.current) return value
      const rect = sliderRef.current.getBoundingClientRect()
      const percent = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      return Math.round((min + percent * (max - min)) / step) * step
    },
    [min, max, step, value],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      onChange(calculateValue(e.clientY))

      const handleMouseMove = (e: MouseEvent) => {
        onChange(calculateValue(e.clientY))
      }
      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [calculateValue, onChange],
  )

  const percent = ((value - min) / (max - min)) * 100

  return (
    <div
      ref={sliderRef}
      className="relative w-2 h-32 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer group"
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute bottom-0 w-full bg-blue-500 rounded-full transition-colors group-hover:bg-blue-400"
        style={{ height: `${percent}%` }}
      />
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
          isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'
        }`}
        style={{ bottom: `${percent}%`, marginBottom: '-8px' }}
      />
    </div>
  )
}

export function EqualizerPanel() {
  const { setEqualizer, loadEqualizerPreset } = usePlayerStore()
  const [selectedPreset, setSelectedPreset] = useState('flat')
  const [bands, setBands] = useState<EqualizerBand[]>(DEFAULT_PRESETS[0].bands)

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId)
    loadEqualizerPreset(presetId)
    const preset = DEFAULT_PRESETS.find((p) => p.id === presetId)
    if (preset) setBands(preset.bands)
  }

  const handleBandChange = (index: number, gain: number) => {
    const newBands = [...bands]
    newBands[index] = { ...newBands[index], gain }
    setBands(newBands)
    setEqualizer(newBands)
  }

  const frequencies = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K']

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
      <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">均衡器</h3>

      <div className="flex gap-2 mb-6 flex-wrap">
        {DEFAULT_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant={selectedPreset === preset.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handlePresetChange(preset.id)}
          >
            {preset.name}
          </Button>
        ))}
      </div>

      <div className="flex gap-3 justify-between">
        {bands.map((band, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {band.gain > 0 ? '+' : ''}
              {band.gain}dB
            </span>
            <VerticalSlider
              value={band.gain}
              min={-12}
              max={12}
              step={1}
              onChange={(value) => handleBandChange(i, value)}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">{frequencies[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
