import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePostInputDto } from './dto/create-post.dto'
import { ListPostsQueryDto } from './dto/list-post.dto'
import { Prisma } from '../../../generated/prisma'

export interface PostResponse {
  id: string
  authorId: string
  content: string | null
  imageUrl?: string | null
  createdAt: Date
  updatedAt: Date
  likesCount: number
  savedCount?: number
  author?: {
    id: string
    username: string
    name: string
    avatarUrl?: string | null
  }
  likedByCurrentUser?: boolean
  savedByCurrentUser?: boolean
}

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePostInputDto): Promise<PostResponse> {
    if (!userId) throw new UnauthorizedException('Usuário não autenticado')

    const created = await this.prisma.posts.create({
      data: {
        user_id: userId,
        content: dto.content,
        image_url: dto.imageUrl ?? null
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar_url: true
          }
        }
      }
    })

    // Mapear para contrato compartilhado
    const author = created.users
      ? {
          id: created.users.id,
          username: created.users.username,
          name: created.users.name,
          avatarUrl: created.users.avatar_url ?? null
        }
      : undefined

    const result: PostResponse = {
      id: created.id,
      authorId: created.user_id ?? '',
      content: created.content,
      imageUrl: created.image_url ?? null,
      createdAt: created.created_at ?? new Date(),
      updatedAt: created.updated_at ?? new Date(),
      likesCount: 0,
      savedCount: 0,
      likedByCurrentUser: false,
      savedByCurrentUser: false,
      author
    }

    return result
  }

  async list(query: ListPostsQueryDto, currentUserId?: string) {
    const { cursor, limit = 20, authorId } = query

    let cursorPost: { id: string; created_at: Date | null } | null = null
    if (cursor) {
      cursorPost = await this.prisma.posts.findUnique({
        where: { id: cursor },
        select: { created_at: true, id: true }
      })
    }

    const post = await this.prisma.$queryRaw<any[]>`
      SELECT
        p.id,
        p.user_id as "authorId",
        p.content,
        p.image_url as "imageUrl",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        u.id as "author_id",
        u.username as "author_username",
        u.name as "author_name",
        u.avatar_url as "author_avatarUrl",
        COUNT(DISTINCT l.id) as "likesCount",
        COUNT(DISTINCT s.id) as "savedCount",
        BOOL_OR(ul.id IS NOT NULL) as "likedByCurrentUser",
        BOOL_OR(us.id IS NOT NULL) as "savedByCurrentUser"
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN saved_posts s ON p.id = s.post_id
      LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = ${currentUserId}
      LEFT JOIN saved_posts us ON p.id = us.post_id AND us.user_id = ${currentUserId}
      WHERE
        ${authorId ? Prisma.sql`p.user_id = ${authorId}` : Prisma.sql`1=1`}
        AND ${
          cursorPost
            ? Prisma.sql`(p.created_at, p.id) < (${cursorPost.created_at}, ${cursorPost.id})`
            : Prisma.sql`1=1`
        }
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ${limit + 1}
    `
    const hasMore = post.length > limit
    const items = post.slice(0, limit)
    const nextCursor = hasMore ? items[items.length - 1].id : null

    return {
      items: items.map((row) => ({
        id: row.id,
        authorId: row.authorId,
        content: row.content,
        imageUrl: row.imageUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        likesCount: Number(row.likesCount),
        savedCount: Number(row.savedCount),
        likedByCurrentUser: row.likedByCurrentUser,
        savedByCurrentUser: row.savedByCurrentUser,
        author: {
          id: row.author_id,
          username: row.author_username,
          name: row.author_name,
          avatarUrl: row.author_avatarUrl
        }
      })),
      nextCursor,
      hasMore
    }
  }
}
