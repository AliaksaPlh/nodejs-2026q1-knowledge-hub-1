import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ArticleStatus } from '../../enum';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ArticleStatus)
  status: ArticleStatus;

  @IsOptional()
  @IsUUID('4')
  authorId: string | null;

  @IsOptional()
  @IsUUID('4')
  categoryId: string | null;

  @IsArray()
  @IsString({ each: true })
  tags: Array<string>;
}
