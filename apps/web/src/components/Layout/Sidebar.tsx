import { usePlaylistStore } from '../../store'
import { Button } from '@music-flow/ui'

interface SidebarProps { onNavigate: (page: string) => void; currentPage: string }

export function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const { playlists, createPlaylist } = usePlaylistStore()
  const handleCreatePlaylist = () => { const name = prompt('请输入歌单名称'); if (name) createPlaylist(name) }
  const menuItems = [{ id: 'home', label: '首页', icon: '🏠' }, { id: 'library', label: '音乐库', icon: '🎵' }, { id: 'search', label: '搜索', icon: '🔍' }, { id: 'equalizer', label: '均衡器', icon: '🎚️' }, { id: 'visualizer', label: '可视化', icon: '📊' }]
  return (
    <div className="w-64 bg-gray-900 h-full flex flex-col border-r border-gray-800">
      <div className="p-6"><h1 className="text-2xl font-bold text-white">MusicFlow</h1></div>
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map(item => <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentPage === item.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}><span className="text-xl">{item.icon}</span><span className="font-medium">{item.label}</span></button>)}
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">我的歌单</h2>
            <Button variant="ghost" size="sm" onClick={handleCreatePlaylist} className="text-gray-400 hover:text-white">+</Button>
          </div>
          <div className="space-y-1">
            {playlists.map(playlist => <button key={playlist.id} onClick={() => onNavigate(`playlist/${playlist.id}`)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${currentPage === `playlist/${playlist.id}` ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}><span className="text-lg">📋</span><span className="truncate">{playlist.name}</span></button>)}
          </div>
        </div>
      </nav>
    </div>
  )
}
