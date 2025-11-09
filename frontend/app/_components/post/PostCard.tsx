'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { Post } from '@visura/shared'
import { Button } from '../ui/button'
import { useState } from 'react'

import { Heart } from 'lucide-react'
import { Repeat2 } from 'lucide-react'
import { Bookmark } from 'lucide-react'
import { MessageCircle } from 'lucide-react'

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
          {new Date(post.createdAt).toLocaleString()}
        </div>
      </header>

      {post.content && (
        <p className='mb-3 text-sm leading-relaxed whitespace-pre-wrap'>
          {post.content}
        </p>
      )}

      {post.imageUrl && (
        <div className='relative mb-3 h-64 w-full overflow-hidden rounded-lg'>
          <Image
            src={post.imageUrl}
            alt='post image'
            fill
            className='object-cover'
          />
        </div>
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
