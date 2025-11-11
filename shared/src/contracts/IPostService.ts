import type {
  CreatePostDto,
  Post,
  PostListQuery,
  PaginatedPosts
} from '../types/post.types'

/**
 * Contrato do serviço de Posts consumido pelo frontend/BFF.
 * Mantém a aplicação desacoplada da implementação (NestJS, outro backend, etc.).
 *
 * Observação: a autenticação (usuário atual) é inferida pelo contexto
 * da implementação (ex.: cookie httpOnly no BFF). Por isso não passamos userId aqui.
 */
export interface IPostService {
  /**
   * Cria um novo post para o usuário autenticado.
   */
  create(data: CreatePostDto): Promise<Post>

  /**
   * Lista posts com paginação por cursor e filtros opcionais.
   */
  list(query: PostListQuery): Promise<PaginatedPosts>
}
