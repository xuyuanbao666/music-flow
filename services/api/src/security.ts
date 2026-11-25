import jwt from 'jsonwebtoken'
export type AuthEnv = { Variables: { userId: string } }
export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters')
  return secret
}
export function authenticatedUser(header: string | undefined): string | null {
  if (!header?.startsWith('Bearer ')) return null
  try {
    const payload = jwt.verify(header.slice(7), jwtSecret(), { algorithms: ['HS256'] })
    return typeof payload !== 'string' && typeof payload.userId === 'string' && payload.userId.length > 0 ? payload.userId : null
  } catch { return null }
}
