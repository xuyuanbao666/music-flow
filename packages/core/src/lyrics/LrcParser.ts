export interface LyricLine {
  time: number
  text: string
}

export class LrcParser {
  static parse(lrcContent: string): LyricLine[] {
    const lines = lrcContent.split('\n')
    const result: LyricLine[] = []

    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = parseInt(match[3].padEnd(3, '0'))
        const time = minutes * 60 + seconds + milliseconds / 1000
        const text = match[4].trim()
        if (text) {
          result.push({ time, text })
        }
      }
    }

    return result.sort((a, b) => a.time - b.time)
  }

  static getCurrentLine(lyrics: LyricLine[], currentTime: number): number {
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return i
      }
    }
    return 0
  }
}
