import React, { useCallback, useRef } from 'react'
import { Button } from '@music-flow/ui'
import { FileService } from '../../services/fileService'
import { usePlayerStore } from '../../store'
import { Track } from '@music-flow/core'

interface FileImporterProps { onImport?: (tracks: Track[]) => void }

export function FileImporter({ onImport }: FileImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToQueue } = usePlayerStore()
  const handleImport = useCallback(async (files: FileList) => { const tracks = await FileService.importFiles(files); tracks.forEach(track => addToQueue(track)); if (onImport) onImport(tracks) }, [addToQueue, onImport])
  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors" onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files.length > 0) handleImport(e.dataTransfer.files) }} onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}>
      <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={(e) => { if (e.target.files && e.target.files.length > 0) handleImport(e.target.files) }} className="hidden" />
      <div className="mb-4"><svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg></div>
      <p className="text-gray-500 dark:text-gray-400 mb-4">拖拽音乐文件到这里，或点击选择文件</p>
      <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>选择文件</Button>
      <p className="text-gray-400 dark:text-gray-500 text-sm mt-3">支持 MP3, WAV, FLAC, OGG, AAC 格式</p>
    </div>
  )
}
