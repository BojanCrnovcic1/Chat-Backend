import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { ChatRoomMember } from 'src/entities/chat-room-member.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ApiResponse } from 'src/misc/api.response.class';
import { NotFoundException } from '@nestjs/common';
import { ChatRoomService } from 'src/services/chatRoom/chat.room.service';

describe('ChatRoomService', () => {
  let service: ChatRoomService;
  let chatRoomRepository: Repository<ChatRoom>;
  let chatRoomMemberRepository: Repository<ChatRoomMember>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatRoomService,
        {
          provide: getRepositoryToken(ChatRoom),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ChatRoomMember),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ChatRoomService>(ChatRoomService);
    chatRoomRepository = module.get<Repository<ChatRoom>>(getRepositoryToken(ChatRoom));
    chatRoomMemberRepository = module.get<Repository<ChatRoomMember>>(getRepositoryToken(ChatRoomMember));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('allRooms', () => {
    it('should return all chat rooms', async () => {
      const rooms = [new ChatRoom(), new ChatRoom()];
      jest.spyOn(chatRoomRepository, 'find').mockResolvedValue(rooms);

      const result = await service.allRooms();

      expect(result).toEqual(rooms);
    });
  });

  describe('chatRoomById', () => {
    it('should return a chat room by id', async () => {
      const room = new ChatRoom();
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(room);

      const result = await service.chatRoomById(1);

      expect(result).toEqual(room);
    });

    it('should return an error if chat room is not found', async () => {
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(null);

      const result = await service.chatRoomById(1);

      expect(result).toEqual(new ApiResponse('error', -3001, 'Chat room is not found.'));
    });
  });

  describe('createChatRoom', () => {
    it('should create and return a new chat room', async () => {
      const data = { name: 'Test Room' } as any;
      const room = new ChatRoom();
      jest.spyOn(chatRoomRepository, 'create').mockReturnValue(room);
      jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(room);

      const result = await service.createChatRoom(data);

      expect(result).toEqual(room);
    });

    it('should return an error if chat room is not saved', async () => {
      const data = { name: 'Test Room' } as any;
      jest.spyOn(chatRoomRepository, 'create').mockReturnValue(new ChatRoom());
      jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(null);

      const result = await service.createChatRoom(data);

      expect(result).toEqual(new ApiResponse('error', -3002, 'Chat room not saved.'));
    });
  });

  describe('updateChatRoom', () => {
    it('should update and return the chat room', async () => {
      const room = new ChatRoom();
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(room);
      jest.spyOn(chatRoomRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(service, 'chatRoomById').mockResolvedValue(room);

      const result = await service.updateChatRoom(1, { name: 'Updated Room' } as any);

      expect(result).toEqual(room);
    });

    it('should return an error if chat room is not found', async () => {
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(null);

      const result = await service.updateChatRoom(1, { name: 'Updated Room' } as any);

      expect(result).toEqual(new ApiResponse('error', -3001, 'Chat room is not found.'));
    });
  });

  describe('removeRoom', () => {
    it('should delete the chat room and return success response', async () => {
      const room = new ChatRoom();
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(room);
      jest.spyOn(chatRoomRepository, 'delete').mockResolvedValue(undefined);

      const result = await service.removeRoom(1);

      expect(result).toEqual(new ApiResponse('success', 0, 'Chat room deleted.'));
    });

    it('should return an error if chat room is not found', async () => {
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(null);

      const result = await service.removeRoom(1);

      expect(result).toEqual(new ApiResponse('error', -3001, 'Chat room is not found.'));
    });
  });

  describe('findOrCreatePrivateChatRoom', () => {
    it('should find or create a private chat room', async () => {
      const user1 = new User();
      const user2 = new User();
      const room = new ChatRoom();
    
      const member1 = new ChatRoomMember();
      member1.user = user1;
      member1.role = 'member';
    
      const member2 = new ChatRoomMember();
      member2.user = user2;
      member2.role = 'member';
    
      room.chatRoomMembers = [member1, member2];
      const createdAt = new Date();
      room.createdAt = createdAt;
      room.isGroup = false;
    
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user1);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(user2);
      jest.spyOn(chatRoomRepository, 'createQueryBuilder').mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as any);
      jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(room);
    
      const result = await service.findOrCreatePrivateChatRoom(1, 2);
    
      const chatRoomResult = result as ChatRoom;
    
      expect(chatRoomResult.chatRoomMembers).toEqual(room.chatRoomMembers);
      expect(chatRoomResult.isGroup).toBe(room.isGroup);
      expect(chatRoomResult.createdAt.getTime()).toBeCloseTo(room.createdAt.getTime(), 2);
    });
    
  });

  describe('addMember', () => {   
    it('should add a member to the chat room', async () => {
      const user = new User();
      const chatRoom = new ChatRoom();
      const member = new ChatRoomMember();
      member.user = user;
      member.chatRoom = chatRoom;
      member.role = 'member';
    
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(chatRoom);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(chatRoomMemberRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(chatRoomMemberRepository, 'save').mockResolvedValue(member);
    
      const result = await service.addMember(1, 1);
    
      const chatRoomMemberResult = result as ChatRoomMember;
    
      expect(chatRoomMemberResult).toEqual(member);
    });    
    
    it('should return an error if the user is already a member', async () => {
      const user = new User();
      const chatRoom = new ChatRoom();
      const existingMember = new ChatRoomMember();
      existingMember.user = user;
    
      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(chatRoom);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(chatRoomMemberRepository, 'findOne').mockResolvedValue(existingMember);
    
      const result = await service.addMember(1, 1);
    
      expect(result).toEqual(new ApiResponse('error', -3003, 'User is already a member of the chat room.'));
    });
    
  });

  describe('removeMember', () => {
    it('should remove a member from the chat room', async () => {
      const member = new ChatRoomMember();

      jest.spyOn(chatRoomMemberRepository, 'findOne').mockResolvedValue(member);
      jest.spyOn(chatRoomMemberRepository, 'remove').mockResolvedValue(undefined);

      const result = await service.removeMember(1, 1);

      expect(result).toEqual(new ApiResponse('success', 0, 'Chat room member removed.'));
    });

    it('should return an error if chat room member is not found', async () => {
      jest.spyOn(chatRoomMemberRepository, 'findOne').mockResolvedValue(null);

      const result = await service.removeMember(1, 1);

      expect(result).toEqual(new ApiResponse('error', -3006, 'Chat room member is not found.'));
    });
  });
});
