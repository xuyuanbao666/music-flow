import { usePlayerStore } from '../../store'
import { PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'
import { VolumeControl } from './VolumeControl'

export function PlayerBar() {
  const { state } = usePlayerStore()
  const { currentTrack, status } = state
  if (status === 'stopped' && !currentTrack) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <ProgressBar />
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack?.coverUrl && <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-12 h-12 rounded-lg object-cover" />}
            <div className="min-w-0">
              <div className="text-white font-medium truncate">{currentTrack?.title || '未播放'}</div>
              <div className="text-gray-400 text-sm truncate">{currentTrack?.artist || '未知艺术家'}</div>
            </div>
          </div>
          <div className="flex-1 flex justify-center"><PlayerControls /></div>
          <div className="flex-1 flex justify-end"><VolumeControl /></div>
        </div>
      </div>
    </div>
  )
}
