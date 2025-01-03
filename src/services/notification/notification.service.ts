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
    
    async getUnreadMessageCountsBySender(userId: number): Promise<{ senderId: number; count: number }[]> {
        const unreadNotifications = await this.notificationRepository.find({
            where: {
                userId: userId,
                isRead: false,
            },
            relations: ['message_2'],
        });
    
        const countsBySender: { [senderId: number]: number } = {};
    
        unreadNotifications.forEach(notification => {
            const senderId = notification.message_2.userId;
    
            if (countsBySender[senderId]) {
                countsBySender[senderId] += 1;
            } else {
                countsBySender[senderId] = 1;
            }

        });
    
        return Object.keys(countsBySender).map(senderId => ({
            senderId: parseInt(senderId, 10),
            count: countsBySender[senderId],
        }));
    }

    async createAdminGlobalNotification(adminId: number, message: string): Promise<Notification | ApiResponse> {
        const notification = this.notificationRepository.create({
            adminId,
            message,
            isRead: false,
        });

        const savedNotification = await this.notificationRepository.save(notification);

        if (!savedNotification) {
            return new ApiResponse('error', -5004, 'Global admin notification is not saved.');
        }

        this.chatGateway.broadcastMessage('adminGlobalNotification', { message });
        return savedNotification;
    }

    async createAdminPrivateNotification(
        adminId: number,
        userId: number,
        message: string,
        adminMessageId?: number
    ): Promise<Notification | ApiResponse> {
    
        const notification = this.notificationRepository.create({
            adminId,
            userId,
            message,
            isRead: false,
            adminMessageId: adminMessageId || null,
        });
    
        try {
            const savedNotification = await this.notificationRepository.save(notification);
    
            if (!savedNotification) {
                return new ApiResponse('error', -5005, 'Private admin notification is not saved.');
            }
    
            this.chatGateway.notifyUser(userId, message, undefined, undefined, adminMessageId);
            return savedNotification;
        } catch (error) {
            console.error('Error saving notification:', error);
            return new ApiResponse('error', -5006, 'Error occurred while saving notification.');
        }
    }
    
  
    async createNotification(userId: number, message: string, chatRoomId?: number, messageId?: number): Promise<Notification | ApiResponse> {
        const notification = this.notificationRepository.create({
            userId,
            message,
            isRead: false,
            chatRoomId: chatRoomId || null,
            messageId: messageId || null,
        });

        if (!notification) {
            return new ApiResponse('error', -5002, 'Notification is not created.')
        }

        const savedNotification = await this.notificationRepository.save(notification);
        
        if (!savedNotification) {
            return new ApiResponse('error', -5003, 'Notification is not saved.')
        }

         this.chatGateway.notifyUser(userId, message, chatRoomId, messageId);
        
        return savedNotification;
    }

    async getNotifications(userId: number): Promise<Notification[]> {
        return await this.notificationRepository.find(
            { where: {userId: userId}, 
              relations: ['message_2', 'user.friends.sender.messages.chatRoom', 'adminMessage']
        })
    }

    async markAllAsRead(userId: number, senderId: number): Promise<Notification[]> {
        await this.notificationRepository.update(
          { userId: userId, isRead: false, message_2: {userId: senderId} },
          { isRead: true }
        );
        console.log()

        return await this.notificationRepository.find({
            where: { userId: userId },
          });
      };

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