import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { PaginatedResult } from '../types';
import { toListOrPaginated } from '../common/utils/paginate-and-sort';
import { MemoryStorageService } from '../storage/memory-storage.service';
import type { Comment } from '../types';
import { CommentByArticleQueryDto } from './dto/comment-by-article.query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly storage: MemoryStorageService) {}

  findByArticle(
    query: CommentByArticleQueryDto,
  ): Array<Comment> | PaginatedResult<Comment> {
    const list = Array.from(this.storage.comments.values()).filter(
      (c) => c.articleId === query.articleId,
    );
    return toListOrPaginated(
      list as unknown as Array<Record<string, unknown>>,
      query,
      {
        sortBy: query.sortBy,
        order: query.order,
        allowedSortKeys: ['createdAt', 'content'],
        defaultSortBy: 'createdAt',
      },
    ) as unknown as Array<Comment> | PaginatedResult<Comment>;
  }

  async create(dto: CreateCommentDto): Promise<Comment> {
    if (!this.storage.articles.has(dto.articleId)) {
      throw new UnprocessableEntityException(
        `Article with id ${dto.articleId} not found`,
      );
    }
    if (dto.authorId && !this.storage.users.has(dto.authorId)) {
      throw new BadRequestException(`User with id ${dto.authorId} not found`);
    }
    const now = Date.now();
    const id = randomUUID();
    const comment: Comment = {
      id,
      content: dto.content,
      articleId: dto.articleId,
      authorId: dto.authorId ?? null,
      createdAt: now,
    };
    this.storage.comments.set(id, comment);
    return comment;
  }

  async findOne(id: string): Promise<Comment> {
    const comment = this.storage.comments.get(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return comment;
  }

  async remove(id: string): Promise<void> {
    const comment = this.storage.comments.get(id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    this.storage.comments.delete(id);
  }
}
