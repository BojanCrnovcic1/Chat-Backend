import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RegisterUserDto } from "src/dtos/user/register.user.dto";
import { User } from "src/entities/user";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";
import * as crypto from "crypto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
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

    async updateUser(userId: number, user: Partial<User>): Promise<void> {
        await this.userRepository.update(userId, user);
    }

    async registerUser(data: RegisterUserDto): Promise<User | ApiResponse> {
        const user = await this.getUserEmail(data.email);
        if (user) {
            return new ApiResponse('error', -1002, 'User alredy exist!')
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        const newUser = new User();
        newUser.username = data.username;
        newUser.email = data.email;
        newUser.passwordHash = passwordHashString;
        newUser.profilePicture = data.prifilePicture;

        const savedUser = await this.userRepository.save(newUser);
        if (!savedUser) {
            return new ApiResponse('error', -1004, 'User is not saved!')
        }
        return savedUser;
    }
}