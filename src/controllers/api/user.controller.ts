import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import { Request } from "express";
import multer from "multer";
import { basename, extname } from "path";
import { AuthGuard } from "src/auth/auth.gaurd";
import { AuthService } from "src/auth/auth.service";
import { Roles } from "src/auth/roles.decorator";
import { UpdateUserDto } from "src/dtos/user/update.user.dto";
import { AccountDeletionRequest } from "src/entities/account-deletion-request.entity";
import { BannedUser } from "src/entities/banned-user..entity";
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
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    allUser(): Promise<User[]> {
        return this.userService.getAllUsers();
    }

    @Get('search')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    searchUsersByUsername(@Query('username') username: string): Promise<User[]> {
    return this.userService.getSearch(username);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    getUserById(@Param('id') userId: number): Promise<User | ApiResponse> {   
        return this.userService.getUserById(userId);
    }

    @Patch(':id/edit')
    @UseGuards(AuthGuard)
    @Roles('user')
    updateUser(@Param('id') userId: number, @Body() data: UpdateUserDto): Promise<User | ApiResponse> {
        return this.userService.editUser(userId, data);
    }

    @Post('request-account-deletion/:userId')
    @UseGuards(AuthGuard)
    @Roles('user')
    async requestAccountDeletion(@Param('userId') userId: number, @Body('reason') reason: string,):
     Promise<AccountDeletionRequest | ApiResponse> {
    return await this.userService.requestAccountDeletion(userId, reason);
}

    @Post('upload-profilePicture')
    @UseGuards(AuthGuard)
    @Roles('user')
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
    @UseGuards(AuthGuard)
    @Roles('user')
    async logout(@Req() req: Request) {
        const user =  await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        return await this.authService.logout(user.userId);
    }

    @Post(':chatRoomId/ban/:userId')
    @UseGuards(AuthGuard)
    @Roles('user')
    async banUser(@Param('chatRoomId') chatRoomId: number, @Param('userId') userId: number, @Req() req: Request): Promise<BannedUser | ApiResponse> {
        const currentUser = await this.authService.getCurrentUser(req);
        
        if (!currentUser || !currentUser.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const curentUserId = currentUser.userId;
        return this.bannedUserService.banUser(chatRoomId, userId, curentUserId);
    }

    @Delete(':chatRoomId/unban/:userId')
    @UseGuards(AuthGuard)
    @Roles('user')
    async unbanUser(@Param('chatRoomId') chatRoomId: number, @Param('userId') userId: number, @Req() req: Request): Promise<BannedUser | ApiResponse> {
        const currentUser = await this.authService.getCurrentUser(req);
        
        if (!currentUser || !currentUser.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const curentUserId = currentUser.userId;
        return this.bannedUserService.unbanUser(chatRoomId, userId, curentUserId);
    }

}