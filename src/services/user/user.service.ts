import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterUserDto } from "src/dtos/user/register.user.dto";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Like, Repository } from "typeorm";
import * as crypto from "crypto";
import { UpdateUserDto } from "src/dtos/user/update.user.dto";
import { AccountDeletionRequest } from "src/entities/account-deletion-request.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(AccountDeletionRequest) private readonly accountDeletionRequestRepository: Repository<AccountDeletionRequest>
    ) {}

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async getSearch(username: string): Promise<User[] | undefined> {
        const users = await this.userRepository.find({
            where: { username: Like(`%${username}%`) },
           
        });
        if (users) {
            return users;
        }
        return undefined;
    }

    async getById(userId: number): Promise<User | ApiResponse> {
        const user = await this.userRepository.findOne({
            where: {userId: userId},
            relations: ['friends', 'friends2', 'notifications', 'bannedUsers']});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }
        return user;
    }

    async getUserEmail(email: string): Promise<User | undefined> {
        const user = await this.userRepository.findOne({where: {email: email}});
        if (user) {
            return user;
        }
        return undefined;
    }

    async getUserById(userId: number): Promise<User | null> {
        return this.userRepository.findOne(
            { where: { userId }, relations: ['bannedUsers', 'friends', 'friends2']});
    }

    async getUsersUsernames(username: string): Promise<User[]> {
        try {
            console.log('getUsersUsernames pozvan sa username:', username);
            const users = await this.userRepository.find({
                where: {
                    username: Like(`%${username}%`)
                }
            });
            return users;
        } catch (error) {
            console.error('Greška pri pretrazi korisnika:', error);
            throw new Error('Došlo je do greške prilikom pretrage korisnika.');
        }
    }

    async updateUser(userId: number, user: Partial<User>): Promise<void> {
        await this.userRepository.update(userId, user);
    }

    async editUser(userId: number, data: Partial<UpdateUserDto>): Promise<User | ApiResponse> {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }
    
        if (data.username) user.username = data.username;
        if (data.password) {
            const passwordHash = crypto.createHash('sha512');
            passwordHash.update(data.password);
            user.passwordHash = passwordHash.digest('hex').toUpperCase();
        }
        if (data.profilePicture) user.profilePicture = data.profilePicture;
        if (data.onlineStatus !== undefined) user.onlineStatus = data.onlineStatus;
    
        const savedUser = await this.userRepository.save(user);
        if (!savedUser) {
            return new ApiResponse('error', -1002, 'No user data has been changed.');
        }
        return savedUser;
    }
    
    async createProfilePicture(userId: number, profilePicture: string): Promise<User | ApiResponse> {
        const user = await this.userRepository.findOne({where: {userId: userId}});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }
     
        const newPhoto = new User();
        newPhoto.userId = userId;
        newPhoto.email = user.email;
        newPhoto.passwordHash = user.passwordHash;
        newPhoto.profilePicture = profilePicture;
        const savedProfile = await this.userRepository.save(newPhoto);
        
        if (!savedProfile) {
            return new ApiResponse('error', -1007, 'Profile picture is not saved.')
        }
        return savedProfile;
    }

    async registerUser(data: RegisterUserDto): Promise<User | ApiResponse> {
        console.log('Checking if user exists with email:', data.email);
        const user = await this.getUserEmail(data.email);
        if (user) {
            console.log('User found, returning error response');
            return new ApiResponse('error', -1002, 'User already exist!')
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        const newUser = new User();
        newUser.username = data.username;
        newUser.email = data.email;
        newUser.passwordHash = passwordHashString;
        newUser.profilePicture = data.profilePicture;

        try {
            const savedUser = await this.userRepository.save(newUser);
            return savedUser;
        } catch (error) {
            console.error('Error while saving user:', error);
            console.error('User data:', user);
            return new ApiResponse('error', -1003, 'Error occurred during user update.');
        }
        
    }

    async updateLastLogin(userId: number): Promise<User> {
        
        await this.userRepository.update(userId, { lastActive: new Date() });
    
        const updatedUser = await this.userRepository.findOne({
            where: { userId },
        });
    
        if (!updatedUser) {
            throw new Error('User not found');
        }
    
        return updatedUser;
    }
    

    async requestAccountDeletion(userId: number, reason: string): Promise<AccountDeletionRequest | ApiResponse> {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }
    
        const existingRequest = await this.accountDeletionRequestRepository.findOne({
            where: { user: { userId }, isReviewed: false },
        });
    
        if (existingRequest) {
            return new ApiResponse('error', -1005, 'Deletion request already submitted!');
        }
    
        const deletionRequest = this.accountDeletionRequestRepository.create({
            user: user,
            reason: reason,
        });
    
        await this.accountDeletionRequestRepository.save(deletionRequest);
        return new ApiResponse('success', 0, 'Deletion request submitted successfully.');
    }
    

}