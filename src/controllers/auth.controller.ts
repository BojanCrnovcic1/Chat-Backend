import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, Res, Headers } from "@nestjs/common";
import { UserService } from "src/services/user/user.service";
import { RegisterUserDto } from "../dtos/user/register.user.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { User } from "src/entities/user.entity";
import { AuthService } from "src/auth/auth.service";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { Request, Response } from "express";
import { JwtService } from "src/auth/jwt.service";
import { AdminService } from "src/services/administrator/admin.service";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly adminService: AdminService,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService,
    ) {}

    @Get('/user/me')
    async getUserProfile(@Req() req: Request, @Headers('authorization') authorization: string): Promise<User | ApiResponse> {
        const token = authorization?.replace(/^Bearer\s+/, '');
        if (!token) {
            return new ApiResponse('error', -1011, 'Token failed.')
        }
        const jwtService = this.jwtService;
        const userData = jwtService.verifyAndGetUserData(token);

        if (userData) {
            const userId = userData.userId;
            const user = await this.userService.getById(userId);
            if (user) {
                req.user = userId;
                return user;
            } else {
                return new ApiResponse('error', -1011, 'Token failed.')
            }
        } else {
            return new ApiResponse('error', -1011, 'Token failed.')
        }
    }

    @Post('/user/register')
    register(@Body() data: RegisterUserDto): Promise<User | ApiResponse> {
        return this.userService.registerUser(data);
    }

    @Post('/user/login')
    async login(@Body() data: LoginUserDto, @Res() res: Response) {
        try {
            const token = await this.authService.login(data);
            if (!token) {
                throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
            }
            
            const user = await this.userService.getUserEmail(data.email);
            if (!user) {
                throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
            }

            user.onlineStatus = true;
            await this.userService.updateUser(user.userId, { onlineStatus: true });

            res.status(HttpStatus.OK).json({ token, user });
        } catch (err) {
            throw err;
        }
    }

    @Post('/user/online-status')
async updateOnlineStatus(@Headers('authorization') authorization: string, @Body() status: { isOnline: boolean }): Promise<User | ApiResponse> {
    const token = authorization?.replace(/^Bearer\s+/, '');
    if (!token) {
        throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
    }

    const jwtService = this.jwtService;
    const userData = jwtService.verifyAndGetUserData(token);
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
