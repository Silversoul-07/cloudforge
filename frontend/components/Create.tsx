'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { uploadMedia } from '@/lib/api'

export default function Upload() {
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (file) {
        await uploadMedia({ title, media: file })
      } else if (url) {
        await uploadMedia({ title, url })
      }
      router.push('/')
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Upload Media</h1>
      <Input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept="image/*,video/*"
      />
      <Input
        type="url"
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button type="submit" disabled={isLoading || (!file && !url)}>
        {isLoading ? 'Uploading...' : 'Upload'}
      </Button>
    </form>
  )
}

