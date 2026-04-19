import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { AccessGuard } from './common/guards/access.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { CategoryModule } from './category/category.module';
import { CommentModule } from './comment/comment.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    StorageModule,
    UserModule,
    CategoryModule,
    ArticleModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: AccessGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
