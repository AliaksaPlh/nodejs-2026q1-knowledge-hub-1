import { Injectable } from '@nestjs/common';
import type { Article, Comment, User } from '../types';

@Injectable()
export class MemoryStorageService {
  readonly users = new Map<string, User>();
  readonly articles = new Map<string, Article>();
  readonly comments = new Map<string, Comment>();
}
