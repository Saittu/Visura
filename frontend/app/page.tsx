import { PostCard } from './_components/post/PostCard'
import type { Post } from '@visura/shared'

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
    content: 'Design do card de post pronto! 😄',
    createdAt: new Date(),
    updatedAt: new Date(),
    likesCount: 5
  }
]

export default function HomePage() {
  return (
    <main className='mx-auto max-w-2xl p-4'>
      <div className='grid gap-4'>
        {mockPosts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </main>
  )
}
