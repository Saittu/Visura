import {
  Body,
  Controller,
  Get,
  Post as HttpPost,
  Query,
  Req,
  UseGuards
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PostService, PostResponse } from './post.service'
import { CreatePostInputDto } from './dto/create-post.dto'
import { ListPostsQueryDto } from './dto/list-post.dto'

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpPost()
  async create(
    @Req() req: any,
    @Body() dto: CreatePostInputDto
  ): Promise<PostResponse> {
    const userId = req.user?.userId
    return this.postService.create(userId, dto)
  }
  @Get()
  async listPost(@Query() query: ListPostsQueryDto) {
    return this.postService.list(query)
  }
}
