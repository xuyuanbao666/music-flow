import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(pathToFileURL(join(process.env.PLAYWRIGHT_DIR, 'node_modules/playwright/index.mjs')).href)
const url = process.env.SMOKE_URL || 'http://127.0.0.1:4173/music-flow/'
const output = 'test-results'
await mkdir(output, { recursive: true })
function wav(name, frequency) {
  const rate = 16000, samples = rate * 12
  const buffer = Buffer.alloc(44 + samples * 2)
  buffer.write('RIFF', 0); buffer.writeUInt32LE(buffer.length - 8, 4)
  buffer.write('WAVEfmt ', 8); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 2, 28)
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36); buffer.writeUInt32LE(samples * 2, 40)
  for (let i = 0; i < samples; i++) buffer.writeInt16LE(Math.round(Math.sin(2 * Math.PI * frequency * i / rate) * 2500), 44 + i * 2)
  return { name: name + '.wav', mimeType: 'audio/wav', buffer }
}
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1366, height: 900 } })
await context.addInitScript(() => {
  const NativeAudio = window.Audio
  window.__musicAudio = []
  window.Audio = class extends NativeAudio {
    constructor(...args) { super(...args); window.__musicAudio.push(this) }
  }
})
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const player = page.locator('.music-player')
const control = name => player.getByTitle(name, { exact: true }).filter({ visible: true })
const track = name => page.getByRole('button').filter({ hasText: name }).first()
const waitPlaying = () => page.waitForFunction(() => {
  const a = window.__musicAudio[0]
  return a && !a.paused && a.currentTime > 0.15 && a.readyState >= 2
}, null, { timeout: 15000 })
try {
  await page.goto(url)
  await page.getByText('跳过登录，直接使用', { exact: true }).click()
  await page.getByRole('button', { name: /音乐库/ }).click()
  await page.locator('input[type=file][accept="audio/*"]').setInputFiles([wav('Smoke Alpha', 440), wav('Smoke Beta', 660)])
  await page.getByText('已保存 2 首歌曲', { exact: true }).waitFor()
  await track('Smoke Alpha').click()
  await waitPlaying()
  await control('播放/暂停 (Space)').click()
  await page.waitForFunction(() => window.__musicAudio[0]?.paused)
  await page.getByRole('slider', { name: '播放进度' }).fill('6')
  await page.waitForFunction(() => Math.abs(window.__musicAudio[0].currentTime - 6) < 0.6)
  await page.getByRole('slider', { name: '音量' }).fill('0.5')
  assert.equal(await page.evaluate(() => window.__musicAudio[0].volume), 1, 'volume applied only through gain node')
  await control('播放/暂停 (Space)').click()
  await waitPlaying()
  await control('收藏').click()
  await control('取消收藏').waitFor()
  await control('歌词').click()
  await page.locator('input[accept=".lrc,.txt"]').first().setInputFiles({ name: 'smoke.lrc', mimeType: 'text/plain', buffer: Buffer.from('[00:00.00]Smoke line one\n[00:06.00]Smoke line two') })
  await page.getByText('Smoke line two', { exact: true }).waitFor()
  await page.screenshot({ path: join(output, 'desktop-player.png') })
  await page.getByRole('button', { name: '关闭歌词' }).click()
  await control('下一首 (Ctrl+→)').click()
  await player.getByText('Smoke Beta', { exact: true }).waitFor()
  await waitPlaying()
  await control('歌词').click()
  await page.getByText('暂无歌词', { exact: true }).waitFor()
  await page.getByRole('button', { name: '关闭歌词' }).click()
  await page.reload()
  await page.getByRole('button', { name: /音乐库/ }).click()
  await track('Smoke Alpha').waitFor()
  await track('Smoke Beta').waitFor()
  await track('Smoke Alpha').click()
  await waitPlaying()
  await control('取消收藏').waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: '打开导航菜单' }).click()
  await page.getByRole('button', { name: /音乐库/ }).click()
  await control('歌词').click()
  await page.getByText('Smoke line one', { exact: true }).waitFor()
  const bounds = await player.boundingBox()
  assert.ok(bounds && bounds.x >= -1 && bounds.x + bounds.width <= 391, 'mobile player fits viewport')
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal page overflow')
  await page.screenshot({ path: join(output, 'mobile-player.png') })
  await page.getByRole('button', { name: '关闭歌词' }).click()
  await control('迷你播放器').click()
  await page.getByTitle('歌词', { exact: true }).click()
  await page.getByRole('heading', { name: '歌词' }).waitFor()
  assert.deepEqual(errors, [], 'browser runtime errors')
  console.log('PASS: real WAV playback, pause/resume, seek, volume, favorites, next track, LRC, IndexedDB reload, mobile layout and mini player')
} catch (error) {
  await page.screenshot({ path: join(output, 'failure.png') }).catch(() => {})
  throw error
} finally { await browser.close() }
