import { 
  Body, 
  Controller, 
  Get, 
  HttpException, 
  HttpStatus, 
  Post, 
  Req, 
  Res, 
  Headers, 
  UnauthorizedException 
} from "@nestjs/common";
import { UserService } from "src/services/user/user.service";
import { RegisterUserDto } from "../dtos/user/register.user.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { User } from "src/entities/user.entity";
import { AuthService } from "src/auth/auth.service";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { Request, Response } from "express";
import { JwtService } from "src/auth/jwt.service";
import { LoginAdminDto } from "src/dtos/administrator/login.admin.dto";

@Controller('auth')
export class AuthController {
  constructor(
      private readonly userService: UserService,
      private readonly authService: AuthService,
      private readonly jwtService: JwtService,
  ) {}

  @Get('/user/me')
  async getUserProfile(
      @Req() req: Request, 
      @Headers('authorization') authorization: string
  ): Promise<User | ApiResponse> {
      const token = authorization?.replace(/^Bearer\s+/, '');
      if (!token) {
          return new ApiResponse('error', -1011, 'Token failed.');
      }
      const userData = this.jwtService.verifyAndGetUserData(token);

      if (userData) {
          const userId = userData.userId;
          const user = await this.userService.getById(userId);
          if (user) {
              req.user = userId;
              return user;
          } else {
              return new ApiResponse('error', -1011, 'Token failed.');
          }
      } else {
          return new ApiResponse('error', -1011, 'Token failed.');
      }
  }

  @Post('/login')
  async login(
      @Body() loginDto: LoginUserDto
  ): Promise<{ token: string, role: string, user?: User }> {
      const userOrAdmin = await this.authService.validateUser(loginDto.email, loginDto.password) 
          || await this.authService.validateAdmin(loginDto.email, loginDto.password);

      if (!userOrAdmin) {
          throw new UnauthorizedException('Invalid credentials');
      }

      const isAdmin = userOrAdmin.hasOwnProperty('adminId');
      const token = isAdmin
          ? await this.authService.loginAdmin(loginDto as LoginAdminDto)
          : await this.authService.login(loginDto);

      const role = isAdmin ? 'admin' : 'user';

      if (!isAdmin) {
          const user = await this.authService.getUserDetails(loginDto.email);
          return { token, user, role };
      }

      return { token, role };
  }

  @Post('/user/register')
  register(
      @Body() data: RegisterUserDto
  ): Promise<User | ApiResponse> {
      return this.userService.registerUser(data);
  }

  @Post('/user/online-status')
  async updateOnlineStatus(
      @Headers('authorization') authorization: string, 
      @Body() status: { isOnline: boolean }
  ): Promise<User | ApiResponse> {
      const token = authorization?.replace(/^Bearer\s+/, '');
      if (!token) {
          throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
      }

      const userData = this.jwtService.verifyAndGetUserData(token);
      if (!userData) {
          throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      }

      const userId = userData.userId;
      const user = await this.userService.getById(userId);
      if (!user || user instanceof ApiResponse) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user instanceof User) {
          user.onlineStatus = status.isOnline;
          await this.userService.updateUser(userId, { onlineStatus: status.isOnline });
      }

      return new ApiResponse('success', 0, 'Online status updated');
  }

}
