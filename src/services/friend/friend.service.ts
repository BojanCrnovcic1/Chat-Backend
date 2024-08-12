import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Friend } from "src/entities/friend.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class FriendService {
    constructor(
        @InjectRepository(Friend) private readonly friendRepository: Repository<Friend>,
    ) {}

    async sendFriendRequest(userId: number, friendId: number): Promise<Friend | ApiResponse> {
        const friendRequest = this.friendRepository.create({
            userId,
            friendId,
            status: 'pending'
        });

        const savedFriendRequest = await this.friendRepository.save(friendRequest);
        if (!savedFriendRequest) {
            return new ApiResponse('error', -4001, 'Friend request is not sand.')
        }
        return savedFriendRequest;
    }

    async acceptFriendRequest(userId: number, friendId: number): Promise<Friend | ApiResponse> {
        const friendRequest =  await this.friendRepository.findOne({
            where: {userId, friendId, status: 'pending'}
        });
        if (!friendRequest) {
            return new ApiResponse('error', -4002, 'Friend request not found.')
        }
        friendRequest.status = 'accepted';
        const savedFriendRequest = await this.friendRepository.save(friendRequest);
        if (!savedFriendRequest) {
            return new ApiResponse('error', -4003, 'Friend request is not accepted.')
        }
        return savedFriendRequest;
    }

    async rejectFriendRequest(userId: number, friendId: number): Promise<ApiResponse> {
        const friendRequest =  await this.friendRepository.findOne({
            where: {userId, friendId, status: 'pending'}
        });
        if (!friendRequest) {
            return new ApiResponse('error', -4002, 'Friend request not found.')
        }
        await this.friendRepository.remove(friendRequest);
    }
}