import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { Notification } from "src/entities/notification.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { NotificationService } from "src/services/notification/notification.service";

@Controller('api/notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        ) {}

    @Get(':id')
    async getUserNotifications(@Param('id') userId: number): Promise<Notification[]> {
        return await this.notificationService.getNotifications(userId);
    }

    @Post('create')
    async createNotification(@Body('userId') userId: number, @Body('message') message: string): Promise<Notification | ApiResponse> {
        return await this.notificationService.createNotification(userId, message);
    }

    @Patch(':id/read')
    async markNotificationAsRead(@Param('id') notificationId: number): Promise<Notification | ApiResponse> {
        return await this.notificationService.markAsRead(notificationId);
    }

    @Delete(':id/remove')
    async removeNotification(@Param('id') notificationId: number): Promise<Notification | ApiResponse> {
        return await this.notificationService.deleteNotification(notificationId);
    }
}