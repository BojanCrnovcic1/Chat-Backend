import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from './jwt.service';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    if (!token) {
      return false;
    }

    const user = this.jwtService.verify(token);
    if (!user || !roles.includes(user.role)) {
      return false;
    }

    return true;
  }
}