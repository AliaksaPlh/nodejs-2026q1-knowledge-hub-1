import { Injectable } from '@nestjs/common';
import type { Article, Category, Comment, User } from '../types';


@Injectable()
export class MemoryStorageService {
  readonly users = new Map<string, User>();
  readonly categories = new Map<string, Category>();
  readonly articles = new Map<string, Article>();
  readonly comments = new Map<string, Comment>();
}
