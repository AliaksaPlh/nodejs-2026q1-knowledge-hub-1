import { Injectable } from '@nestjs/common';
import type { Article, Category, Comment, User } from '../types';

/**
 * In-memory persistence adapter. Swap this implementation for a DB-backed
 * repository layer when introducing a database without changing domain services.
 */
@Injectable()
export class MemoryStorageService {
  readonly users = new Map<string, User>();
  readonly categories = new Map<string, Category>();
  readonly articles = new Map<string, Article>();
  readonly comments = new Map<string, Comment>();
}
