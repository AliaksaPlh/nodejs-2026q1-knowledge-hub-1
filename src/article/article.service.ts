import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MemoryStorageService } from '../storage/memory-storage.service';
import type { Article } from '../types';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly storage: MemoryStorageService) {}

  async create(dto: CreateArticleDto): Promise<Article> {
    if (dto.authorId && !this.storage.users.has(dto.authorId)) {
      throw new BadRequestException(`User with id ${dto.authorId} not found`);
    }
    const now = Date.now();
    const id = uuidv4();
    const article: Article = {
      id,
      title: dto.title,
      content: dto.content,
      status: dto.status,
      authorId: dto.authorId ?? null,
      categoryId: dto.categoryId ?? null,
      tags: dto.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    this.storage.articles.set(id, article);
    return article;
  }

  async findOne(id: string): Promise<Article> {
    const article = this.storage.articles.get(id);
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    return article;
  }

  async remove(id: string): Promise<void> {
    const article = this.storage.articles.get(id);
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    this.storage.articles.delete(id);
    for (const [commentId, comment] of this.storage.comments.entries()) {
      if (comment.articleId === id) {
        this.storage.comments.delete(commentId);
      }
    }
  }
}
