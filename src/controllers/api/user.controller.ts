import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import { Request } from "express";
import multer from "multer";
import { basename, extname } from "path";
import { AuthService } from "src/auth/auth.service";
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
        private authService: AuthService,
    ) {}

    @Get()
    allUser(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @Get('search')
    searchUsersByUsername(@Query('username') username: string): Promise<User[]> {
    return this.userService.getSearch(username);
    }

    @Get(':id')
    getUserById(@Param('id') userId: number): Promise<User | ApiResponse> {   
        return this.userService.getUserById(userId);
    }

    @Patch(':id/edit')
    updateUser(@Param('id') userId: number, @Body() data: UpdateUserDto): Promise<User | ApiResponse> {
        return this.userService.editUser(userId, data);
    }

    @Post('upload-profilePicture')
    @UseInterceptors(
        FileInterceptor('profilePhoto', {
            storage: multer.diskStorage({
                destination: StorageConfig.image.destination,
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const ext = extname(file.originalname).toLowerCase();
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                }
            }),
            fileFilter(req, file, cb) {
                const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
                const ext = extname(file.originalname).toLowerCase();
                if (allowedExtensions.includes(ext)) {
                cb(null, true);
               } 
             }
        })
    )
    async uploadPrifilePhoto(@Req() req: Request, @UploadedFile() file: Express.Multer.File): Promise<User | ApiResponse> {
        const user =  await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const imagePath = file.path;
        const image = basename(imagePath);
        return await this.userService.createProfilePicture(user.userId, image)
    }

    @Post('logout')
    async logout(@Req() req: Request) {
        const user =  await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        return await this.authService.logout(user.userId);
    }

    @Post(':chatRoomId/ban/:userId')
    async banUser(@Param('chatRoomId') chatRoomId: number, @Param('userId') userId: number, @Req() req: Request): Promise<BannedUser | ApiResponse> {
        const currentUser = await this.authService.getCurrentUser(req);
        
        if (!currentUser || !currentUser.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const curentUserId = currentUser.userId;
        return this.bannedUserService.banUser(chatRoomId, userId, curentUserId);
    }

    @Delete(':chatRoomId/unban/:userId')
    async unbanUser(@Param('chatRoomId') chatRoomId: number, @Param('userId') userId: number, @Req() req: Request): Promise<BannedUser | ApiResponse> {
        const currentUser = await this.authService.getCurrentUser(req);
        
        if (!currentUser || !currentUser.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const curentUserId = currentUser.userId;
        return this.bannedUserService.unbanUser(chatRoomId, userId, curentUserId);
    }

    @Delete(':id')
    deleteAcc(@Param('id') userId: number): Promise<User | ApiResponse> {
        return this.userService.deleteUser(userId);
    }
}