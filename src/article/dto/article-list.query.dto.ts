import { IntersectionType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ArticleFilterQueryDto } from './article-filter-query.dto';

export class ArticleListQueryDto extends IntersectionType(
  ArticleFilterQueryDto,
  PaginationQueryDto,
) {
  @IsOptional()
  @IsIn(['title', 'content', 'status', 'createdAt', 'updatedAt'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
