import { useHistoryStore } from '../../store/historyStore'
import { useFavoritesStore } from '../../store/favoritesStore'
import { usePlayerStore } from '../../store'
import { TrackList } from '../TrackList'

export function HomePage() {
  const { getRecentTracks } = useHistoryStore()
  const { favorites } = useFavoritesStore()
  const { playQueue } = usePlayerStore()

  const recentTracks = getRecentTracks(10)

  const handlePlayRecent = () => {
    if (recentTracks.length > 0) playQueue(recentTracks)
  }

  const handlePlayFavorites = () => {
    if (favorites.length > 0) playQueue(favorites)
  }

  return (
    <div className="space-y-10">
      {recentTracks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">最近播放</h2>
            <button
              onClick={handlePlayRecent}
              className="text-sm text-green-500 hover:text-green-400 transition-colors"
            >
              播放全部
            </button>
          </div>
          <TrackList tracks={recentTracks} showIndex={false} />
        </section>
      )}

      {favorites.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              我喜欢的音乐 ({favorites.length})
            </h2>
            <button
              onClick={handlePlayFavorites}
              className="text-sm text-green-500 hover:text-green-400 transition-colors"
            >
              播放全部
            </button>
          </div>
          <TrackList tracks={favorites} showIndex={false} />
        </section>
      )}

      {recentTracks.length === 0 && favorites.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">开始你的音乐之旅</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            导入本地音乐文件或搜索在线歌曲，你的播放历史和收藏将会显示在这里
          </p>
        </div>
      )}
    </div>
  )
}
