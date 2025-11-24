'use client'
import * as Dialog from '@radix-ui/react-dialog'
import Button from '@/app/_components/ui/button'
import { useState, ChangeEvent, useCallback } from 'react'
import type { Post } from '@visura/shared'
import { X } from 'lucide-react'
import { Avatar, AvatarImage } from '../ui/avatar'

interface PostComposerDialogProps {
  onClose?: () => void
  onCreated?: (post: Post) => void
}

export default function PostComposerDialog({
  onClose,
  onCreated
}: PostComposerDialogProps) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setFiles(Array.from(e.target.files))
  }, [])

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    const trimmed = text.trim()
    if (!trimmed) {
      setError('Digite algum texto para o post.')
      return
    }
    if (submitting) return

    setSubmitting(true)
    try {
      const form = new FormData()
      form.append('text', trimmed)
      files.forEach((f) => form.append('media', f))

      // Usa API route Next.js que repassa para backend com autenticação via cookie
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: form
      })

      if (!res.ok) {
        let payload: any = null
        try {
          payload = await res.json()
        } catch {}
        throw new Error(payload?.message || 'Falha ao publicar o post.')
      }

      const created: Post = await res.json()
      if (!(created as any).content && (created as any).text) {
        ;(created as any).content = (created as any).text
      }
      if (!(created as any).createdAt) {
        ;(created as any).createdAt = new Date().toISOString()
      }
      onCreated?.(created)
      setSuccess('Publicado com sucesso!')
      setText('')
      setFiles([])
      onClose?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao publicar o post.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
      <Dialog.Content className='bg-background fixed top-1/2 left-1/2 w-[480px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border p-5 shadow-xl focus:outline-none'>
        <div className='mb-3 flex items-center justify-between'>
          <Dialog.Title className='flex items-center gap-3 text-lg font-semibold'>
            <Avatar>
              <AvatarImage src='/avatar1.png' />
            </Avatar>
            <span>Jean Santos</span>
          </Dialog.Title>
          <Dialog.Close asChild>
            <button aria-label='Fechar' className='hover:bg-accent rounded p-1'>
              <X className='h-5 w-5' />
            </button>
          </Dialog.Close>
        </div>
        <div className='space-y-4'>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='O que você quer compartilhar?'
            className='focus:ring-primary min-h-[120px] w-full resize-none rounded-md border bg-transparent p-3 text-sm outline-none focus:ring-2'
          />
          <div className='flex flex-col gap-2'>
            <label className='text-xs font-medium'>
              Mídia (imagens ou vídeos)
            </label>
            <input
              type='file'
              multiple
              accept='image/*,video/*'
              onChange={handleSelect}
              className='border-input focus:ring-primary rounded border px-2 py-1 text-sm outline-none focus:ring-2'
            />
          </div>
          {(error || success) && (
            <div
              className={
                error ? 'text-xs text-red-500' : 'text-xs text-green-600'
              }
            >
              {error || success}
            </div>
          )}
        </div>
        <div className='mt-5 flex justify-end gap-3'>
          <Dialog.Close asChild>
            <Button variant='outline' size='sm' disabled={submitting}>
              Cancelar
            </Button>
          </Dialog.Close>
          <Button
            size='sm'
            onClick={handleSubmit}
            disabled={submitting || (!text.trim() && files.length === 0)}
          >
            {submitting ? 'Publicando...' : 'Publicar'}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
