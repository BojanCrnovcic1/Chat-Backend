import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/friend.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";
import { NotificationService } from "../notification/notification.service";
import { Notification } from "src/entities/notification.entity";

@Injectable()
export class FriendService {
    constructor(
        @InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
        @InjectRepository(Notification) private readonly notificationRepository: Repository<Notification>,
        private readonly notificationService: NotificationService,
    ) {}

    async getFriends(userId: number): Promise<Friend[]> {
        const friends = await this.friendRepository
            .createQueryBuilder('friend')
            .where('(friend.senderId = :userId OR friend.receiverId = :userId)', { userId })
            .andWhere('friend.status = :status', { status: 'accepted' })
            .leftJoinAndSelect('friend.sender', 'senderUser')  
            .leftJoinAndSelect('friend.receiver', 'receiverUser')
            .getMany();
    
        return friends;
    }

    async getFriendsWithUnreadNotifications(userId: number): Promise<any[]> {
        const friends = await this.friendRepository.find({
            where: [
                { senderId: userId, status: 'accepted' },
                { receiverId: userId, status: 'accepted' },
            ],
            relations: ['sender', 'receiver', 'receiver.notifications'],
        });
    
        const friendsWithUnreadNotifications = friends.map(friend => {
            const targetUser = friend.senderId === userId ? friend.receiver : friend.sender;
    
            const unreadNotificationsCount = targetUser.notifications
                ? targetUser.notifications.filter(notification => 
                    !notification.isRead && notification.userId === userId 
                ).length
                : 0;
    
            return {
                userId: targetUser.userId,
                unreadNotificationsCount
            };
        });
    
        return friendsWithUnreadNotifications;
    }
    

    async sendFriendRequest(senderId: number, receiverId: number): Promise<Friend | ApiResponse> {
        if (senderId === receiverId) {
            return new ApiResponse('error', -4005, 'You cannot send a friend request to yourself.');
        }
        if (await this.hasPendingRequest(senderId, receiverId)) {
            return new ApiResponse('error', -4004, 'You already have a pending friend request to this user.');
        }

        const friendRequest = this.friendRepository.create({
            senderId,
            receiverId,
            status: 'pending'
        });

        const savedFriendRequest = await this.friendRepository.save(friendRequest);
        if (!savedFriendRequest) {
            return new ApiResponse('error', -4001, 'Friend request is not sent.');
        }

        const sender = await this.friendRepository.findOne({
            where: { senderId },
            relations: ['sender', 'receiver']
        });
        const senderUsername = sender.sender.username;

        await this.notificationService.createNotification(receiverId, `You have received a friend request from ${senderUsername}`);

        return savedFriendRequest;
    }

    async acceptFriendRequest(receiverId: number, senderId: number): Promise<Friend | ApiResponse> {
        const friendRequest = await this.friendRepository.findOne({
            where: { senderId, receiverId, status: 'pending' },
            relations: ['sender', 'receiver'],
        });
        console.log('friendRequest: ', friendRequest)
        if (!friendRequest) {
            return new ApiResponse('error', -4002, 'Friend request not found.');
        }
        
        friendRequest.status = 'accepted';
        const savedFriendRequest = await this.friendRepository.save(friendRequest);
        if (!savedFriendRequest) {
            return new ApiResponse('error', -4003, 'Friend request is not accepted.');
        }
    
        const receiverUsername = friendRequest.receiver.username;
        console.log('senderId: ', senderId)
    
        await this.notificationService.createNotification(friendRequest.senderId, `Your friend request to ${receiverUsername} has been accepted.`);
    
        return savedFriendRequest;
    }
    
    
    async rejectFriendRequest(receiverId: number, senderId: number): Promise<ApiResponse> {
        const friendRequest = await this.friendRepository.findOne({
            where: { senderId, receiverId, status: 'pending' }
        });
        if (!friendRequest) {
            return new ApiResponse('error', -4002, 'Friend request not found.');
        }
        
        await this.friendRepository.remove(friendRequest);
    
        const senderUsername = friendRequest.sender.username;
    
        await this.notificationService.createNotification(friendRequest.senderId, `Your friend request to user ${senderUsername} has been rejected.`);
    }
    

    async hasPendingRequest(senderId: number, receiverId: number) {
        const existingRequest = await this.friendRepository.findOne({
            where: { senderId, receiverId, status: 'pending' },
            relations: ['sender', 'receiver']
        });
        return !!existingRequest;
    }
}
