import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { FileImporter, TrackList } from './components/TrackList'
import { Header } from './components/Layout'
import { usePlayerStore } from './store'

function App() {
  const { queue, initEngine } = usePlayerStore()
  useEffect(() => { initEngine() }, [initEngine])
  return (
    <Layout>
      <Header title="音乐库" subtitle="导入本地音乐文件开始播放" />
      <div className="space-y-8">
        <FileImporter />
        {queue.length > 0 && <div><h2 className="text-xl font-semibold text-white mb-4">已导入的歌曲 ({queue.length})</h2><TrackList tracks={queue} /></div>}
      </div>
    </Layout>
  )
}
export default App
