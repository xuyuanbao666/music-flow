import { Button } from '@music-flow/ui'
import { usePlayerStore } from '../../store'

export function PlayerControls() {
  const { state, pause, resume, next, previous, setRepeatMode, setShuffle } = usePlayerStore()
  const { status, repeatMode, shuffle } = state
  const isPlaying = status === 'playing'
  const cycleRepeatMode = () => { const modes = ['none', 'all', 'one'] as const; setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]) }
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => setShuffle(!shuffle)} className={shuffle ? 'text-green-500' : 'text-gray-400'}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
      </Button>
      <Button variant="ghost" size="sm" onClick={previous}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg></Button>
      <Button variant="primary" size="lg" onClick={isPlaying ? pause : resume} className="rounded-full w-12 h-12 p-0">
        {isPlaying ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}
      </Button>
      <Button variant="ghost" size="sm" onClick={next}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg></Button>
      <Button variant="ghost" size="sm" onClick={cycleRepeatMode} className={repeatMode !== 'none' ? 'text-green-500' : 'text-gray-400'}><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg></Button>
    </div>
  )
}
