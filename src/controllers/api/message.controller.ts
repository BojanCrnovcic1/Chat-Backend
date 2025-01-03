import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import { Request } from "express";
import multer from "multer";
import { basename, extname } from "path";
import { AuthGuard } from "src/auth/auth.gaurd";
import { AuthService } from "src/auth/auth.service";
import { Roles } from "src/auth/roles.decorator";
import { CreateMessageDto } from "src/dtos/message/create.message.dto";
import { Like } from "src/entities/like.entity";
import { Message } from "src/entities/message.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { LikeService } from "src/services/like/like.service";
import { MessageService } from "src/services/message/message.service";

@Controller('api/message')
export class MessageController {
    constructor(
        private readonly messageService: MessageService,
        private readonly likeService: LikeService,
        private readonly authService: AuthService) {}

    @Get('filter-messages')
    @UseGuards(AuthGuard)
    @Roles('admin')
    async paginateMessages(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
        @Query('username') username?: string,
        @Query('chatRoomId') chatRoomId?: number,
        @Query('searchTerm') searchTerm?: string
    ): Promise<{
        data: Message[],
        total: number,
        page: number,
        pageSize: number
    }> {
        return await this.messageService.paginateMessages(page, pageSize, username, chatRoomId, searchTerm);
    }
    

    @Get(':id/rooms')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    async getAll(@Param('id') chatRoomId: number): Promise<Message[]> {
        return await this.messageService.allMessage(chatRoomId);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    async getMessageById(@Param('id') messageId: number): Promise<Message | ApiResponse> {
        return await this.messageService.messageById(messageId); 
    }

    @Get('likes/:messageId')
    @UseGuards(AuthGuard)
    @Roles('user')
    async getAllLikes(@Param('messageId') messageId: number): Promise<Like[] | ApiResponse> {
        return await this.likeService.getAllLikes(messageId);
    };

    @Post('create')
    @UseGuards(AuthGuard)
    @Roles('user')
    async createMessage(@Body() data: CreateMessageDto, @Req() req: Request): Promise<Message | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.messageService.create(data, userId);
    }

    @Post('upload')
    @UseGuards(AuthGuard)
    @Roles('user')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                const ext = extname(file.originalname).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
                    cb(null, StorageConfig.image.destination);
                } else if (['.mp4', '.mkv', '.avi'].includes(ext)) {
                    cb(null, StorageConfig.video.destination);
                } else if (['.mp3', '.wav', '.ogg'].includes(ext)) {
                    cb(null, StorageConfig.audio.destination);
                } else {
                    cb(new Error('Unsupported file type'), null);
                }
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname).toLowerCase()}`);
            }
        }),
        fileFilter(req, file, cb) {
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mkv', '.avi', '.mp3', '.wav', '.ogg'];
            const ext = extname(file.originalname).toLowerCase();
            if (allowedExtensions.includes(ext)) {
                cb(null, true);
            } else {
                cb(new Error('Unsupported file extension'), false);
            }
        }
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() data: CreateMessageDto, @Req() req: Request): Promise<Message | ApiResponse> {
        if (!['image', 'video', 'audio'].includes(data.contentType)) {
            return new ApiResponse('error', -2005, 'Invalid content type for file upload');
        }
    
        const filePath = file.path;
        const filename = basename(filePath);
    
        data.content = `${filename}`;

        const user = await this.authService.getCurrentUser(req);
        
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
    
        return await this.messageService.create(data, userId);
    }
    
    @Post('like/:id')
    @UseGuards(AuthGuard)
    @Roles('user')
    async likeMessage(@Req() req: Request, @Param('id') messageId: number): Promise<Like | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;

        return await this.likeService.like(userId, messageId)
    }

    @Patch(':id/editMessage')
    @UseGuards(AuthGuard)
    @Roles('user')
    async update(@Param('id') messageId: number, @Body() message: Message): Promise<Message | ApiResponse> {
        return await this.messageService.update(messageId, message);
    }

    @Delete(':id/deleteMessage')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    async deleteMessage(@Param('id') messageId: number): Promise<Message | ApiResponse> {
        return await this.messageService.remove(messageId);
    }

    @Delete('dislike/:id')
    @UseGuards(AuthGuard)
    @Roles('user')
    async dislikeMessage(@Req() req: Request, @Param('id') messageId: number): Promise<Like | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;

        return await this.likeService.dislike(userId, messageId);
    }
}

