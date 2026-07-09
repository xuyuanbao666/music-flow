import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'
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
      <main className="flex-1 overflow-auto pb-24">
        <div className="p-8">
          <div className="flex justify-end mb-4">
            <ThemeToggle />
          </div>
          {renderPage()}
        </div>
      </main>
      <PlayerBar />
    </div>
  )
}
