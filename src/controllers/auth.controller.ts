import { 
    Body, 
    Controller, 
    Get, 
    HttpException, 
    HttpStatus, 
    Post, 
    Req,  
    Headers, 
    UnauthorizedException, 
    Res
} from "@nestjs/common";
import { UserService } from "src/services/user/user.service";
import { ApiResponse } from "src/misc/api.response.class";
import { User } from "src/entities/user.entity";
import { AuthService } from "src/auth/auth.service";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { Request, Response } from "express";
import { JwtService } from "src/auth/jwt.service";
import { LoginAdminDto } from "src/dtos/administrator/login.admin.dto";
import { RegisterUserDto } from "src/dtos/user/register.user.dto";
import { Admin } from "src/entities/admin.entity";
import { AdminService } from "src/services/administrator/admin.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
    ) {}

    @Post('/login')
    async login(
        @Body() loginDto: LoginUserDto
    ): Promise<{ accessToken: string; refreshToken: string; role: string; user?: User, admin?: Admin }> {
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
            return { ...token, user, role };
        }

        if (isAdmin) {
            const admin = await this.authService.getAdminDetalis(loginDto.email);
            return {...token, admin, role}
        }
    }
 
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

    @Get('/admin/me')
    async getAdminProfile(
        @Req() req: Request, 
        @Headers('authorization') authorization: string
    ): Promise<Admin | ApiResponse> {
        const token = authorization?.replace(/^Bearer\s+/, '');
        if (!token) {
            return new ApiResponse('error', -1011, 'Token failed.');
        }
        const adminData = this.jwtService.verifyAndGetUserData(token);

        if (adminData) {
            const adminId = adminData.adminId
            const admin = await this.adminService.getById(adminId);
            if (admin) {
                req.admin = adminId;
                return admin;
            } else {
                return new ApiResponse('error', -1011, 'Token failed.');
            }
        } else {
            return new ApiResponse('error', -1011, 'Token failed.');
        }
    }

    @Post('/refresh')
    async refreshToken(@Body('refreshToken') refreshToken: string): Promise<{ accessToken: string }> {
       try {
           const payload = this.jwtService.verifyRefreshToken(refreshToken);
           const newAccessToken = this.jwtService.signAccessToken({
                 userId: payload.userId,
                 email: payload.email,
                 role: payload.role,
               });

               return { accessToken: newAccessToken };
           } catch (error) {
            if (typeof error === 'object' && error !== null && 'name' in error) {
                const jwtError = error as { name: string; message: string };
          
                if (jwtError.name === 'TokenExpiredError') {
                  throw new UnauthorizedException('Refresh token has expired.');
                } else if (jwtError.name === 'JsonWebTokenError') {
                  throw new UnauthorizedException('Invalid refresh token.');
                }
              }
             throw new UnauthorizedException('Invalid or expired refresh token.');
         }
    }

    @Post('/refresh')
async refresh(@Body('refreshToken') refreshToken: string, @Res() res: Response) {
  try {
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    const newAccessToken = this.jwtService.signAccessToken({
      userId: payload.userId,
      role: payload.role,
    });

    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'name' in error) {
      const jwtError = error as { name: string; message: string };

      if (jwtError.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token has expired.');
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid refresh token.');
      }
    }

    throw new UnauthorizedException('Failed to process refresh token.');
  }
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
            await this.userService.editUser(userId, { onlineStatus: status.isOnline });
        }

        return new ApiResponse('success', 0, 'Online status updated');
    }
}

