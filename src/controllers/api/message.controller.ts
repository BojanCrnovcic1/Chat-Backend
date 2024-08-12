import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import { Request } from "express";
import multer from "multer";
import { basename, extname } from "path";
import { AuthService } from "src/auth/auth.service";
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

    @Get()
    async getAll(): Promise<Message[]> {
        return await this.messageService.allMessage();
    }

    @Get(':id')
    async getMessageById(@Param('id') messageId: number): Promise<Message | ApiResponse> {
        return await this.messageService.messageById(messageId); 
    }

    @Get('likes/:messageId')
    async getAllLikes(@Param('messageId') messageId: number): Promise<Like[] | ApiResponse> {
        return await this.likeService.getAllLikes(messageId)
    }

    @Post('create')
    async createMessage(@Body() data: CreateMessageDto): Promise<Message | ApiResponse> {
        return await this.messageService.create(data);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('photo',{
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
    }))
    async uploadPhoto(@UploadedFile() file: Express.Multer.File, @Body() data: CreateMessageDto): Promise<Message | ApiResponse> {
        if (data.contentType !== 'image') {
            return new ApiResponse('error', -2005, 'Content type must be image for file upload');
        }

        const imagePath = file.path;
        const filename = basename(imagePath);

        data.content = `/uploads/${filename}`;

        return await this.messageService.create(data);
    }

    @Post('like/:id')
    async likeMessage(@Req() req: Request, @Param('id') messageId: number): Promise<Like | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;

        return await this.likeService.like(userId, messageId)
    }

    @Patch(':id/editMessage')
    async update(@Param('id') messageId: number, @Body() message: Message): Promise<Message | ApiResponse> {
        return await this.messageService.update(messageId, message);
    }

    @Delete(':id/deleteMessage')
    async deleteMessage(@Param('id') messageId: number): Promise<Message | ApiResponse> {
        return await this.messageService.remove(messageId);
    }

    @Delete('dislike/:id')
    async dislikeMessage(@Req() req: Request, @Param('id') messageId: number): Promise<Like | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;

        return await this.likeService.dislike(userId, messageId);
    }
}

