import { Body, Controller, HttpException, HttpStatus, Post, Req, Res } from "@nestjs/common";
import { UserService } from "src/services/user/user.service";
import { RegisterUserDto } from "../dtos/user/register.user.dto";
import { ApiResponse } from "src/misc/api.response.class";
import { User } from "src/entities/user.entity";
import { AuthService } from "src/auth/auth.service";
import { LoginUserDto } from "src/dtos/user/login.user.dto";
import { Request, Response } from "express";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}

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
            res.status(HttpStatus.OK).json({ token });
        } catch (err) {
            throw err;
        }
    }

}
