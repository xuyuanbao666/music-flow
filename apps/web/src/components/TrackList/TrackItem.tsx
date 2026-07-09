import { Track } from '@music-flow/core'
import { usePlayerStore } from '../../store'

interface TrackItemProps { track: Track; index: number; showIndex?: boolean }

export function TrackItem({ track, index, showIndex = true }: TrackItemProps) {
  const { play, state } = usePlayerStore()
  const isCurrentTrack = state.currentTrack?.id === track.id
  const isPlaying = isCurrentTrack && state.status === 'playing'
  const formatDuration = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs.toString().padStart(2, '0')}` }
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group ${isCurrentTrack ? 'bg-gray-800' : ''}`} onClick={() => play(track)}>
      {showIndex && <div className="w-8 text-center">{isPlaying ? <div className="flex items-center justify-center gap-0.5"><div className="w-1 h-3 bg-green-500 animate-pulse" /><div className="w-1 h-4 bg-green-500 animate-pulse delay-75" /><div className="w-1 h-2 bg-green-500 animate-pulse delay-150" /></div> : <span className="text-gray-500 group-hover:hidden">{index + 1}</span>}{!isPlaying && <svg className="w-4 h-4 text-white hidden group-hover:block mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>}</div>}
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">{track.coverUrl ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg></div>}</div>
      <div className="flex-1 min-w-0"><div className={`font-medium truncate ${isCurrentTrack ? 'text-green-500' : 'text-white'}`}>{track.title}</div><div className="text-gray-400 text-sm truncate">{track.artist}</div></div>
      <div className="hidden md:block text-gray-400 text-sm flex-1 min-w-0 truncate">{track.album}</div>
      <div className="text-gray-400 text-sm">{formatDuration(track.duration)}</div>
    </div>
  )
}
