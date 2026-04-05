import { Module } from '@nestjs/common';
import { ArticleModule } from './article/article.module';
import { CommentModule } from './comment/comment.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [StorageModule, UserModule, ArticleModule, CommentModule],
})
export class AppModule {}
