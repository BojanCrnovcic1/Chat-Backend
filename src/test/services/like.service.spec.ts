import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from 'src/services/like/like.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from 'src/entities/like.entity';
import { User } from 'src/entities/user.entity';
import { Message } from 'src/entities/message.entity';
import { ApiResponse } from 'src/misc/api.response.class';

describe('LikeService', () => {
    let service: LikeService;
    let likeRepository: Repository<Like>;
    let userRepository: Repository<User>;
    let messageRepository: Repository<Message>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LikeService,
                {
                    provide: getRepositoryToken(Like),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(User),
                    useClass: Repository,
                },
                {
                    provide: getRepositoryToken(Message),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<LikeService>(LikeService);
        likeRepository = module.get<Repository<Like>>(getRepositoryToken(Like));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllLikes', () => {
        it('should return a list of likes', async () => {
            const likes = [new Like()];
            jest.spyOn(likeRepository, 'find').mockResolvedValue(likes);

            const result = await service.getAllLikes(1);
            expect(result).toEqual(likes);
        });

        it('should return an error if there is an exception', async () => {
            jest.spyOn(likeRepository, 'find').mockRejectedValue(new Error());

            const result = await service.getAllLikes(1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-6003);
        });
    });

    describe('like', () => {
        it('should like a message', async () => {
            const user = new User();
            const message = new Message();
            const like = new Like();

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
            jest.spyOn(likeRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(likeRepository, 'save').mockResolvedValue(like);

            const result = await service.like(1, 1);
            expect(result).toEqual(like);
        });

        it('should return error if user is not found', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            const result = await service.like(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-1001);
        });

        it('should return error if message is not found', async () => {
            const user = new User();
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(null);

            const result = await service.like(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-2001);
        });

        it('should return error if user already liked the message', async () => {
            const user = new User();
            const message = new Message();
            const like = new Like();

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
            jest.spyOn(likeRepository, 'findOne').mockResolvedValue(like);

            const result = await service.like(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-6008);
        });

        it('should return error if like is not saved', async () => {
            const user = new User();
            const message = new Message();

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
            jest.spyOn(likeRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(likeRepository, 'save').mockRejectedValue(new Error());

            const result = await service.like(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-6002);
        });
    });

    describe('dislike', () => {
        it('should dislike a message', async () => {
            const user = new User();
            const message = new Message();
            const like = new Like();

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
            jest.spyOn(likeRepository, 'findOne').mockResolvedValue(like);
            jest.spyOn(likeRepository, 'remove').mockResolvedValue(like);

            const result = await service.dislike(1, 1);
            expect(result).toEqual(like);
        });

        it('should return error if user is not found', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            const result = await service.dislike(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-1001);
        });

        it('should return error if message is not found', async () => {
            const user = new User();
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(null);

            const result = await service.dislike(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-2001);
        });

        it('should return error if like does not exist', async () => {
            const user = new User();
            const message = new Message();

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
            jest.spyOn(likeRepository, 'findOne').mockResolvedValue(null);

            const result = await service.dislike(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-6003);
        });

        it('should return error if like is not removed', async () => {
            const user = new User();
            const message = new Message();
            const like = new Like();

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(messageRepository, 'findOne').mockResolvedValue(message);
            jest.spyOn(likeRepository, 'findOne').mockResolvedValue(like);
            jest.spyOn(likeRepository, 'remove').mockRejectedValue(new Error());

            const result = await service.dislike(1, 1);
            expect(result).toBeInstanceOf(ApiResponse);
            expect((result as ApiResponse).status).toBe('error');
            expect((result as ApiResponse).statusCode).toBe(-6005);
        });
    });
});
