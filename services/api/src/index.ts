import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './auth.js'
import { syncRoutes } from './sync.js'

import { authenticatedUser, type AuthEnv } from './security.js'
const app = new Hono<AuthEnv>()

app.use('*', cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,tauri://localhost').split(',').map(s => s.trim()).filter(Boolean),
  credentials: true
}))

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/api/auth', authRoutes)

app.use('/api/sync/*', async (c, next) => {
  const userId = authenticatedUser(c.req.header('Authorization'))
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)
  c.set('userId', userId)
  return next()
})

app.route('/api/sync', syncRoutes)

const port = Number(process.env.PORT) || 4000
console.log(`MusicFlow API running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
