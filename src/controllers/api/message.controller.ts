import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageConfig } from "config/storage.config";
import multer from "multer";
import { basename, extname } from "path";
import { CreateMessageDto } from "src/dtos/message/create.message.dto";
import { Message } from "src/entities/message.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { MessageService } from "src/services/message/message.service";

@Controller('api/message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Get()
    async getAll(): Promise<Message[]> {
        return await this.messageService.allMessage();
    }

    @Get(':id')
    async getMessageById(@Param('id') messageId: number): Promise<Message | ApiResponse> {
        return await this.messageService.messageById(messageId); // Poziva servis umesto same sebe
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

    @Patch(':id/editMessage')
    async update(@Param('id') messageId: number, @Body() message: Message): Promise<Message | ApiResponse> {
        return await this.messageService.update(messageId, message);
    }

    @Delete(':id/deleteMessage')
    async deleteMessage(@Param('id') messageId: number): Promise<Message | ApiResponse> {
        return await this.messageService.remove(messageId);
    }
}

