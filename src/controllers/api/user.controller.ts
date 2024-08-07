import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { UpdateUserDto } from "src/dtos/user/update.user.dto";
import { BannedUser } from "src/entities/banned-user.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { BannedUserService } from "src/services/bannedUser/banned-user.service";
import { UserService } from "src/services/user/user.service";

@Controller('api/user')
export class UserController {
    constructor(
        private userService: UserService,
        private bannedUserService: BannedUserService,
    ) {}

    @Get()
    allUser(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @Get(':id')
    getUserById(@Param('id') userId: number): Promise<User | ApiResponse> {
        return this.userService.getUserById(userId);
    }

    @Get('username')
    getNameUser(@Query('username') username: string): Promise<User[]> {
        return this.userService.getUsersUsernames(username)
    }

    @Patch(':id/edit')
    updateUser(@Param('id') userId: number, @Body() data: UpdateUserDto): Promise<User | ApiResponse> {
        return this.userService.editUser(userId, data);
    }

    @Post('ban')
    banUser(@Body('chatRoomId') chatRoomId: number, @Body('userId') userId: number): Promise<BannedUser | ApiResponse> {
        return this.bannedUserService.banUser(chatRoomId, userId);
    }

    @Delete('unban')
    unbanUser(@Body('chatRoomId') chatRoomId: number, @Body('userId') userId: number): Promise<BannedUser | ApiResponse> {
        return this.bannedUserService.unbanUser(chatRoomId, userId);
    }

    @Delete(':id')
    deleteAcc(@Param('id') userId: number): Promise<User | ApiResponse> {
        return this.userService.deleteUser(userId);
    }
}