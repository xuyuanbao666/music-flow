import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const syncRoutes = new Hono()

syncRoutes.get('/data', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'

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
  const userId = c.req.header('X-User-Id') || 'default'
  const { playlists } = await c.req.json()

  for (const playlist of playlists) {
    await prisma.playlist.upsert({
      where: { id: playlist.id },
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

    await prisma.playlistTrack.deleteMany({
      where: { playlistId: playlist.id }
    })

    if (playlist.tracks?.length > 0) {
      await prisma.playlistTrack.createMany({
        data: playlist.tracks.map((t: any, i: number) => ({
          playlistId: playlist.id,
          trackId: t.trackId,
          order: i,
          addedAt: new Date(t.addedAt)
        }))
      })
    }
  }

  return c.json({ success: true })
})

syncRoutes.post('/progress', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'
  const { trackId, position } = await c.req.json()

  await prisma.playbackProgress.upsert({
    where: { userId_trackId: { userId, trackId } },
    update: { position, updatedAt: new Date() },
    create: { userId, trackId, position }
  })

  return c.json({ success: true })
})

syncRoutes.post('/equalizer', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'
  const { bands, preset } = await c.req.json()

  await prisma.equalizerSettings.upsert({
    where: { userId },
    update: { bands, preset, updatedAt: new Date() },
    create: { userId, bands, preset }
  })

  return c.json({ success: true })
})

syncRoutes.post('/favorites', async (c) => {
  const userId = c.req.header('X-User-Id') || 'default'
  const { trackIds } = await c.req.json()

  await prisma.favorite.deleteMany({ where: { userId } })

  if (trackIds?.length > 0) {
    await prisma.favorite.createMany({
      data: trackIds.map((trackId: string) => ({
        userId,
        trackId,
        addedAt: new Date()
      }))
    })
  }

  return c.json({ success: true })
})
