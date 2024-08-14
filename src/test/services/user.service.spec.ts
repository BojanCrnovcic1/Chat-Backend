import { Test, TestingModule } from '@nestjs/testing';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiResponse } from 'src/misc/api.response.class';
import { UserService } from 'src/services/user/user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const users = [new User(), new User()];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);

      expect(await service.getAllUsers()).toEqual(users);
    });
  });

  describe('getById', () => {
    it('should return a user if found', async () => {
      const user : User = {
        userId: 1,
        username: 'username',
        email: 'email@gmail.com',
        passwordHash: 'password211',
        profilePicture: null,
        onlineStatus: true,
        createdAt: new Date(),
        chatRoomMembers: null,
        bannedUsers: null,
        likes: null,
        friends: null,
        friends2: null,
        notifications: null,
        messages: null

      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      expect(await service.getById(1)).toEqual(user);
    });

    it('should return an ApiResponse if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      expect(await service.getById(1)).toEqual(new ApiResponse('error', -1001, 'User not found!'));
    });
  });

  describe('getUserEmail', () => {
    it('should return a user by email', async () => {
      const user = new User();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      expect(await service.getUserEmail('test@example.com')).toEqual(user);
    });

    it('should return undefined if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      expect(await service.getUserEmail('test@example.com')).toBeUndefined();
    });
  });

  describe('getUsersUsernames', () => {
    it('should return users matching the username', async () => {
      const users = [new User(), new User()];
      jest.spyOn(userRepository, 'find').mockResolvedValue(users);

      expect(await service.getUsersUsernames('test')).toEqual(users);
    });

    it('should return an empty array if no users are found', async () => {
        jest.spyOn(userRepository, 'find').mockResolvedValue([]);
        expect(await service.getUsersUsernames('test')).toEqual([]);
    });
    
  });

  describe('editUser', () => {
    it('should return the updated user', async () => {
      const user = new User();
      const updatedUser = { ...user, username: 'newUsername' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);

      expect(await service.editUser(1, { username: 'newUsername', password: 'newPassword', prifilePicture: 'newPic' })).toEqual(updatedUser);
    });

    it('should return an ApiResponse if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      expect(await service.editUser(1, { username: 'newUsername', password: 'newPassword', prifilePicture: 'newPic' }))
        .toEqual(new ApiResponse('error', -1001, 'User not found!'));
    });
  });

  describe('registerUser', () => {
    it('should create and return a new user', async () => {
      const newUser = new User();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);

      expect(await service.registerUser({ username: 'test', email: 'test@example.com', password: 'password', profilePicture: 'pic' }))
        .toEqual(newUser);
    });

    it('should return an ApiResponse if the email is already taken', async () => {
      const existingUser = new User();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);

      expect(await service.registerUser({ username: 'test', email: 'test@example.com', password: 'password', profilePicture: 'pic' }))
        .toEqual(new ApiResponse('error', -1002, 'User already exist!'));
    });
  });

  describe('deleteUser', () => {
    it('should delete the user and return it', async () => {
      const user = new User();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'remove').mockResolvedValue(user);

      expect(await service.deleteUser(1)).toEqual(user);
    });

    it('should return an ApiResponse if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      expect(await service.deleteUser(1)).toEqual(new ApiResponse('error', -1001, 'User not found!'));
    });
  });
});
