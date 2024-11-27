import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateChatRoomDto } from "src/dtos/chatRoom/create.chat.room.dto";

import { ChatRoomMember } from "src/entities/chat-room-member.entity";
import { ChatRoom } from "src/entities/chat-room.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { In, Repository } from "typeorm";

@Injectable()
export class ChatRoomService {
    constructor(
        @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(ChatRoomMember) private readonly chatRoomMemberRepository: Repository<ChatRoomMember>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}


    async getUserGroupRooms(userId: number): Promise<ChatRoom[]> {
        const rooms = await this.chatRoomRepository.find({
            where: { isGroup: true },
            relations: ['chatRoomMembers', 'chatRoomMembers.user'],
        });

        const userGropuRooms = rooms.filter(room => 
            room.chatRoomMembers.some(member => member.user.userId === userId))
        
        return userGropuRooms;
    }
    

    async getUserGroupRoomS(userId: number): Promise<ChatRoom[]> {
        const rooms = await this.chatRoomRepository
            .createQueryBuilder('room')
            .innerJoinAndSelect('room.chatRoomMembers', 'members')
            .where('members.userId = :userId', { userId })
            .andWhere('room.isGroup = :isGroup', { isGroup: true })
            .getMany();
            return rooms;
    }
    
    async allRooms(): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.find({
            relations: ['bannedUsers', 'chatRoomMembers', 'messages']
        });
    }

    async getUserCurrentRoom(userId: number): Promise<ChatRoom | ApiResponse> {
        const chatRoomMember = await this.chatRoomMemberRepository.findOne({
            where: { userId },
            relations: ['chatRoom'],
        });

        if (!chatRoomMember) {
            return new ApiResponse('error', -3008, `User with ID ${userId} is not currently in any room.`);
        }
    
        return chatRoomMember.chatRoom;
    }
    

    async getRoomMembers(chatRoomId: number): Promise<User[] | ApiResponse> {
        
        const chatRoomMembers = await this.chatRoomMemberRepository.find({
            where: { chatRoomId },
            relations: ['user'], 
        });
    
        if (!chatRoomMembers.length) {
            return new ApiResponse('error', -3005,`No members found for chat room ID ${chatRoomId}`);
        }
    
        const users = chatRoomMembers.map(member => member.user);
    
        return users;
    }

    async chatRoomById(chatRoomId: number): Promise<ChatRoom | ApiResponse> {
        const chatRoom = await this.chatRoomRepository.findOne({
            where: { chatRoomId: chatRoomId },
            relations: ['bannedUsers', 'chatRoomMembers', 'chatRoomMembers.user', 'messages']
        });

        if (!chatRoom) {
            return new ApiResponse('error', -3001, 'Chat room is not found.');
        }
        return chatRoom;
    }
    
    async findRoomByUsers(userId1: number, userId2: number): Promise<ChatRoom | undefined> {
        const room = await this.chatRoomRepository
          .createQueryBuilder("chatRoom")
          .innerJoin("chatRoom.chatRoomMembers", "chatRoomMembers")
          .where("chatRoomMembers.userId IN (:...userIds)", { userIds: [userId1, userId2] })
          .groupBy("chatRoom.chatRoomId")
          .having("COUNT(chatRoomMembers.userId) = 2")
          .getOne();
        
        return room;
      }

      async createOrFindRoom(userId1: number, userId2: number): Promise<ChatRoom> {
        let room = await this.findRoomByUsers(userId1, userId2);
      
        if (!room) {
          room = new ChatRoom();
          room.isGroup = false;
          room.createdAt = new Date();
      
          room = await this.chatRoomRepository.save(room);
      
          if (room) {
            const chatRoomMember1 = new ChatRoomMember();
            chatRoomMember1.chatRoom = room;
            chatRoomMember1.userId = userId1;
            chatRoomMember1.role = "member";
            await this.chatRoomMemberRepository.save(chatRoomMember1);
      
            const chatRoomMember2 = new ChatRoomMember();
            chatRoomMember2.chatRoom = room;
            chatRoomMember2.userId = userId2;
            chatRoomMember2.role = "member";
            await this.chatRoomMemberRepository.save(chatRoomMember2);
          }
        }
        return room;
      }
      
      async createChatRoom(dataChatRoom: CreateChatRoomDto, creatorId: number): Promise<ChatRoom | ApiResponse> {
        const newChatRoom = this.chatRoomRepository.create(dataChatRoom);
        const savedChatRoom = await this.chatRoomRepository.save(newChatRoom);
    
        if (!savedChatRoom) {
            return new ApiResponse('error', -3002, 'Chat room not saved.');
        }
    
        const chatRoomMember = new ChatRoomMember();
        chatRoomMember.chatRoom = savedChatRoom;
        chatRoomMember.user = { userId : creatorId } as User; 
        chatRoomMember.role = 'admin'; 
        
        await this.chatRoomMemberRepository.save(chatRoomMember);
    
        return savedChatRoom;
    }
    
    
    async updateChatRoom(chatRoomId: number, updateChatRoom: CreateChatRoomDto): Promise<ChatRoom | ApiResponse> {
        const chatRoom = await this.chatRoomRepository.findOne({
            where: { chatRoomId: chatRoomId },
            relations: ['bannedUsers', 'chatRoomMembers', 'messages']
        });

        if (!chatRoom) {
            return new ApiResponse('error', -3001, 'Chat room is not found.');
        }
        await this.chatRoomRepository.update(chatRoomId, updateChatRoom);
        return this.chatRoomById(chatRoomId);
    }

    async removeRoom(chatRoomId: number): Promise<ApiResponse> {
        const chatRoom = await this.chatRoomRepository.findOne({
            where: { chatRoomId: chatRoomId }
        });

        if (!chatRoom) {
            return new ApiResponse('error', -3001, 'Chat room is not found.');
        }
        await this.chatRoomRepository.delete(chatRoomId);
        return new ApiResponse('success', 0, 'Chat room deleted.');
    }

    async addMember(chatRoomId: number, userId: number, role: 'member' | 'admin' = 'member'): Promise<ChatRoomMember | ApiResponse> {
        const chatRoom = await this.chatRoomRepository.findOne({ where: { chatRoomId: chatRoomId } });
        if (!chatRoom) {
            return new ApiResponse('error', -3001, 'Chat room is not found.');
        }

        const user = await this.userRepository.findOne({ where: { userId: userId } });
        if (!user) {
            return new ApiResponse('error', -1001, 'User is not found.');
        }

        const existingMember = await this.chatRoomMemberRepository.findOne({ where: { chatRoomId: chatRoomId, userId: userId } });
        if (existingMember) {
            return new ApiResponse('error', -3003, 'User is already a member of the chat room.');
        }

        const chatRoomMember = new ChatRoomMember();
        chatRoomMember.chatRoom = chatRoom;
        chatRoomMember.user = user;
        chatRoomMember.role = role;

        await this.chatRoomMemberRepository.save(chatRoomMember);
        return chatRoomMember;
    }

    async removeMember(chatRoomId: number, requestingUserId: number, userId: number): Promise<ApiResponse> {
        const chatRoomMemberToRemove = await this.chatRoomMemberRepository.findOne({ 
            where: { chatRoomId, user: { userId } },
            relations: ['user'] 
        });
        
        if (!chatRoomMemberToRemove) {
            return new ApiResponse('error', -3006, 'Chat room member not found.');
        }
    
        if (requestingUserId === userId) {
            await this.chatRoomMemberRepository.remove(chatRoomMemberToRemove);
            return new ApiResponse('success', 0, 'You have left the chat room.');
        }
    
        const requestingUser = await this.chatRoomMemberRepository.findOne({ 
            where: { chatRoomId, user: { userId: requestingUserId } },
            relations: ['user'] 
        });
    
        if (!requestingUser || requestingUser.role !== 'admin') {
            return new ApiResponse('error', -3007, 'Only admins can remove other members.');
        }
    
        await this.chatRoomMemberRepository.remove(chatRoomMemberToRemove);
        return new ApiResponse('success', 0, 'Chat room member removed.');
    }
    
    
}
