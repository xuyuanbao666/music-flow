import { useEffect, useState } from 'react'
import { Layout } from './components/Layout'
import { FileImporter, TrackList } from './components/TrackList'
import { Header } from './components/Layout'
import { usePlayerStore } from './store'
import { useAuthStore } from './store/authStore'
import { LoginForm, RegisterForm } from './components/Auth'

function App() {
  const { queue, initEngine } = usePlayerStore()
  const { user, skipAuth } = useAuthStore()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  useEffect(() => { initEngine() }, [initEngine])

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="w-full max-w-md">
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
          <div className="mt-6 text-center">
            <button
              onClick={skipAuth}
              className="text-gray-500 hover:text-gray-400 text-sm underline"
            >
              跳过登录，直接使用
            </button>
          </div>
        </div>
      </div>
    )
  }

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
