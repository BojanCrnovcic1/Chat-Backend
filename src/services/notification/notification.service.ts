import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "src/entities/notification.entity";
import { ChatGateway } from "src/gateways/chat.gateway";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class NotificationService {
    constructor(
       @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
       private readonly chatGateway: ChatGateway
    ) {}

    async createNotification(userId: number, message: string): Promise<Notification | ApiResponse> {
        const notification = this.notificationRepository.create({
            userId,
            message,
            isRead: false
        });

        if (!notification) {
            return new ApiResponse('error', -5002, 'Notification is not created.')
        }

        const savedNotification = await this.notificationRepository.save(notification);
        
        if (!savedNotification) {
            return new ApiResponse('error', -5003, 'Notification is not saved.')
        }

         this.chatGateway.notifyUser(userId, message);
        
        return savedNotification;
    }

    async getNotifications(userId: number): Promise<Notification[]> {
        return await this.notificationRepository.find({where: {userId: userId}})
    }

    async markAsRead(notificationId: number): Promise<Notification | ApiResponse> {
        try {
            
            const notification = await this.notificationRepository.findOne({where: {notificationId: notificationId}});
            if (!notification) {
                return new ApiResponse('error', -5001, 'Notification is not found.')
            }

            notification.isRead = true;

            await this.notificationRepository.save(notification);
            return new ApiResponse('success', 0, 'Notification marked as read');
        } catch (error) {
            return new ApiResponse('error', -9999, 'Internals server error');
        }
    }

    async deleteNotification(notificationId: number): Promise<Notification | ApiResponse> {
        const notification = await this.notificationRepository.findOne({where: {notificationId}});
        if (!notification) {
            return new ApiResponse('error', -5001, 'Notification is not found.')
        }
        await this.notificationRepository.remove(notification);
    }
}