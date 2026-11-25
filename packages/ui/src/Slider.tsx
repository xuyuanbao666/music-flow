interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  className?: string
  label?: string
}
export function Slider({ value, min = 0, max = 1, step = 0.01, onChange, className = '', label = '滑块' }: SliderProps) {
  const safeMax = Number.isFinite(max) && max > min ? max : min + 1
  const safeValue = Number.isFinite(value) ? Math.min(safeMax, Math.max(min, value)) : min
  return <input type="range" aria-label={label} min={min} max={safeMax} step={step} value={safeValue}
    onChange={event => onChange(event.currentTarget.valueAsNumber)}
    className={'music-slider min-w-0 cursor-pointer accent-blue-500 ' + className} />
}
