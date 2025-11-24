'use client'
import { PostCard } from './_components/post/PostCard'
import type { Post } from '@visura/shared'
import { RightPanel } from './_components/layout/RightPanel'
import Navegacao from './_components/layout/navegacao'
import MainShell from './_components/layout/MainShell'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/posts?limit=20')

      if (res.status === 401) {
        // Usuário não autenticado, redireciona para login
        router.push('/auth/login')
        return
      }

      if (!res.ok) {
        throw new Error('Falha ao carregar posts')
      }

      const data = await res.json()
      // API retorna { items, nextCursor, hasMore }
      setPosts(data.items || [])
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handlePostCreated = useCallback((newPost: Post) => {
    // Adiciona novo post no topo da lista
    setPosts((prev) => [newPost, ...prev])
  }, [])

  return (
    <MainShell
      navigation={<Navegacao onPostCreated={handlePostCreated} />}
      rightPanel={<RightPanel />}
    >
      <div className='pt-6'>
        {loading && (
          <div className='text-muted-foreground py-8 text-center text-sm'>
            Carregando posts...
          </div>
        )}

        {error && (
          <div className='bg-destructive/10 text-destructive border-destructive/20 mb-6 rounded-xl border p-4'>
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className='py-12 text-center'>
            <p className='text-muted-foreground mb-2'>Nenhum post ainda</p>
            <p className='text-muted-foreground text-xs'>
              Seja o primeiro a publicar! 🚀
            </p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className='grid gap-4'>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </MainShell>
  )
}
