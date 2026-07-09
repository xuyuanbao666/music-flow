# 🎵 MusicFlow

Cross-platform High-quality Music Player

[中文版](./README.md)

## ✨ Features

### 🎵 Music Playback
- Local music file import (drag & drop or click)
- Support MP3, WAV, FLAC, OGG, AAC formats
- Play/Pause/Previous/Next controls
- Playback progress bar

### 🔀 Playback Modes
- Shuffle play
- Single loop
- List loop

### 🔊 Audio Control
- Volume adjustment
- Mute toggle
- 10-band equalizer (Flat/Bass Boost/Vocal presets)
- Audio spectrum visualization

### 📝 Lyrics
- LRC lyrics file import
- Synchronized lyrics display
- Click lyrics to seek

### ❤️ Favorites
- Favorite songs
- Recently played history
- Playlist management

### 🔍 Multi-source Search
- NetEase Cloud Music search
- Subsonic server support
- Unified search interface

### ⌨️ Keyboard Shortcuts
- `Space` - Play/Pause
- `Ctrl + →` - Next track
- `Ctrl + ←` - Previous track
- `Ctrl + ↑` - Volume up
- `Ctrl + ↓` - Volume down
- `Ctrl + S` - Toggle shuffle
- `Ctrl + R` - Cycle repeat mode

### 🌙 Themes
- Dark mode (default)
- Light mode
- Theme toggle

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- pnpm >= 9

### Installation
```bash
# Clone the project
git clone https://github.com/xuyuanbao666/music-flow.git
cd music-flow

# Install dependencies
pnpm install
```

### Development
```bash
# Start web app
pnpm --filter @music-flow/web dev
```

Visit http://localhost:3000

### Production Build
```bash
pnpm build
```

## 📁 Project Structure

```
music-flow/
├── apps/
│   └── web/                    # React Web App
│       ├── src/
│       │   ├── components/     # UI Components
│       │   │   ├── Player/     # Player components
│       │   │   ├── Lyrics/     # Lyrics components
│       │   │   ├── Search/     # Search components
│       │   │   ├── Home/       # Home page
│       │   │   └── Layout/     # Layout components
│       │   ├── store/          # Zustand state management
│       │   ├── services/       # Services
│       │   ├── hooks/          # Custom hooks
│       │   └── App.tsx         # Main app
│       └── package.json
├── packages/
│   ├── core/                   # Shared core logic
│   │   ├── audio/              # Audio engine
│   │   ├── sources/            # Music sources
│   │   ├── lyrics/             # Lyrics parser
│   │   └── types/              # Type definitions
│   └── ui/                     # Shared UI components
├── services/
│   └── api/                    # Backend API (optional)
├── package.json
├── turbo.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library

### Audio
- **Playback Engine**: Web Audio API
- **Equalizer**: BiquadFilterNode
- **Visualization**: Canvas API + AnalyserNode

### Backend (Optional)
- **Server**: Hono
- **Database**: PostgreSQL + Prisma
- **Auth**: JWT + bcrypt

### Dev Tools
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Type Checking**: TypeScript

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "@music-flow/core": "workspace:*",
    "@music-flow/ui": "workspace:*"
  }
}
```

## 🎨 UI Preview

### Login Page
- Email/password login
- New user registration
- Skip login to use directly

### Main Interface
- Left sidebar navigation
- Home: Recently played + Favorites
- Music Library: File import
- Search: Multi-source search

### Player
- Bottom playback bar
- Progress bar
- Volume control
- Equalizer panel
- Lyrics panel
- Mini player mode

## 🔧 Development Guide

### Adding New Music Source
```typescript
// packages/core/src/sources/adapters/YourAdapter.ts
import { MusicSource, SearchResult } from '../MusicSource'

export class YourAdapter implements MusicSource {
  id = 'your-source'
  name = 'Your Source'
  type = 'api' as const

  async search(query: string): Promise<SearchResult[]> {
    // Implement search logic
  }

  async getTrack(trackId: string): Promise<Track> {
    // Implement get track logic
  }

  async getPlayUrl(trackId: string): Promise<string> {
    // Implement get play URL logic
  }
}
```

### Adding Equalizer Preset
```typescript
// packages/core/src/audio/Equalizer.ts
export const DEFAULT_PRESETS: EqualizerPreset[] = [
  {
    id: 'your-preset',
    name: 'Your Preset',
    bands: [
      { frequency: 32, gain: 3, type: 'lowshelf' },
      // ... other bands
    ]
  }
]
```

## 📝 API Documentation

### Auth API
```
POST /api/auth/register  - User registration
POST /api/auth/login     - User login
```

### Sync API
```
GET  /api/sync/data       - Get user data
POST /api/sync/playlists  - Sync playlists
POST /api/sync/progress   - Sync playback progress
POST /api/sync/equalizer  - Sync equalizer settings
POST /api/sync/favorites  - Sync favorites
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build
pnpm build

# Deploy dist folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Create Pull Request

## 📄 License

MIT License

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## 📞 Contact

- GitHub: [xuyuanbao666](https://github.com/xuyuanbao666)
- Project: [music-flow](https://github.com/xuyuanbao666/music-flow)
