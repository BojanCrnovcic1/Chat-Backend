import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BannedUser } from 'src/entities/banned-user.entity';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { ApiResponse } from 'src/misc/api.response.class';
import { BannedUserService } from 'src/services/bannedUser/banned-user.service';

describe('BannedUserService', () => {
    let service: BannedUserService;
    let bannedUserRepository: Repository<BannedUser>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BannedUserService,
                {
                    provide: getRepositoryToken(BannedUser),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(ChatRoom),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<BannedUserService>(BannedUserService);
        bannedUserRepository = module.get<Repository<BannedUser>>(getRepositoryToken(BannedUser));
    });

    it('should ban a user', async () => {
        const chatRoomId = 1;
        const userId = 1;
        const bannedUser = new BannedUser();
        bannedUser.chatRoomId = chatRoomId;
        bannedUser.userId = userId;
        bannedUser.bannedAt = new Date();

        jest.spyOn(bannedUserRepository, 'create').mockReturnValue(bannedUser);
        jest.spyOn(bannedUserRepository, 'save').mockResolvedValue(bannedUser);

        const result = await service.banUser(chatRoomId, userId);
        expect(result).toEqual(bannedUser);
    });

    it('should return error if user cannot be banned', async () => {
        jest.spyOn(bannedUserRepository, 'create').mockReturnValue(null);

        const result = await service.banUser(1, 1);
        expect(result).toEqual(new ApiResponse('error', -1005, 'User is not banned.'));
    });

    it('should unban a user', async () => {
        const chatRoomId = 1;
        const userId = 1;
        const bannedUser = new BannedUser();
        bannedUser.chatRoomId = chatRoomId;
        bannedUser.userId = userId;

        jest.spyOn(bannedUserRepository, 'create').mockReturnValue(bannedUser);
        jest.spyOn(bannedUserRepository, 'remove').mockResolvedValue(bannedUser);

        await expect(service.unbanUser(chatRoomId, userId)).resolves.not.toThrow();
    });

    it('should return error if user cannot be unbanned', async () => {
        jest.spyOn(bannedUserRepository, 'create').mockReturnValue(null);
    
        const result = await service.unbanUser(1, 1);
    
        if (result instanceof ApiResponse) {
            expect(result.status).toBe('error');
            expect(result.message).toBe('User is not banned.');
        } else {
            throw new Error('Expected an ApiResponse, but got BannedUser.');
        }
    });
    
});
