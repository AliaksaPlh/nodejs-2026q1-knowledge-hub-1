import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { UserRole } from '../enum';
import type { PaginatedResult } from '../types';
import { toListOrPaginated } from '../common/utils/paginate-and-sort';
import { MemoryStorageService } from '../storage/memory-storage.service';
import type { User } from '../types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import type { UserListQueryDto } from './dto/user-list.query.dto';

export type PublicUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(private readonly storage: MemoryStorageService) {}

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(
    query: UserListQueryDto,
  ): Promise<Array<PublicUser> | PaginatedResult<PublicUser>> {
    const users = Array.from(this.storage.users.values()).map((u) =>
      this.toPublicUser(u),
    );
    return toListOrPaginated(
      users as unknown as Array<Record<string, unknown>>,
      query,
      {
        sortBy: query.sortBy,
        order: query.order,
        allowedSortKeys: ['login', 'role', 'createdAt', 'updatedAt'],
        defaultSortBy: 'createdAt',
      },
    ) as Array<PublicUser> | PaginatedResult<PublicUser>;
  }

  async findOne(id: string): Promise<PublicUser> {
    const user = this.storage.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.toPublicUser(user);
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const now = Date.now();
    const id = randomUUID();
    const role = dto.role ?? UserRole.VIEWER;
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user: User = {
      id,
      login: dto.login,
      password: hashedPassword,
      role,
      createdAt: now,
      updatedAt: now,
    };
    this.storage.users.set(id, user);
    return this.toPublicUser(user);
  }

  async updatePassword(
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<PublicUser> {
    const user = this.storage.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const matches = await bcrypt.compare(dto.oldPassword, user.password);
    if (!matches) {
      throw new ForbiddenException('Old password is incorrect');
    }
    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.updatedAt = Date.now();
    this.storage.users.set(id, user);
    return this.toPublicUser(user);
  }

  async remove(id: string): Promise<void> {
    const user = this.storage.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    this.storage.users.delete(id);
    for (const article of this.storage.articles.values()) {
      if (article.authorId === id) {
        article.authorId = null;
        article.updatedAt = Date.now();
      }
    }
    const commentIdsToRemove: Array<string> = [];
    for (const [commentId, comment] of this.storage.comments.entries()) {
      if (comment.authorId === id) {
        commentIdsToRemove.push(commentId);
      }
    }
    for (const commentId of commentIdsToRemove) {
      this.storage.comments.delete(commentId);
    }
  }
}
