import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return next(); 
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
      const user = this.jwtService.verifyAccessToken(token);
      req['user'] = user;
      return next();
    } catch (error) {
      console.warn('Access token invalid, trying refresh token...');

      try {
        const refreshTokenData = this.jwtService.verifyRefreshToken(token);
        const newTokens = this.jwtService.generateTokens(refreshTokenData);
      
        res.setHeader('Authorization', `Bearer ${newTokens.accessToken}`);
        req.headers['authorization'] = `Bearer ${newTokens.accessToken}`;
        req['user'] = refreshTokenData;
      
        return next();
      } catch (refreshError) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }      
    }
  }
}

