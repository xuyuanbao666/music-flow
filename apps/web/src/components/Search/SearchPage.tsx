import { Button } from '@music-flow/ui'
import { useSearchStore } from '../../store/searchStore'
import { usePlayerStore } from '../../store'
import { Track, SearchResult } from '@music-flow/core'

export function SearchPage() {
  const { query, results, isSearching, setQuery, search } = useSearchStore()
  const { play } = usePlayerStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    search()
  }

  const handlePlay = (result: SearchResult) => {
    const track: Track = {
      id: result.id,
      title: result.title,
      artist: result.artist,
      album: result.album,
      duration: result.duration,
      coverUrl: result.coverUrl,
      source: 'stream',
      sourceId: result.sourceId,
      metadata: { format: 'mp3' }
    }
    play(track)
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-4 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索音乐..."
          className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" variant="primary" disabled={isSearching}>
          {isSearching ? '搜索中...' : '搜索'}
        </Button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handlePlay(result)}
            >
              {result.coverUrl && (
                <img src={result.coverUrl} alt={result.title} className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-gray-900 dark:text-white font-medium truncate">{result.title}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm truncate">{result.artist}</div>
              </div>
              <div className="text-gray-400 dark:text-gray-500 text-sm">{result.source}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
