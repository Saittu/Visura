'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Post } from '@visura/shared'
import { Button } from '../ui/button'
import { useState, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

import { Heart } from 'lucide-react'
import { Repeat2 } from 'lucide-react'
import { Bookmark } from 'lucide-react'
import { MessageCircle } from 'lucide-react'
import { X } from 'lucide-react'

interface PostCardProps {
  post: Post
  className?: string
  onLike?: (postId: string) => Promise<void> | void
  onSave?: (postId: string) => Promise<void> | void
}

export function PostCard({ post, className, onLike, onSave }: PostCardProps) {
  const [likes, setLikes] = useState(post.likesCount || 0)
  const [liked, setLiked] = useState(!!post.likedByCurrentUser)
  const [saved, setSaved] = useState(!!post.savedByCurrentUser)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)

  const handleLike = async () => {
    setLiked((v) => !v)
    setLikes((n) => (liked ? Math.max(0, n - 1) : n + 1))
    try {
      await onLike?.(post.id)
    } catch (e) {
      // rollback em caso de erro
      setLiked((v) => !v)
      setLikes((n) => (liked ? n + 1 : Math.max(0, n - 1)))
    }
  }

  const handleSave = async () => {
    setSaved((v) => !v)
    try {
      await onSave?.(post.id)
    } catch (e) {
      setSaved((v) => !v)
    }
  }

  return (
    <article className={cn('rounded-xl border p-4 shadow-sm', className)}>
      <header className='mb-3 flex items-center gap-3'>
        <div className='bg-muted h-10 w-10 overflow-hidden rounded-full'>
          {post.author?.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt={post.author.name}
              width={40}
              height={40}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center text-sm opacity-60'>
              {post.author?.name?.[0] ?? 'U'}
            </div>
          )}
        </div>
        <div>
          <div className='text-sm font-medium'>{post.author?.name}</div>
          <div className='text-muted-foreground text-xs'>
            @{post.author?.username}
          </div>
        </div>
        <div className='text-muted-foreground ml-auto text-xs'>
          {useMemo(() => {
            try {
              // Formatação determinística para evitar diferença servidor/cliente
              return new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
                timeZone: 'UTC'
              }).format(new Date(post.createdAt))
            } catch {
              return ''
            }
          }, [post.createdAt])}
        </div>
      </header>

      {post.content && (
        <p className='mb-3 text-sm leading-relaxed whitespace-pre-wrap'>
          {post.content}
        </p>
      )}

      {post.imageUrl && (
        <Dialog.Root open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
          <Dialog.Trigger asChild>
            <div className='relative mb-3 max-h-[500px] w-full cursor-pointer overflow-hidden rounded-lg transition-opacity hover:opacity-95'>
              <Image
                src={post.imageUrl}
                alt='post image'
                width={800}
                height={600}
                className='h-auto max-h-[500px] w-full rounded-lg object-cover'
              />
            </div>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm' />
            <Dialog.Content className='fixed inset-0 z-50 flex items-center justify-center p-4'>
              <div className='relative h-full max-h-[90vh] w-full max-w-7xl'>
                <Dialog.Close asChild>
                  <button
                    className='absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70'
                    aria-label='Fechar'
                  >
                    <X className='h-6 w-6' />
                  </button>
                </Dialog.Close>
                <div className='relative h-full w-full'>
                  <Image
                    src={post.imageUrl}
                    alt='post image full size'
                    fill
                    className='object-contain'
                    quality={100}
                  />
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      <footer className='mt-2 flex items-center gap-10'>
        <Button
          variant={liked ? 'default' : 'outline'}
          size='sm'
          onClick={handleLike}
        >
          <Heart className='h-4 w-4' /> {likes}
        </Button>
        <Button
          variant={liked ? 'default' : 'outline'}
          size='sm'
          onClick={handleLike}
        >
          <MessageCircle className='h-4 w-4' /> {likes}
        </Button>
        <Button
          variant={liked ? 'default' : 'outline'}
          size='sm'
          onClick={handleLike}
        >
          <Repeat2 className='h-4 w-4' /> {likes}
        </Button>
        <Button
          variant={saved ? 'default' : 'outline'}
          size='sm'
          onClick={handleSave}
        >
          <Bookmark className='h-4 w-4' /> {saved ? 1 : 0}
        </Button>
      </footer>
    </article>
  )
}
