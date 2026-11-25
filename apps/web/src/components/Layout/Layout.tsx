import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'
import { PlayerBar } from '../Player'
import { Header } from './Header'
import { EqualizerPanel } from '../Equalizer'
import { AudioVisualizer } from '../Visualizer'
import { SearchPage } from '../Search'
import { HomePage } from '../Home'
import { FileImporter, TrackList } from '../TrackList'
import { usePlayerStore } from '../../store'

export function Layout() {
  const [currentPage, setCurrentPage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { library, error, playQueue } = usePlayerStore()

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <><section className="flow-hero"><div><p className="flow-kicker">MUSIC FLOW · 03</p><h2>聆听你的世界</h2><p>让每一首喜欢的音乐，都有自己的位置。</p><div className="flex gap-3 flex-wrap mt-5"><button className="flow-cta" onClick={() => setCurrentPage('library')}>导入音乐</button><button className="flow-secondary" disabled={!library.length} onClick={() => void playQueue(library)}>播放全部</button></div></div><div className="flow-record" aria-hidden="true"><i/></div></section><div className="flow-stats"><span><strong>{library.length}</strong> 本地歌曲</span><span><strong>离线</strong> 本地音乐空间</span></div><HomePage /></>
      case 'library':
        return (
          <>
            <Header title="音乐库" subtitle="导入本地音乐文件开始播放" />
            <div className="space-y-6">
              <FileImporter />
              {library.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">已导入的歌曲 ({library.length}) <button className="ml-3 text-sm text-primary-500" onClick={() => void playQueue(library)}>播放全部</button></h2>
                  <TrackList tracks={library} />
                </div>
              )}
            </div>
          </>
        )
      case 'search':
        return (
          <>
            <Header title="搜索" subtitle="搜索在线音乐" />
            <SearchPage />
          </>
        )
      case 'equalizer':
        return (
          <>
            <Header title="均衡器" />
            <EqualizerPanel />
          </>
        )
      case 'visualizer':
        return (
          <>
            <Header title="音频可视化" />
            <AudioVisualizer />
          </>
        )
      default:
        return <HomePage />
    }
  }

  return (
    <div className="music-shell h-[100dvh] flex bg-white dark:bg-gray-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <Sidebar
          onNavigate={(page) => { setCurrentPage(page); setSidebarOpen(false) }}
          currentPage={currentPage}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto pb-36">
        {/* Mobile header with menu button */}
        <div className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                aria-label="打开导航菜单" onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MusicFlow</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Desktop theme toggle */}
        <div className="hidden lg:flex justify-end p-8 pb-0">
          <ThemeToggle />
        </div>

        <div className="flow-main p-4 md:p-8">
          {error && <p role="alert" className="mb-4 rounded-xl bg-red-100 dark:bg-red-950 p-3 text-red-700 dark:text-red-200">{error}</p>}
          {renderPage()}
        </div>
      </main>

      {/* Player bar */}
      <PlayerBar />
    </div>
  )
}
