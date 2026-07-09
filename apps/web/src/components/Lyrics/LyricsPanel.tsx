import { useEffect, useState, useRef, useCallback } from 'react'
import { LrcParser, LyricLine } from '@music-flow/core'
import { usePlayerStore } from '../../store'
import { LyricsService } from '../../services/lyricsService'

interface LyricsPanelProps {
  onClose?: () => void
}

export function LyricsPanel({ onClose }: LyricsPanelProps) {
  const { state, seek } = usePlayerStore()
  const { currentTime, currentTrack } = state
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const userScrolledRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!currentTrack) {
      setLyrics([])
      return
    }

    const cached = LyricsService.getCachedLyrics(currentTrack.id)
    if (cached && cached.length > 0) {
      setLyrics(cached)
    } else {
      LyricsService.loadLyricsForTrack(currentTrack).then((loaded) => {
        if (loaded.length > 0) setLyrics(loaded)
      })
    }
  }, [currentTrack?.id])

  useEffect(() => {
    if (lyrics.length > 0) {
      const line = LrcParser.getCurrentLine(lyrics, currentTime)
      setCurrentLine(line)
    }
  }, [currentTime, lyrics])

  useEffect(() => {
    if (userScrolledRef.current) return
    const el = lineRefs.current[currentLine]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentLine])

  const handleScroll = useCallback(() => {
    userScrolledRef.current = true
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => {
      userScrolledRef.current = false
    }, 3000)
  }, [])

  const handleFileLoad = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentTrack) return

    setIsLoading(true)
    try {
      const { lyrics: parsed, raw } = await LyricsService.loadFromFile(file)
      if (parsed.length > 0) {
        LyricsService.setCachedLyrics(currentTrack.id, raw)
        setLyrics(parsed)
      }
    } finally {
      setIsLoading(false)
      e.target.value = ''
    }
  }, [currentTrack])

  return (
    <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">歌词</h3>
        <div className="flex items-center gap-2">
          <label className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm px-2 py-1 rounded hover:bg-gray-700/50">
            {isLoading ? '加载中...' : '导入LRC'}
            <input
              type="file"
              accept=".lrc,.txt"
              onChange={handleFileLoad}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-2 min-h-0"
      >
        {lyrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
            <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <p>暂无歌词</p>
            <label className="text-primary-400 hover:text-primary-300 text-sm cursor-pointer underline">
              点击导入 LRC 文件
              <input
                type="file"
                accept=".lrc,.txt"
                onChange={handleFileLoad}
                className="hidden"
                disabled={isLoading || !currentTrack}
              />
            </label>
          </div>
        ) : (
          <>
            <div className="h-32" />
            {lyrics.map((line, i) => (
              <p
                key={i}
                ref={(el) => { lineRefs.current[i] = el }}
                onClick={() => seek(line.time)}
                className={`text-center transition-all duration-300 cursor-pointer px-4 py-1 rounded ${
                  i === currentLine
                    ? 'text-white text-lg font-bold scale-105'
                    : i < currentLine
                      ? 'text-gray-600 text-sm hover:text-gray-400'
                      : 'text-gray-500 text-sm hover:text-gray-400'
                }`}
              >
                {line.text || '\u00A0'}
              </p>
            ))}
            <div className="h-32" />
          </>
        )}
      </div>
    </div>
  )
}
