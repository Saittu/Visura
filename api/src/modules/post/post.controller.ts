import {
  Body,
  Controller,
  Get,
  Post as HttpPost,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PostService, PostResponse } from './post.service'
import { CreatePostInputDto } from './dto/create-post.dto'
import { ListPostsQueryDto } from './dto/list-post.dto'

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpPost()
  @UseInterceptors(FilesInterceptor('media', 10)) // Aceita até 10 arquivos com campo 'media'
  async create(
    @Req() req: any,
    @Body() dto: CreatePostInputDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ): Promise<PostResponse> {
    const userId = req.user?.userId
    return this.postService.create(userId, dto, files)
  }
  @Get()
  async listPost(@Req() req: any, @Query() query: ListPostsQueryDto) {
    const userId = req.user?.userId
    return this.postService.list(query, userId)
  }
}
