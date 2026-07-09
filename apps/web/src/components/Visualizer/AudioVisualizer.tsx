import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../store'

export function AudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const { engine } = usePlayerStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !engine) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyser = engine.getAnalyser()
    if (!analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgb(3, 7, 18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height
        const hue = (i / bufferLength) * 360
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
        x += barWidth + 1
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [engine])

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h3 className="text-white text-lg font-semibold mb-4">音频可视化</h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full rounded-lg"
      />
    </div>
  )
}
