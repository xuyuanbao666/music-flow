import { Slider } from '@music-flow/ui'
import { usePlayerStore } from '../../store'

export function ProgressBar() {
  const { state, seek } = usePlayerStore()
  const { currentTime, duration } = state
  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs.toString().padStart(2, '0')}` }
  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
      <Slider value={currentTime} min={0} max={duration || 100} onChange={seek} className="flex-1" />
      <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
    </div>
  )
}
