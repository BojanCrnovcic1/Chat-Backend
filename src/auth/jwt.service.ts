import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtSecret } from "config/jwt.secret";
import { ApiResponse } from "src/misc/api.response.class";

@Injectable()
export class JwtService {
    constructor(private readonly jwtService: NestJwtService) {}

    sign(payload: any): string {
        return this.jwtService.sign(payload, { secret: jwtSecret });
    }
    
    verify(token: string): any {
        return this.jwtService.verify(token, { secret: jwtSecret });
    }

    verifyAndGetUserData(token: string): any {
        try {
          const decoded = this.jwtService.verify(token, {secret: jwtSecret});
          return decoded;
        } catch (error) {
          console.error('Greška prilikom verifikacije JWT:', error);
           return new ApiResponse('error', -1011, 'Token decoding failed.');
        }
      }
}
