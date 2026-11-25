import type { Track } from '@music-flow/core'
type Entry = { track: Track; file: File; id: string }
let opening: Promise<IDBDatabase> | undefined
function database(): Promise<IDBDatabase> {
  if (!opening) opening = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('musicflow-library', 1)
    req.onupgradeneeded = () => req.result.createObjectStore('tracks', { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('音乐库被其他窗口占用'))
  }).catch(error => { opening = undefined; throw error })
  return opening
}
export async function saveLocalTrack(track: Track, file: File): Promise<void> {
  const db = await database()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('tracks', 'readwrite')
    tx.objectStore('tracks').put({ id: track.id, track, file } satisfies Entry)
    tx.oncomplete = () => resolve()
    tx.onabort = tx.onerror = () => reject(tx.error || new Error('音乐保存失败'))
  })
}
async function read<T>(operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const req = operation(db.transaction('tracks', 'readonly').objectStore('tracks'))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
export async function listLocalTracks(): Promise<Track[]> {
  const entries = await read<Entry[]>(store => store.getAll())
  return entries.map(e => e.track)
}
export async function localTrackUrl(id: string): Promise<string> {
  const entry = await read<Entry | undefined>(store => store.get(id))
  if (!entry) throw new Error('本地文件已失效，请重新导入')
  return URL.createObjectURL(entry.file)
}
