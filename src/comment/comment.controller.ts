import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { validate, version } from 'uuid';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @ApiQuery({ name: 'articleId', required: true, type: String })
  findByArticle(@Query('articleId') articleId: string | undefined) {
    if (articleId == null || String(articleId).trim() === '') {
      throw new BadRequestException(
        'articleId query parameter is required',
      );
    }
    if (!validate(articleId) || version(articleId) !== 4) {
      throw new BadRequestException(
        'articleId must be a valid UUID v4',
      );
    }
    return this.commentService.findByArticleId(articleId);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateCommentDto) {
    return this.commentService.create(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.commentService.remove(id);
  }
}
