import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
import { jwtSecret } from './security.js'
const JWT_SECRET = jwtSecret()

export const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  try {
    const { email, name, password } = await c.req.json()
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof name !== 'string' || !name.trim() || name.length > 100 || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) return c.json({ error: 'Invalid registration data' }, 400)

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return c.json({ error: 'Email already exists' }, 400)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500)
  }
})

authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    if (typeof email !== 'string' || typeof password !== 'string' || Buffer.byteLength(password) > 72) return c.json({ error: 'Invalid credentials' }, 401)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})
