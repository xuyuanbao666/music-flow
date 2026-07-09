import { useState } from 'react'
import { usePlayerStore } from '../../store'
import { useFavoritesStore } from '../../store/favoritesStore'
import { PlayerControls } from './PlayerControls'
import { ProgressBar } from './ProgressBar'
import { VolumeControl } from './VolumeControl'
import { LyricsPanel } from '../Lyrics'

export function PlayerBar() {
  const { state } = usePlayerStore()
  const { currentTrack, status } = state
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const [mini, setMini] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)

  if (status === 'stopped' && !currentTrack) return null

  if (mini) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 z-50">
        {currentTrack?.coverUrl && (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-10 h-10 rounded-lg object-cover"
          />
        )}
        <div className="min-w-0 max-w-[140px]">
          <div className="text-gray-900 dark:text-white text-sm font-medium truncate">
            {currentTrack?.title || '未播放'}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs truncate">
            {currentTrack?.artist || '未知艺术家'}
          </div>
        </div>
        <PlayerControls compact />
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          className={`transition-colors p-1 ${showLyrics ? 'text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          title="歌词"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </button>
        <button
          onClick={() => setMini(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1"
          title="展开播放器"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <>
      {showLyrics && (
        <div className="fixed bottom-20 right-4 w-96 h-[60vh] z-40 shadow-2xl">
          <LyricsPanel onClose={() => setShowLyrics(false)} />
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 z-50">
        <div className="max-w-7xl mx-auto">
          <ProgressBar />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {currentTrack?.coverUrl && (
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0">
                <div className="text-gray-900 dark:text-white font-medium truncate">
                  {currentTrack?.title || '未播放'}
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm truncate">
                  {currentTrack?.artist || '未知艺术家'}
                </div>
              </div>
              {currentTrack && (
                <button
                  onClick={() => toggleFavorite(currentTrack)}
                  className={`ml-2 transition-colors ${
                    isFavorite(currentTrack.id)
                      ? 'text-red-500'
                      : 'text-gray-400 dark:text-gray-500 hover:text-red-400'
                  }`}
                  title={isFavorite(currentTrack.id) ? '取消收藏' : '收藏'}
                >
                  <svg className="w-5 h-5" fill={isFavorite(currentTrack.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex-1 flex justify-center">
              <PlayerControls />
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`transition-colors p-1.5 rounded-lg ${showLyrics ? 'text-primary-400 bg-primary-400/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                title="歌词"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </button>
              <VolumeControl />
              <button
                onClick={() => setMini(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 ml-2"
                title="迷你播放器"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
