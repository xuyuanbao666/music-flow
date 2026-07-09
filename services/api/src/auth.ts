import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export const authRoutes = new Hono()

authRoutes.post('/register', async (c) => {
  try {
    const { email, name, password } = await c.req.json()

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
