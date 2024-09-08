import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterUserDto } from "src/dtos/user/register.user.dto";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Like, Repository } from "typeorm";
import * as crypto from "crypto";
import { UpdateUserDto } from "src/dtos/user/update.user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
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
        const user = await this.userRepository.findOne({where: {userId: userId}});
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
        return this.userRepository.findOne({ where: { userId } });
    }

    async getUsersUsernames(username: string): Promise<User[]> {
        try {
            console.log('getUsersUsernames pozvan sa username:', username);
            const users = await this.userRepository.find({
                where: {
                    username: Like(`%${username}%`)
                }
            });
            console.log('Pronađeni korisnici:', users);
            return users;
        } catch (error) {
            console.error('Greška pri pretrazi korisnika:', error);
            throw new Error('Došlo je do greške prilikom pretrage korisnika.');
        }
    }

    async updateUser(userId: number, user: Partial<User>): Promise<void> {
        await this.userRepository.update(userId, user);
    }

    async editUser(userId: number, data: UpdateUserDto): Promise<User | ApiResponse> {
        const user = await this.userRepository.findOne({where: {userId: userId}});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        user.username = data.username;
        user.passwordHash = passwordHashString;
        user.profilePicture = data.prifilePicture;

        const savedUser = await this.userRepository.save(user);
        if (!savedUser) {
            return new ApiResponse('error', -1002, 'No user data has been changed.')
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

        const savedUser = await this.userRepository.save(newUser);
        if (!savedUser) {
            return new ApiResponse('error', -1004, 'User is not saved!')
        }
        return savedUser;
    }

    async deleteUser(userId: number): Promise<User | ApiResponse> {
        const user = await this.userRepository.findOne({where: {userId: userId}});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }
        return await this.userRepository.remove(user);
    }

}