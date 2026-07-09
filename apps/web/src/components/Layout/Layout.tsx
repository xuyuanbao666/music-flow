import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { PlayerBar } from '../Player'
import { SearchPage } from '../Search'

interface LayoutProps { children: React.ReactNode }

export function Layout({ children }: LayoutProps) {
  const [currentPage, setCurrentPage] = useState('home')

  const renderPage = () => {
    switch (currentPage) {
      case 'search':
        return <SearchPage />
      default:
        return children
    }
  }

  return (
    <div className="h-screen flex bg-gray-950">
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="flex-1 overflow-auto pb-24"><div className="p-8">{renderPage()}</div></main>
      <PlayerBar />
    </div>
  )
}
