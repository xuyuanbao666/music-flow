import { useEffect } from 'react'
import { usePlayerStore } from '../store'

export function useKeyboardShortcuts() {
  const { state, pause, resume, next, previous, setShuffle, setRepeatMode, setVolume } =
    usePlayerStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (state.status === 'playing') pause()
          else resume()
          break
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            next()
          }
          break
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            previous()
          }
          break
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setVolume(Math.min(1, state.volume + 0.1))
          }
          break
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setVolume(Math.max(0, state.volume - 0.1))
          }
          break
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            setShuffle(!state.shuffle)
          }
          break
        case 'KeyR':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            const modes = ['none', 'all', 'one'] as const
            setRepeatMode(
              modes[(modes.indexOf(state.repeatMode) + 1) % modes.length]
            )
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state, pause, resume, next, previous, setShuffle, setRepeatMode, setVolume])
}
