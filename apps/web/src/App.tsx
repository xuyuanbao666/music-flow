import { useEffect, useState } from 'react'
import { Layout } from './components/Layout'
import { usePlayerStore, useAuthStore, useHistoryStore } from './store'
import { LoginForm, RegisterForm } from './components/Auth'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function App() {
  const { state, initEngine } = usePlayerStore()
  const { user, skipAuth } = useAuthStore()
  const { addToHistory } = useHistoryStore()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    initEngine()
  }, [initEngine])

  useEffect(() => {
    if (state.currentTrack && state.status === 'playing') {
      addToHistory(state.currentTrack)
    }
  }, [state.currentTrack?.id, state.status])

  useKeyboardShortcuts()

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="w-full max-w-md px-4">
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

  return <Layout />
}

export default App
