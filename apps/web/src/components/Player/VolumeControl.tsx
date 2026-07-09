import { Slider } from '@music-flow/ui'
import { usePlayerStore } from '../../store'

export function VolumeControl() {
  const { state, setVolume, setMute } = usePlayerStore()
  const { volume, muted } = state
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setMute(!muted)} className="text-gray-400 hover:text-white transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>
      <Slider value={muted ? 0 : volume} min={0} max={1} onChange={(value: number) => { if (muted) setMute(false); setVolume(value) }} className="w-24" />
    </div>
  )
}
