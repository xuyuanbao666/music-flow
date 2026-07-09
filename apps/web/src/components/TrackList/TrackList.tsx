import { Track } from '@music-flow/core'
import { TrackItem } from './TrackItem'

interface TrackListProps { tracks: Track[]; showIndex?: boolean }

export function TrackList({ tracks, showIndex = true }: TrackListProps) {
  if (tracks.length === 0) return <div className="text-center py-12 text-gray-400 dark:text-gray-500"><svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg><p>暂无歌曲</p><p className="text-sm mt-1">导入音乐文件开始播放</p></div>
  return (
    <div className="space-y-1">
      {showIndex && <div className="flex items-center gap-4 px-3 py-2 text-gray-400 dark:text-gray-500 text-sm border-b border-gray-200 dark:border-gray-800"><div className="w-8 text-center">#</div><div className="w-10" /><div className="flex-1">标题</div><div className="hidden md:block flex-1">专辑</div><div className="w-16 text-right">时长</div></div>}
      {tracks.map((track, index) => <TrackItem key={track.id} track={track} index={index} showIndex={showIndex} />)}
    </div>
  )
}
