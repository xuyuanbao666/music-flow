import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
import type { AuthEnv } from './security.js'
export const syncRoutes = new Hono<AuthEnv>()

syncRoutes.get('/data', async (c) => {
  const userId = c.get('userId')

  const [playlists, progress, settings, history, favorites] = await Promise.all([
    prisma.playlist.findMany({
      where: { userId },
      include: { tracks: { orderBy: { order: 'asc' } } }
    }),
    prisma.playbackProgress.findMany({ where: { userId } }),
    prisma.equalizerSettings.findUnique({ where: { userId } }),
    prisma.playHistory.findMany({
      where: { userId },
      orderBy: { playedAt: 'desc' },
      take: 100
    }),
    prisma.favorite.findMany({ where: { userId } })
  ])

  return c.json({ playlists, progress, settings, history, favorites })
})

syncRoutes.post('/playlists', async (c) => {
  const userId = c.get('userId')
  const { playlists } = await c.req.json()

  if (!Array.isArray(playlists) || playlists.length > 500 || playlists.some(p => !p || typeof p.id !== 'string' || typeof p.name !== 'string' || (p.tracks !== undefined && !Array.isArray(p.tracks)))) return c.json({ error: 'Invalid playlists' }, 400)
  try {
    await prisma.$transaction(async tx => {
  for (const playlist of playlists) {
    const existing = await tx.playlist.findUnique({ where: { id: playlist.id }, select: { userId: true } })
    if (existing && existing.userId !== userId) throw new Error('Forbidden')
    await tx.playlist.upsert({
      where: { id: playlist.id, userId },
      update: {
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.isPublic,
        updatedAt: new Date()
      },
      create: {
        id: playlist.id,
        userId,
        name: playlist.name,
        description: playlist.description,
        isPublic: playlist.isPublic
      }
    })

    await tx.playlistTrack.deleteMany({
      where: { playlistId: playlist.id }
    })

    if (playlist.tracks?.length > 0) {
      await tx.playlistTrack.createMany({
        data: playlist.tracks.map((t: any, i: number) => ({
          playlistId: playlist.id,
          trackId: t.trackId,
          order: i,
          addedAt: new Date(t.addedAt)
        }))
      })
    }
  }
    }, { isolationLevel: 'Serializable' })
  } catch (error) {
    return c.json({ error: 'Playlist update rejected' }, error instanceof Error && error.message === 'Forbidden' ? 403 : 409)
  }

  return c.json({ success: true })
})

syncRoutes.post('/progress', async (c) => {
  const userId = c.get('userId')
  const { trackId, position } = await c.req.json()
  if (typeof trackId !== 'string' || typeof position !== 'number' || !Number.isFinite(position) || position < 0) return c.json({ error: 'Invalid progress' }, 400)

  await prisma.playbackProgress.upsert({
    where: { userId_trackId: { userId, trackId } },
    update: { position, updatedAt: new Date() },
    create: { userId, trackId, position }
  })

  return c.json({ success: true })
})

syncRoutes.post('/equalizer', async (c) => {
  const userId = c.get('userId')
  const { bands, preset } = await c.req.json()

  await prisma.equalizerSettings.upsert({
    where: { userId },
    update: { bands, preset, updatedAt: new Date() },
    create: { userId, bands, preset }
  })

  return c.json({ success: true })
})

syncRoutes.post('/favorites', async (c) => {
  const userId = c.get('userId')
  const { trackIds } = await c.req.json()

  if (!Array.isArray(trackIds) || trackIds.length > 10000 || trackIds.some(id => typeof id !== 'string')) return c.json({ error: 'Invalid favorites' }, 400)
  await prisma.$transaction(async tx => {
  await tx.favorite.deleteMany({ where: { userId } })

  if (trackIds.length > 0) {
    await tx.favorite.createMany({
      data: [...new Set<string>(trackIds)].map((trackId: string) => ({
        userId,
        trackId,
        addedAt: new Date()
      }))
    })
  }
  })

  return c.json({ success: true })
})
