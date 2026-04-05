import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MemoryStorageService } from '../storage/memory-storage.service';
import type { Article } from '../types';
import { ArticleFilterQueryDto } from './dto/article-filter-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Injectable()
export class ArticleService {
  constructor(private readonly storage: MemoryStorageService) {}

  private ensureCategoryExists(categoryId: string | null | undefined): void {
    if (categoryId == null) {
      return;
    }
    if (!this.storage.categories.has(categoryId)) {
      throw new BadRequestException(`Category with id ${categoryId} not found`);
    }
  }

  async findAll(query: ArticleFilterQueryDto): Promise<Array<Article>> {
    let list = Array.from(this.storage.articles.values());
    if (query.status != null) {
      list = list.filter((a) => a.status === query.status);
    }
    if (query.categoryId != null) {
      list = list.filter((a) => a.categoryId === query.categoryId);
    }
    if (query.tag != null && query.tag !== '') {
      list = list.filter((a) => a.tags.includes(query.tag));
    }
    return list;
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    if (dto.authorId && !this.storage.users.has(dto.authorId)) {
      throw new BadRequestException(`User with id ${dto.authorId} not found`);
    }
    this.ensureCategoryExists(dto.categoryId ?? null);
    const now = Date.now();
    const id = randomUUID();
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

  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    const article = this.storage.articles.get(id);
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    if (dto.categoryId !== undefined) {
      this.ensureCategoryExists(dto.categoryId ?? null);
    }
    if (dto.title !== undefined) {
      article.title = dto.title;
    }
    if (dto.content !== undefined) {
      article.content = dto.content;
    }
    if (dto.status !== undefined) {
      article.status = dto.status;
    }
    if (dto.categoryId !== undefined) {
      article.categoryId = dto.categoryId ?? null;
    }
    if (dto.tags !== undefined) {
      article.tags = dto.tags;
    }
    article.updatedAt = Date.now();
    this.storage.articles.set(id, article);
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
