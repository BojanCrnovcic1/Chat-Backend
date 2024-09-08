import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/friend.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class FriendService {
    constructor(
        @InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
        private readonly notificationService: NotificationService,
    ) {}

    async getFreands(userId: number): Promise<Friend[]> {
        return await this.friendRepository.find({
            where: [
                {userId, status: 'accepted'},
                {friendId: userId, status: 'accepted'}
            ],
            relations: ['friend', 'user']
        })
    }

    async sendFriendRequest(userId: number, friendId: number): Promise<Friend | ApiResponse> {
        if (userId === friendId) {
            return new ApiResponse('error', -4005, 'You cannot send a friend request to yourself.');
        }
        if (await this.hasPendingRequest(userId, friendId)) {
            return new ApiResponse('error', -4004, 'You already have a pending friend request to this user.');
        }

        const friendRequest = this.friendRepository.create({
            userId,
            friendId,
            status: 'pending'
        });

        const savedFriendRequest = await this.friendRepository.save(friendRequest);
        if (!savedFriendRequest) {
            return new ApiResponse('error', -4001, 'Friend request is not sand.')
        }

        const sender = await this.friendRepository.findOne({
            where: {userId: userId},
            relations: ['friend','user']},)
        const senderUsername = sender.user.username;

        await this.notificationService.createNotification(friendId, `You have received a friend request from ${senderUsername}`);

        return savedFriendRequest;
    }

    async acceptFriendRequest(userId: number, friendId: number): Promise<Friend | ApiResponse> {
        const friendRequest = await this.friendRepository.findOne({
            where: { userId: friendId, friendId: userId, status: 'pending' },
           
        });
        console.log('frined Request: ', friendRequest)
        if (!friendRequest) {
            return new ApiResponse('error', -4002, 'Friend request not found.');
        }
        
        friendRequest.status = 'accepted';
        const savedFriendRequest = await this.friendRepository.save(friendRequest);
        if (!savedFriendRequest) {
            return new ApiResponse('error', -4003, 'Friend request is not accepted.');
        }
    
        const sender = await this.friendRepository.findOne({
            where: { userId: friendId },
            relations: ['friend', 'user']
        });
        const senderUsername = sender.user.username;
    
        await this.notificationService.createNotification(friendId, `Your friend request to user ${senderUsername} has been accepted.`);
        
        return savedFriendRequest;
    }
    
    async rejectFriendRequest(userId: number, friendId: number): Promise<ApiResponse> {
        const friendRequest = await this.friendRepository.findOne({
            where: { userId: friendId, friendId: userId, status: 'pending' }
        });
        if (!friendRequest) {
            return new ApiResponse('error', -4002, 'Friend request not found.');
        }
        
        await this.friendRepository.remove(friendRequest);
    
        const sender = await this.friendRepository.findOne({
            where: { userId: friendId },
            relations: ['friend', 'user']
        });
        const senderUsername = sender.user.username;
    
        await this.notificationService.createNotification(friendId, `Your friend request to user ${senderUsername} has been rejected.`);
    }
    

    async hasPendingRequest(userId: number, friendId: number) {
        const existingRequest = await this.friendRepository.findOne({
            where: { userId, friendId, status: 'pending' },
            relations: ['friend', 'user']
          });
          return !!existingRequest;
    }
}