import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Friend } from "src/entities/friend.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { FriendService } from "src/services/friend/friend.service"
import { Repository } from "typeorm";

describe('FriendService', () => {
    let friendService: FriendService;
    let friendRepository: Repository<Friend>;

    beforeEach(async () => {
        const module:  TestingModule = await Test.createTestingModule({
            providers: [
                FriendService,
                {
                    provide: getRepositoryToken(Friend),
                    useClass: Repository
                }
            ]
        }).compile();

        friendService = module.get<FriendService>(FriendService);
        friendRepository = module.get<Repository<Friend>>(getRepositoryToken(Friend));
    });

    it('should be defined', () =>{
        expect(friendService).toBeDefined();
    });

    describe('sendFriendRequest', () => {
        it('should be send frend request', async () => {
            const friend = new Friend();
            jest.spyOn(friendRepository, 'create').mockReturnValue(new Friend());
            jest.spyOn(friendRepository, 'save').mockResolvedValue(new Friend());

            const resulte = await friendService.sendFriendRequest(1,2);

            expect(friendRepository.create).toHaveBeenCalledWith({
                userId: 1,
                friendId: 2,
                status: 'pending',
            });
            expect(friendRepository.save).toHaveBeenCalledWith(friend);
            expect(resulte).toEqual(friend);
        });
        it('should return an error if the friend request is not saved', async () => {
            jest.spyOn(friendRepository, 'create').mockReturnValue(new Friend());
            jest.spyOn(friendRepository, 'save').mockResolvedValue(null);
      
            const result = await friendService.sendFriendRequest(1, 2);
      
            expect(result).toEqual(new ApiResponse('error', -4001, 'Friend request is not sand.'));
          });
    });

    describe('acceptFriendRequest', () => {
        it('should accept a pending friend request', async () => {
            const friendRequest = new Friend();
            jest.spyOn(friendRepository, 'findOne').mockResolvedValue(friendRequest);
            jest.spyOn(friendRepository, 'save').mockResolvedValue(friendRequest);
        
            const result = await friendService.acceptFriendRequest(1, 2);
        
            expect(friendRepository.findOne).toHaveBeenCalledWith({
                where: { userId: 1, friendId: 2, status: 'pending' },
            });
            expect(friendRequest.status).toBe('accepted');
            expect(friendRepository.save).toHaveBeenCalledWith(friendRequest);
            expect(result).toBe(friendRequest);
        });
        
        it('should return an error if the friend request is not found', async () => {
            jest.spyOn(friendRepository, 'findOne').mockResolvedValue(null);
      
            const result = await friendService.acceptFriendRequest(1, 2);
      
            expect(result).toEqual(new ApiResponse('error', -4002, 'Friend request not found.'));
          });
      
          it('should return an error if the friend request is not accepted', async () => {
            const friendRequest = new Friend();
            jest.spyOn(friendRepository, 'findOne').mockResolvedValue(friendRequest);
            jest.spyOn(friendRepository, 'save').mockResolvedValue(null);
      
            const result = await friendService.acceptFriendRequest(1, 2);
      
            expect(result).toEqual(new ApiResponse('error', -4003, 'Friend request is not accepted.'));
          });
    });

    describe('rejectFriendRequest', () => {
        it('should be rejcet friend request', async () => {
            const friendRequest = new Friend();
            jest.spyOn(friendRepository, 'findOne').mockResolvedValue(friendRequest);
            jest.spyOn(friendRepository, 'remove').mockResolvedValue(friendRequest);

            await friendService.rejectFriendRequest(1,2);

            expect(friendRepository.findOne).toHaveBeenCalledWith({
                where: { userId: 1, friendId: 2, status: 'pending' },
              });
            expect(friendRepository.remove).toHaveBeenCalledWith(friendRequest);
        });

        it('should return an error if the friend request is not found', async () => {
            jest.spyOn(friendRepository, 'findOne').mockResolvedValue(null);
      
            const result = await friendService.rejectFriendRequest(1, 2);
      
            expect(result).toEqual(new ApiResponse('error', -4002, 'Friend request not found.'));
         });
    });
});