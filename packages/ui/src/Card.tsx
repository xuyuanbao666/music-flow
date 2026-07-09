import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-gray-700' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative aspect-square rounded-lg overflow-hidden mb-3 ${className}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-white font-semibold truncate ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-gray-400 text-sm truncate ${className}`}>{children}</p>
}
