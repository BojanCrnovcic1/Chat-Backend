import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'];
    if (!token) {
      return next();
    }

    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = this.jwtService.verify(tokenParts[1]);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req['user'] = {
      ...user,
      role: user.adminId ? 'admin' : 'user',
    };

   // req['user'] = user;
    
    next();
  }
}