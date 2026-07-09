import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './auth.js'
import { syncRoutes } from './sync.js'

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:3000', 'tauri://localhost'],
  credentials: true
}))

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/api/auth', authRoutes)

app.use('/api/sync/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return next()
})

app.route('/api/sync', syncRoutes)

const port = Number(process.env.PORT) || 4000
console.log(`MusicFlow API running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
