import { Test, TestingModule } from '@nestjs/testing';
import { ChatRoomService } from 'src/services/chatRoom/chat.room.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { ChatRoomMember } from 'src/entities/chat-room-member.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateChatRoomDto } from 'src/dtos/chatRoom/create.chat.room.dto';

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

  describe('createChatRoom', () => {
    it('should create a new chat room', async () => {
      const createChatRoomDto: CreateChatRoomDto = { name: 'Test Room', isGroup: false };

      const chatRoom = new ChatRoom();
      chatRoom.chatRoomId = 1;
      chatRoom.name = 'Test Room';
      chatRoom.isGroup = false;

      jest.spyOn(chatRoomRepository, 'create').mockReturnValue(chatRoom);
      jest.spyOn(chatRoomRepository, 'save').mockResolvedValue(chatRoom);

      expect(await service.createChatRoom(createChatRoomDto)).toEqual(chatRoom);
    });
  });

  describe('addMember', () => {
    it('should add a member to the chat room', async () => {
      const chatRoom = new ChatRoom();
      chatRoom.chatRoomId = 1;

      const user = new User();
      user.userId = 1;

      const chatRoomMember = new ChatRoomMember();
      chatRoomMember.chatRoomId = 1;
      chatRoomMember.userId = 1;

      jest.spyOn(chatRoomRepository, 'findOne').mockResolvedValue(chatRoom);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(chatRoomMemberRepository, 'save').mockResolvedValue(chatRoomMember);

      expect(await service.addMember(1, 1)).toEqual(chatRoomMember);
    });
  });
});


