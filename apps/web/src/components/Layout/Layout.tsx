import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { PlayerBar } from '../Player'

interface LayoutProps { children: React.ReactNode }

export function Layout({ children }: LayoutProps) {
  const [currentPage, setCurrentPage] = useState('home')
  return (
    <div className="h-screen flex bg-gray-950">
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="flex-1 overflow-auto pb-24"><div className="p-8">{children}</div></main>
      <PlayerBar />
    </div>
  )
}
