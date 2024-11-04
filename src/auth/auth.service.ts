import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import * as bcrypt from "bcrypt";

import { Request } from "express";
import { UserService } from "src/services/user/user.service";
import { User } from "src/entities/user.entity";
import { LoginUserDto } from "src/dtos/user/login.user.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userService.getUserEmail(email);

        if(user && bcrypt.compare(password, user.passwordHash)) {
            return user;
        }
        return null;
    }

    async login(loginUserDto: LoginUserDto): Promise<string> {
        const user = await this.validateUser(
            loginUserDto.email,
            loginUserDto.password
        );
    
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
    
        const userFarToken = {
            userId: user.userId,
            email: user.email,
        };

        const expiresIn = 3600;
    
        const token = this.jwtService.sign(userFarToken, );    
    
        user.onlineStatus = true;
        await this.userService.updateUser(user.userId, user);
    
        return token;
    }

      async logout(userId: number): Promise<void> {
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new UnauthorizedException();
        }

        user.onlineStatus = false;
       return await this.userService.updateUser(userId, user);
    }

      async getCurrentUser(req: Request) {
        return req['user'];
      }
}