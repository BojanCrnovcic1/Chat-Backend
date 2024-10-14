import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/friend.entity";
import { Notification } from "src/entities/notification.entity";
import { User } from "src/entities/user.entity";
import { ChatGateway } from "src/gateways/chat.gateway";
import { ApiResponse } from "src/misc/api.response.class";
import { Brackets, Repository } from "typeorm";

@Injectable()
export class NotificationService {
    constructor(
       @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
       @InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
       private readonly chatGateway: ChatGateway
    ) {}

    /*async countUnreadMessagesFromFriends(userId: number): Promise<{ friendId: number; unreadCount: number }[]> {
        const unreadNotifications = await this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoin('notification.user', 'user')
            .leftJoin('user.friends', 'friend')  
            .select('friend.friendId', 'friendId') 
            .addSelect('COUNT(notification.notificationId)', 'unreadCount') 
            .where('notification.isRead = false')   
            .andWhere('user.userId = :userId', { userId }) 
            .groupBy('friend.friendId')   
                
            .getRawMany();
    
        console.log('Raw unread notifications:', unreadNotifications);
    
        return unreadNotifications.map(item => ({
            friendId: item.friendId ? parseInt(item.friendId, 10) : null,
            unreadCount: parseInt(item.unreadCount, 10) // Vraćanje broja nepročitanih poruka po prijatelju
        }));
    }  */
    async countUnreadMessagesFromFriends(userId: number): Promise<{ friendId: number; unreadCount: number }[]> {
        // Prvo pronalazimo prijatelje korisnika
        const friends = await this.friendRepository
            .createQueryBuilder('friend')
            .where('friend.userId = :userId OR friend.friendId = :userId', { userId })
            .andWhere('friend.status = :status', { status: 'accepted' })
            .leftJoinAndSelect('friend.user', 'user')  
            .leftJoinAndSelect('friend.friend', 'friendUser') 
            .getMany();
    
        console.log('friends: ', friends);
    
        // Izvlacimo friendId u zavisnosti od toga da li je userId ili friendId trenutni korisnik
        const friendIds = friends.map(friend => {
            return friend.userId === userId ? friend.friendId : friend.userId;
        });
    
        if (friendIds.length === 0) {
            return []; // Ako nema prijatelja, vraćamo prazan niz
        }
    
        const unreadNotifications = await this.notificationRepository
        .createQueryBuilder('notification')
        .leftJoin('notification.user', 'user') // Pretpostavljam da user odnosi na korisnika koji je poslao notifikaciju
        .select('notification.userId', 'friendId')
        .addSelect('COUNT(notification.notificationId)', 'unreadCount')
        .where('notification.isRead = false')
        .having('notification.userId IN (:...friendIds)', { friendIds }) // Koristi 'userId' umesto 'receiverId'
        .andWhere('notification.userId = :userId', { userId }) // Ili koristi odgovarajuću logiku za trenutnog korisnika
        .groupBy('notification.userId')
        .getRawMany();
    

    
        console.log('unreadNotifications: ', unreadNotifications);
    
        return unreadNotifications.map(item => ({
            friendId: parseInt(item.friendId, 10),
            unreadCount: parseInt(item.unreadCount, 10)
        }));
    }
    
    
    
    
    
    
    async createNotification(userId: number, message: string): Promise<Notification | ApiResponse> {
        const notification = this.notificationRepository.create({
            userId,
            message,
            isRead: false,
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
        return await this.notificationRepository.find(
            {where: {userId: userId}
        })
    }
    

      async getUnreadNotifications(userId: number): Promise<{ count: number; notifications: Notification[] }> {
        const unreadNotifications = await this.notificationRepository.find({
            where: { userId, isRead: false },
        });
        if (unreadNotifications.length > 0) {
            for (const notification of unreadNotifications) {
                notification.isRead = true;
            }
    
            await this.notificationRepository.save(unreadNotifications);
        }
        return {
            count: unreadNotifications.length,
            notifications: unreadNotifications,
        };
    }

    async markAllAsRead(userId: number): Promise<Notification[]> {
        await this.notificationRepository.update(
          { userId: userId, isRead: false },
          { isRead: true }
        );

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