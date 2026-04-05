import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';


@Injectable()
export class AccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    void context;
    return true;
  }
}
