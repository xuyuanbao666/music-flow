import { MusicSource, SearchResult } from './MusicSource'

export class SourceManager {
  private sources: Map<string, MusicSource> = new Map()

  registerSource(source: MusicSource): void {
    this.sources.set(source.id, source)
  }

  getSource(id: string): MusicSource | undefined {
    return this.sources.get(id)
  }

  getAllSources(): MusicSource[] {
    return Array.from(this.sources.values())
  }

  async searchAll(query: string): Promise<SearchResult[]> {
    const results = await Promise.all(
      this.getAllSources().map(source => source.search(query).catch(() => []))
    )
    return results.flat()
  }
}
