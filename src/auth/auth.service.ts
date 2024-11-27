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
        private readonly userService: UserService,
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
    
        const updatedUser = await this.userService.updateLastLogin(user.userId);
    
        const userFarToken = {
            userId: updatedUser.userId,
            email: updatedUser.email,
        };
    
        const token = this.jwtService.sign(userFarToken);
      
        await this.userService.updateUser(updatedUser.userId, updatedUser);
    
        return token;
    }
    

      async logout(userId: number): Promise<void> {
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new UnauthorizedException();
        }

        const updateData = { onlineStatus: false };

       return await this.userService.updateUser(userId, updateData);
    }

      async getCurrentUser(req: Request) {
        return req['user'];
      }
}