import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "src/auth/auth.service";
import { Notification } from "src/entities/notification.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { NotificationService } from "src/services/notification/notification.service";

@Controller('api/notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService,
        private readonly authService: AuthService,
        ) {}

    @Get(':id')
    async getUserNotifications(@Param('id') userId: number): Promise<Notification[]> {
        return await this.notificationService.getNotifications(userId);
    }

    @Get('unread/:userId')
   async getUnreadMessagesBySender(@Req() req: Request) {
    const user =  await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
           new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
     const unreadMessages = await this.notificationService.getUnreadMessageCountsBySender(userId);

    return unreadMessages;
  }


    @Patch(':userId/read-all/:senderId')
    async markAllNotificationsAsRead(@Param('userId') userId: number, @Param('senderId') senderId: number):Promise<Notification[]> {
        return await this.notificationService.markAllAsRead(userId, senderId);
    }


    @Post('create')
    async createNotification(@Body('userId') userId: number, @Body('message') message: string): Promise<Notification | ApiResponse> {
        return await this.notificationService.createNotification(userId, message);
    }

    @Post('global')
    async sendGlobalNotification(
        @Body('adminId') adminId: number,
        @Body('message') message: string
    ): Promise<Notification | ApiResponse> {
        return await this.notificationService.createAdminGlobalNotification(adminId, message);
    }

    @Post('private')
    async sendPrivateNotification(
        @Body('adminId') adminId: number,
        @Body('userId') userId: number,
        @Body('message') message: string
    ): Promise<Notification | ApiResponse> {
        return await this.notificationService.createAdminPrivateNotification(adminId, userId, message);
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