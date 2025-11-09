// Tipos relacionados a Post compartilhados entre frontend e backend
// Baseado no modelo Prisma `posts` e relacionamento com `Users`

export interface PostAuthor {
  id: string
  username: string
  name: string
  avatarUrl?: string | null
}

export interface Post {
  id: string
  authorId: string
  content?: string | null
  imageUrl?: string | null
  createdAt: Date
  updatedAt: Date
  likesCount: number
  savedCount?: number
  author?: PostAuthor
  likedByCurrentUser?: boolean
  savedByCurrentUser?: boolean
}

export interface CreatePostDto {
  content?: string
  imageUrl?: string
}

export interface UpdatePostDto {
  content?: string
  imageUrl?: string | null
}

export interface PostListQuery {
  cursor?: string
  limit?: number
  authorId?: string
}

export interface PaginatedPosts {
  items: Post[]
  nextCursor?: string
  total?: number
}
