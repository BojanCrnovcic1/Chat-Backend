import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import * as bcrypt from "bcrypt";
import { Request } from "express";
import { UserService } from "src/services/user/user.service";
import { User } from "src/entities/user.entity";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { AdminService } from "src/services/administrator/admin.service";
import { LoginAdminDto } from "src/dtos/administrator/login.admin.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { Admin } from "src/entities/admin.entity";

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

      async loginAdmin(loginAdminDto: LoginAdminDto): Promise<{accessToken: string, refreshToken: string}> {
        const admin = await this.validateAdmin(loginAdminDto.email, loginAdminDto.password);
        if (!admin) {
          throw new UnauthorizedException('Invalid admin credentials');
        }
    
        const tokenPayload = { adminId: admin.id, role: 'admin' };
      
        return {
          accessToken: this.jwtService.signAccessToken(tokenPayload),
          refreshToken: this.jwtService.signRefreshToken(tokenPayload)
        }
      }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userService.getUserEmail(email);

        if(user && bcrypt.compare(password, user.passwordHash)) {
            return user;
        }
        return null;
      }

      async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string, refreshToken: string }> {
        const user = await this.validateUser(loginUserDto.email, loginUserDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user) {
          await this.userService.updateLastLogin(user.userId);
        }

        const tokenPayload = { userId: user.userId, email: user.email, role: 'user' };

        const accessToken = this.jwtService.signAccessToken(tokenPayload); 
        const refreshToken = this.jwtService.signRefreshToken(tokenPayload);
        return { accessToken, refreshToken };
    }

    async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
      try {
          const payload = this.jwtService.verifyRefreshToken(refreshToken);
          const newAccessToken = this.jwtService.signAccessToken({ userId: payload.userId, email: payload.email });
          return { accessToken: newAccessToken };
      } catch (error) {
          throw new UnauthorizedException('Invalid or expired refresh token');
      }
  }

    

      async logout(userId: number): Promise<User | ApiResponse> {
        
        if (!userId) {
          throw new UnauthorizedException('User ID is required for logout.');
      }
        const user = await this.userService.getUserById(userId);

        if (!user) {
            throw new UnauthorizedException();
        }

        const updateData = { onlineStatus: false };

       return await this.userService.editUser(userId, updateData);
    }

    async getUserDetails(email: string): Promise<User> {
      return await this.userService.getUserEmail(email);
    }
    
    async getAdminDetalis(email: string): Promise<Admin> {
      return await this.adminService.getAdminEmail(email);
    }

    async getCurrentUser(req: Request) {
        return req['user'];
      }
}