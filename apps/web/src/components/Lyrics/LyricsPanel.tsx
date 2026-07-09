import { useEffect, useState, useRef } from 'react'
import { LrcParser, LyricLine } from '@music-flow/core'
import { usePlayerStore } from '../../store'

export function LyricsPanel() {
  const { state } = usePlayerStore()
  const { currentTime } = state
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [currentLine, setCurrentLine] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lyrics.length > 0) {
      const line = LrcParser.getCurrentLine(lyrics, currentTime)
      setCurrentLine(line)
    }
  }, [currentTime, lyrics])

  useEffect(() => {
    if (containerRef.current) {
      const lineElement = containerRef.current.children[currentLine] as HTMLElement
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentLine])

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-white text-lg font-semibold mb-4">歌词</h3>
      <div ref={containerRef} className="h-64 overflow-y-auto space-y-3">
        {lyrics.length === 0 ? (
          <p className="text-gray-500 text-center">暂无歌词</p>
        ) : (
          lyrics.map((line, i) => (
            <p
              key={i}
              className={`text-center transition-all duration-300 ${
                i === currentLine
                  ? 'text-white text-lg font-bold scale-110'
                  : 'text-gray-500 text-sm'
              }`}
            >
              {line.text}
            </p>
          ))
        )}
      </div>
    </div>
  )
}
