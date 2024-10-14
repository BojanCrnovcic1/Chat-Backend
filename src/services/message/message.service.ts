import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateMessageDto } from "src/dtos/message/create.message.dto";
import { ChatRoom } from "src/entities/chat-room.entity";
import { Message } from "src/entities/message.entity";
import { ChatGateway } from "src/gateways/chat.gateway";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";
import { NotificationService } from "../notification/notification.service";
import { User } from "src/entities/user.entity";

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
        @InjectRepository(ChatRoom) private readonly chatRoomRepository: Repository<ChatRoom>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly notificationService: NotificationService,
        private readonly chatGateway: ChatGateway,
    ) {}

    async allMessage(chatRoomId: number): Promise<Message[]> {
        return await this.messageRepository.find({
            where: {chatRoomId: chatRoomId},
            relations: ['chatRoom', 'user', 'likes', 'parentMessage', 'messages']
        });
    }

    async messageById(messageId: number): Promise<Message | ApiResponse> {
        const message = await this.messageRepository.findOne({ where: { messageId: messageId } });
        if (!message) {
            return new ApiResponse('error', -2001, 'Message is not found.');
        }
        return message;
    }

    async create(createMessage: CreateMessageDto, senderId: number): Promise<Message | ApiResponse> {
        const { content, contentType, chatRoomId, parentMessageId } = createMessage;
    
        const chatRoom = await this.chatRoomRepository.findOne({ where: { chatRoomId: createMessage.chatRoomId } });
        if (!chatRoom) {
            return new ApiResponse('error', -2005, 'Chat room not found.');
        }
    
        // Validacija sadržaja poruke
        if (contentType === 'link') {
            const urlPattern = new RegExp('^(https?:\\/\\/)?'+ 
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ 
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
            '(\\#[-a-z\\d_]*)?$','i'); 
      
            if (!urlPattern.test(content)) {
                return new ApiResponse('error', -2002, 'Invalid URL format for link content type');
            }
        }
    
        if (contentType === 'video' || contentType === 'audio') {
            if (!content) {
                return new ApiResponse('error', -2004, `Content required for ${contentType} type`);
            }
        }
    
        const newMessage = this.messageRepository.create(createMessage);
    
        if (parentMessageId) {
            const repliedMessage = await this.messageRepository.findOne({ where: { messageId: parentMessageId } });
            if (!repliedMessage) {
                return new ApiResponse('error', -2003, 'Replied message not found.');
            }
            newMessage.parentMessage = repliedMessage;
        }
    
        const savedMessage = await this.messageRepository.save(newMessage);
        this.chatGateway.broadcastMessage('receiveMessage', savedMessage);
    
        // Dobijanje podataka o pošiljaocu
        const sender = await this.userRepository.findOne({ where: { userId: senderId } });
        if (!sender) {
            return new ApiResponse('error', -1009, 'Sender not found');
        }
    
        const senderName = sender.username || `${sender.username}`;
    
        const chatRoomMembers = await this.chatRoomRepository.findOne({
            where: { chatRoomId },
            relations: ['chatRoomMembers', 'chatRoomMembers.user'], 
        });
    
        if (chatRoomMembers && chatRoomMembers.chatRoomMembers) {
            const participants = chatRoomMembers.chatRoomMembers
                .map(member => member.user)
                .filter(participant => participant.userId !== senderId);
    
            for (const participant of participants) {
                await this.notificationService.createNotification(
                    participant.userId,
                    `Message from ${senderName}: ${content}`, 
                );
            }
        }
    
        return savedMessage;
    }
    
    async update(messageId: number, message: Message): Promise<Message | ApiResponse> {
        const existingMessage = await this.messageRepository.findOne({ where: { messageId: messageId } });
        if (!existingMessage) {
            return new ApiResponse('error', -2001, 'Message is not found.');
        }
        await this.messageRepository.update(messageId, message);
        return this.messageById(messageId);
    }

    async remove(messageId: number): Promise<Message | ApiResponse> {
        const message = await this.messageRepository.findOne({ where: { messageId: messageId } });
        if (!message) {
            return new ApiResponse('error', -2001, 'Message is not found.');
        }
        await this.messageRepository.remove(message);
        return new ApiResponse('success', 0, 'Message deleted.');
    }
}

