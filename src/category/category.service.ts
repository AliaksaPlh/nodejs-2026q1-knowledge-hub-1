import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MemoryStorageService } from '../storage/memory-storage.service';
import type { Category } from '../types';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly storage: MemoryStorageService) {}

  async findAll(): Promise<Array<Category>> {
    return Array.from(this.storage.categories.values());
  }

  async findOne(id: string): Promise<Category> {
    const category = this.storage.categories.get(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      name: dto.name,
      description: dto.description,
    };
    this.storage.categories.set(id, category);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = this.storage.categories.get(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    category.name = dto.name;
    category.description = dto.description;
    this.storage.categories.set(id, category);
    return category;
  }

  async remove(id: string): Promise<void> {
    const category = this.storage.categories.get(id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    this.storage.categories.delete(id);
    for (const article of this.storage.articles.values()) {
      if (article.categoryId === id) {
        article.categoryId = null;
        article.updatedAt = Date.now();
      }
    }
  }
}
