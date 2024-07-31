import { Injectable } from "@nestjs/common";
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtSecret } from "config/jwt.secret";

@Injectable()
export class JwtService {
    constructor(private readonly jwtService: NestJwtService) {}

    sign(payload: any): string {
        return this.jwtService.sign(payload, { secret: jwtSecret });
    }
    
    verify(token: string): any {
        return this.jwtService.verify(token, { secret: jwtSecret });
    }
}
