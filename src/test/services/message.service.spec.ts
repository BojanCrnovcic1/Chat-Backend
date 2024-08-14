import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateMessageDto } from 'src/dtos/message/create.message.dto';
import { Message } from "src/entities/message.entity";
import { ChatGateway } from "src/gateways/chat.gateway";
import { ApiResponse } from 'src/misc/api.response.class';
import { MessageService } from "src/services/message/message.service"
import { Repository } from "typeorm";

describe('MessageService', () => {
    let service: MessageService;
    let messageRepository: Repository<Message>
    let chatGateway: ChatGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageService, 
                {
                    provide: getRepositoryToken(Message),
                    useClass: Repository
                },
                {
                    provide: ChatGateway,
                    useValue: { broadcastMessage: jest.fn()}
                }
            ]
        }).compile();

        service = module.get<MessageService>(MessageService);
        messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
        chatGateway = module.get<ChatGateway>(ChatGateway);
    });

    it('should bi defined', () => {
        expect(service).toBeDefined();
    });

    describe('allMessage', () => {
        it('should return all messages', async () => {
            const messages: Message[] = [];
            jest.spyOn(messageRepository, 'find').mockResolvedValue(messages);

            expect(await service.allMessage()).toEqual(messages);
        });
    });

    describe('messageById', () => {
        it('should return message by ID', async () => {
            const message:  Message = {
                messageId: 2,
                chatRoomId: 1,
                userId: 1,
                content: 'Hello, this is a text message',
                contentType: 'text',
                parentMessageId: null,
                createdAt: new Date(),
                parentMessage: null,
                chatRoom: null,
                user: null,
                likes: null,
                messages: null
            }
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);

            expect(await service.messageById(2)).toEqual(message);
        });

        it('should return error if message not found', async() =>{
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(null);

            expect(await service.messageById(1)).toEqual(new ApiResponse('error', -2001, 'Message is not found.'));
        });
    });

    describe('create', () => {
        it('should create new message', async () => {
            const createMessageDto:  CreateMessageDto = { content: 'Hello', contentType: 'text', parentMessageId: null };
            const message: Message = {
                messageId: 1,
                content: 'Hello',
                contentType: 'text',
                parentMessageId: null,
                chatRoomId: 1,
                userId: 1,
                createdAt: new Date(),
                chatRoom: null,
                user: null,
                parentMessage: null,
                likes: null,
                messages: null
            };
            jest.spyOn(messageRepository, 'create').mockReturnValue(message);
            jest.spyOn(messageRepository, 'save').mockResolvedValue(message);

            expect(await service.create(createMessageDto)).toEqual(message);
        });
      
          it('should create a new message with a parent message', async () => {
            const createMessageDto: CreateMessageDto = { content: 'Hello', contentType: 'text', parentMessageId: 1 };
            const parentMessage: Message = {
              messageId: 1,
              content: 'Parent message',
              contentType: 'text',
              parentMessageId: null,
              chatRoomId: 1,
              userId: 1,
              createdAt: new Date(),
              parentMessage: null,
              chatRoom: null,
              user: null,
              likes: null,
              messages: null
            };
            const message: Message = {
              messageId: 2,
              content: 'Hello',
              contentType: 'text',
              parentMessageId: 1,
              chatRoomId: 1,
              userId: 1,
              createdAt: new Date(),
              parentMessage,
              chatRoom: null,
              user: null,
              likes: null,
              messages: null
            };
      
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(parentMessage);
            jest.spyOn(messageRepository, 'create').mockReturnValue(message);
            jest.spyOn(messageRepository, 'save').mockResolvedValue(message);
      
            expect(await service.create(createMessageDto)).toEqual(message);
          });
    });

    describe('update', () => {
        it('should update a message', async () => {
            const message: Message = {
              messageId: 1,
              content: 'Updated message',
              contentType: 'text',
              parentMessageId: null,
              chatRoomId: 1,
              userId: 1,
              createdAt: new Date(),
              parentMessage: null,
              chatRoom: null,
              user: null,
              likes: null,
              messages: null
            };
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
            jest.spyOn(messageRepository, 'update').mockResolvedValue(undefined);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
      
            expect(await service.update(1, message)).toEqual(message);
          });
      
          it('should return error if message not found', async () => {
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(null);
      
            expect(await service.update(1, {
              messageId: 1,
              content: 'Updated message',
              contentType: 'text',
              parentMessageId: null,
              chatRoomId: 1,
              userId: 1,
              createdAt: new Date(),
              parentMessage: null,
              chatRoom: null,
              user: null,
              likes: null,
              messages: null
            })).toEqual(new ApiResponse('error', -2001, 'Message is not found.'));
          });
    });

    describe('remove', () => {
        it('should remove a message', async () => {
          const message: Message = {
            messageId: 1,
            content: 'Hello',
            contentType: 'text',
            parentMessageId: null,
            chatRoomId: 1,
            userId: 1,
            createdAt: new Date(),
            parentMessage: null,
            chatRoom: null,
            user: null,
            likes: null,
            messages: null
          };
          jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
          jest.spyOn(messageRepository, 'remove').mockResolvedValue(message);
    
          expect(await service.remove(1)).toEqual(new ApiResponse('success', 0, 'Message deleted.'));
        });
    
        it('should return error if message not found', async () => {
          jest.spyOn(messageRepository, 'findOne').mockResolvedValue(null);
    
          expect(await service.remove(1)).toEqual(new ApiResponse('error', -2001, 'Message is not found.'));
        });
      });
})