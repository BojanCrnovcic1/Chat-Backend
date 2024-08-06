import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateChatRoomDto } from "src/dtos/chatRoom/create.chat.room.dto";
import { ChatRoomMember } from "src/entities/chat-room-member.entity";
import { ChatRoom } from "src/entities/chat-room.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class ChatRoomService {
    constructor(
        @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(ChatRoomMember) private readonly chatRoomMemberRepository: Repository<ChatRoomMember>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async allRooms(): Promise<ChatRoom[]> {
        return await this.chatRoomRepository.find({
            relations: ['bannedUsers', 'chatRoomMembers', 'messages']
        });
    }

    async chatRoomById(chatRoomId: number): Promise<ChatRoom | ApiResponse> {
        const chatRoom = await this.chatRoomRepository.findOne({
            where: { chatRoomId: chatRoomId },
            relations: ['bannedUsers', 'chatRoomMembers', 'messages']
        });

        if (!chatRoom) {
            return new ApiResponse('error', -3001, 'Chat room is not found.');
        }
        return chatRoom;
    }

    async createChatRoom(dataChatRoom: CreateChatRoomDto): Promise<ChatRoom | ApiResponse> {
        const newChatRoom = this.chatRoomRepository.create(dataChatRoom);
        const savedChatRoom = await this.chatRoomRepository.save(newChatRoom);

        if (!savedChatRoom) {
            return new ApiResponse('error', -3002, 'Chat room not saved.');
        }
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

    async findOrCreatePrivateChatRoom(userId1: number, userId2: number): Promise<ChatRoom | ApiResponse> {
        let chatRoom = await this.chatRoomRepository.createQueryBuilder('chatRoom')
            .innerJoinAndSelect('chatRoom.chatRoomMembers', 'chatRoomMember1', 'chatRoomMember1.userId = :userId1', { userId1 })
            .innerJoinAndSelect('chatRoom.chatRoomMembers', 'chatRoomMember2', 'chatRoomMember2.userId = :userId2', { userId2 })
            .where('chatRoom.isGroup = :isGroup', { isGroup: false })
            .getOne();

        if (!chatRoom) {
            chatRoom = new ChatRoom();
            chatRoom.isGroup = false;
            chatRoom.createdAt = new Date();
            chatRoom.chatRoomMembers = [];

            const user1 = await this.userRepository.findOne({where: {userId: userId1}});
            const user2 = await this.userRepository.findOne({where: {userId: userId2}});

            if (!user1 || !user2) {
                throw new NotFoundException('One or both users not found');
            }

            const member1 = new ChatRoomMember();
            member1.user = user1;
            member1.role = 'member';

            const member2 = new ChatRoomMember();
            member2.user = user2;
            member2.role = 'member';

            chatRoom.chatRoomMembers.push(member1, member2);

            await this.chatRoomRepository.save(chatRoom);
        }

        return chatRoom;
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

    async removeMember(chatRoomId: number, userId: number): Promise<ApiResponse> {
        const chatRoomMember = await this.chatRoomMemberRepository.findOne({ where: { chatRoomId, userId } });
        if (!chatRoomMember) {
            return new ApiResponse('error', -3006, 'Chat room member is not found.');
        }

        await this.chatRoomMemberRepository.remove(chatRoomMember);
        return new ApiResponse('success', 0, 'Chat room member removed.');
    }
}
