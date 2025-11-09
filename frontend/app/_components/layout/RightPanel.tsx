'use client'
import { UserPlus, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface SuggestedUser {
  id: string
  username: string
  name: string
  avatarUrl?: string
  reason?: string
}

interface TrendingTopic {
  tag: string
  posts: number
  delta?: number // variação ou crescimento
}

const mockUsers: SuggestedUser[] = [
  {
    id: 'u10',
    username: 'maria',
    name: 'Maria Oliveira',
    avatarUrl: '/avatar3.png',
    reason: 'Seguido por @saittu'
  },
  {
    id: 'u11',
    username: 'devlucas',
    name: 'Lucas Dev',
    avatarUrl: '/avatar4.png',
    reason: 'Novo na plataforma'
  },
  {
    id: 'u12',
    username: 'ana.design',
    name: 'Ana Design',
    avatarUrl: '/avatar5.png',
    reason: 'Popular em UI'
  }
]

const mockTopics: TrendingTopic[] = [
  { tag: 'nestjs', posts: 128, delta: 12 },
  { tag: 'designsystem', posts: 94, delta: 7 },
  { tag: 'react19', posts: 210, delta: 25 },
  { tag: 'prisma', posts: 76, delta: 5 }
]

export function RightPanel() {
  return (
    <aside className='hidden w-80 pt-6 pr-4 lg:block'>
      <div className='sticky top-4 space-y-6'>
        {/* Busca ampla */}
        <div>
          <label className='relative block'>
            <input
              placeholder='Buscar...'
              className='bg-background focus:ring-primary w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2'
            />
            <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs'>
              /⌘K
            </span>
          </label>
        </div>

        {/* Pessoas para seguir */}
        <div className='bg-card/50 rounded-xl border p-4 backdrop-blur-sm'>
          <h3 className='mb-3 text-sm font-semibold tracking-wide'>
            Pessoas para seguir
          </h3>
          <ul className='space-y-3'>
            {mockUsers.map((u) => (
              <li key={u.id} className='flex items-center gap-3'>
                <div className='bg-muted h-9 w-9 overflow-hidden rounded-full' />
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{u.name}</p>
                  <p className='text-muted-foreground truncate text-xs'>
                    @{u.username}
                  </p>
                  {u.reason && (
                    <p className='text-muted-foreground/70 truncate text-[10px]'>
                      {u.reason}
                    </p>
                  )}
                </div>
                <button className='group hover:bg-primary hover:text-primary-foreground rounded-full border px-3 py-1 text-xs font-medium transition-colors'>
                  Seguir
                </button>
              </li>
            ))}
          </ul>
          <div className='mt-4'>
            <Link
              href='/explorar'
              className='text-primary text-xs hover:underline'
            >
              Ver mais sugestões
            </Link>
          </div>
        </div>

        {/* Tópicos em alta */}
        <div className='bg-card/50 rounded-xl border p-4 backdrop-blur-sm'>
          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide'>
            <TrendingUp className='h-4 w-4' /> Tópicos em alta
          </h3>
          <ul className='space-y-2'>
            {mockTopics.map((t) => (
              <li
                key={t.tag}
                className='hover:bg-accent/70 group flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5'
              >
                <div className='min-w-0'>
                  <p className='group-hover:text-primary truncate text-sm font-medium'>
                    #{t.tag}
                  </p>
                  <p className='text-muted-foreground text-[11px]'>
                    {t.posts} posts • +{t.delta}
                  </p>
                </div>
                <span className='text-muted-foreground group-hover:text-primary text-[10px]'>
                  Ver
                </span>
              </li>
            ))}
          </ul>
          <div className='mt-3'>
            <Link
              href='/posts/trending'
              className='text-primary text-xs hover:underline'
            >
              Explorar tópicos
            </Link>
          </div>
        </div>

        {/* Espaço para futuras widgets (ex: anúncios / eventos / CTA) */}
        <div className='text-muted-foreground/70 rounded-xl border p-4 text-center text-xs'>
          <p>Beta • Ideias? Envie feedback.</p>
        </div>
      </div>
    </aside>
  )
}
