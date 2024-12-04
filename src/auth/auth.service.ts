import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import * as bcrypt from "bcrypt";
import { Request } from "express";
import { UserService } from "src/services/user/user.service";
import { User } from "src/entities/user.entity";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { AdminService } from "src/services/administrator/admin.service";
import { LoginAdminDto } from "src/dtos/administrator/login.admin.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly adminService: AdminService,
    ) {}

    async validateAdmin(email: string, password: string): Promise<any> {
        const admin = await this.adminService.getAdminEmail(email);
        if (admin && bcrypt.compare(password, admin.passwordHash)) {
          return admin;
        }
        return null;
      }

      async loginAdmin(loginAdminDto: LoginAdminDto): Promise<string> {
        const admin = await this.validateAdmin(loginAdminDto.email, loginAdminDto.password);
        if (!admin) {
          throw new UnauthorizedException('Invalid admin credentials');
        }
    
        const tokenPayload = { adminId: admin.id, role: 'admin' };
        return this.jwtService.sign(tokenPayload);
      }

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

    async getUserDetails(email: string): Promise<User> {
      return await this.userService.getUserEmail(email);
    }
    

    async getCurrentUser(req: Request) {
        return req['user'];
      }
}