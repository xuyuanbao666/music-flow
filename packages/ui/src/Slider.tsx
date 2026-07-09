import React, { useCallback, useRef, useState } from 'react'

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
  className?: string
}

export function Slider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  className = '',
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const calculateValue = useCallback((clientX: number) => {
    if (!sliderRef.current) return value
    const rect = sliderRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round((min + percent * (max - min)) / step) * step
  }, [min, max, step, value])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    const newValue = calculateValue(e.clientX)
    onChange(newValue)

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = calculateValue(e.clientX)
      onChange(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [calculateValue, onChange])

  const percent = ((value - min) / (max - min)) * 100

  return (
    <div
      ref={sliderRef}
      className={`relative h-2 bg-gray-300 dark:bg-gray-700 rounded-full cursor-pointer group ${className}`}
      onMouseDown={handleMouseDown}
    >
      <div
        className="absolute h-full bg-blue-500 rounded-full transition-colors group-hover:bg-blue-400"
        style={{ width: `${percent}%` }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'
        }`}
        style={{ left: `${percent}%`, marginLeft: '-8px' }}
      />
    </div>
  )
}
