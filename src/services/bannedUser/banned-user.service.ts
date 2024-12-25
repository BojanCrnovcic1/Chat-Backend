import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BannedUser } from "src/entities/banned-user..entity";
import { ChatRoom } from "src/entities/chat-room.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class BannedUserService {
    constructor(
        @InjectRepository(BannedUser) private readonly bannedUserRepository: Repository<BannedUser>,
        @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}
    
    async banUser(chatRoomId: number, userId: number, currentUserId: number): Promise<BannedUser | ApiResponse> {
        const userToBan = await this.userRepository.findOne({
            where: {userId: userId},});

        if (!userToBan) {
            return new ApiResponse('error', -1001, 'User not found!');
        }

        const chatRoom = await this.chatRoomRepository.findOne({
            where: { chatRoomId: chatRoomId },
            relations: ['bannedUsers', 'chatRoomMembers']
        });

        if (!chatRoom) {
            return new ApiResponse('error', -3001, 'Chat room is not found.');
        }

        const isCurrentUserInChatRoom = chatRoom.chatRoomMembers.some(
            (member) => member.userId === currentUserId
          );

          if (!isCurrentUserInChatRoom) {
            return new ApiResponse('error', -3008, 'User are not a member of this chat room');
          }

        const isUserToBanInChatRoom = chatRoom.chatRoomMembers.some(
            (member) => member.userId === userToBan.userId
          );

          if (!isUserToBanInChatRoom) {
            return new ApiResponse('error', -3009, `User with ID ${userId} is not a member of this chat room`);
          }

        const existingBan = await this.bannedUserRepository.findOne({
            where: { chatRoomId, userId },
          });

          if (existingBan) {
            return new ApiResponse('error', -1100, `User with ID ${userId} is already banned in this chat room`);
          }

        const bannedUser = this.bannedUserRepository.create({
            chatRoomId,
            userId,
            bannedAt: new Date()
        }) 

        if (!bannedUser) {
            return new ApiResponse('error', -1005, 'User is not banned.')
        }
        const saveBan = await this.bannedUserRepository.save(bannedUser);

        if (!saveBan) {
            return new ApiResponse('error', -1006, 'Is not save user ban.')
        }
        return saveBan;
    }

    async unbanUser(chatRoomId: number, userId: number, currentUserId: number): Promise<BannedUser | ApiResponse> {
        const userToBan = await this.userRepository.findOne({
            where: {userId: userId},});

        if (!userToBan) {
            return new ApiResponse('error', -1001, 'User not found!');
        }

        const chatRoom = await this.chatRoomRepository.findOne({
            where: { chatRoomId: chatRoomId },
            relations: ['bannedUsers', 'chatRoomMembers']
        });

        if (!chatRoom) {
            return new ApiResponse('error', -3001, 'Chat room is not found.');
        }
        const isCurrentUserInChatRoom = chatRoom.chatRoomMembers.some(
            (member) => member.userId === currentUserId
          );
          if (!isCurrentUserInChatRoom) {
            return new ApiResponse('error', -3008, 'User are not a member of this chat room');
          }

        const banRecord = await this.bannedUserRepository.findOne({
            where: { chatRoomId, userId },
        });  
        if (!banRecord) {
            return new ApiResponse('error', -1005, 'User is not banned.')
        }
        await this.bannedUserRepository.delete(banRecord);
        
        return new ApiResponse('success', 0, 'User successfully unbanned.');
    }
}