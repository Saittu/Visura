import { PostCard } from './_components/post/PostCard'
import type { Post } from '@visura/shared'
import { RightPanel } from './_components/layout/RightPanel'
import Navegacao from './_components/layout/navegacao'
import MainShell from './_components/layout/MainShell'

// Mock inicial para desenvolvimento de layout
const mockPosts: Post[] = [
  {
    id: '1',
    authorId: 'u1',
    author: {
      id: 'u1',
      username: 'saittu',
      name: 'Saittu',
      avatarUrl: '/avatar1.png'
    },
    content: 'Meu primeiro post na Visura! 🚀',
    imageUrl: '/post1.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
    likesCount: 12,
    savedCount: 3,
    likedByCurrentUser: true,
    savedByCurrentUser: false
  },
  {
    id: '2',
    authorId: 'u2',
    author: {
      id: 'u2',
      username: 'jane',
      name: 'Jane Doe',
      avatarUrl: '/avatar2.png'
    },
    content: 'Design do card de post pronto!',
    createdAt: new Date(),
    updatedAt: new Date(),
    likesCount: 5
  }
]

// Post mock expandido (exemplo de post "rico")
const expandedPost: Post = {
  id: '3',
  authorId: 'u3',
  author: {
    id: 'u3',
    username: 'carol.tech',
    name: 'Carol Tech',
    avatarUrl: '/avatar6.png'
  },
  content: `Lançamento da API Visura v1.0! 🎉
Principais ganhos:
• Cookies httpOnly para segurança
• Interface compartilhada (@visura/shared)
• Facilidade para evoluir domínio sem quebrar o cliente`,
  createdAt: new Date(),
  updatedAt: new Date(),
  likesCount: 34,
  savedCount: 9,
  likedByCurrentUser: false,
  savedByCurrentUser: false
}

export default function HomePage() {
  return (
    <MainShell navigation={<Navegacao />} rightPanel={<RightPanel />}>
      <div className='pt-6'>
        <div className='bg-card/40 mb-6 rounded-xl border p-4 backdrop-blur-sm'>
          <h2 className='mb-2 text-sm font-semibold tracking-wide'>
            Post em destaque
          </h2>
          <PostCard post={expandedPost} />
        </div>
        <div className='grid gap-4'>
          {mockPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </MainShell>
  )
}
