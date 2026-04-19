import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CommentByArticleQueryDto extends PaginationQueryDto {
  @IsUUID('4')
  articleId: string;

  @IsOptional()
  @IsIn(['createdAt', 'content'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
