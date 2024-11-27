import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminMessage } from "src/entities/admin-message.entity";
import { Admin } from "src/entities/admin.entity";
import { ChatRoom } from "src/entities/chat-room.entity";
import { Message } from "src/entities/message.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { UserService } from "../user/user.service";
import { ApiResponse } from "src/misc/api.response.class";
import { AccountDeletionRequest } from "src/entities/account-deletion-request.entity";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin) private readonly adminRepository: Repository<Admin>,
        @InjectRepository(AdminMessage) private readonly adminMessageRepository: Repository<AdminMessage>,        
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(AccountDeletionRequest)
         private readonly accountDeletionRequestRepository: Repository<AccountDeletionRequest>,
         private readonly userService: UserService,
    ) {}

    async getAdminEmail(email: string): Promise<Admin | undefined> {
        const admin = await this.adminRepository.findOne({where: {email: email}});
        if (admin) {
            return admin;
        }
        return undefined;
    }

    async getAllDeletionRequests(): Promise<AccountDeletionRequest[]> {
        return await this.accountDeletionRequestRepository.find({
            relations: ['user'],
            select: ['userId', 'requestedAt', 'isReviewed', 'reason'],
        });
    }
    

    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async sendGlobalMessage(adminId: number, content: string): Promise<AdminMessage> {
        const globalMessage = this.adminMessageRepository.create({
            adminId,
            content,
            isGlobal: true,
        });
        return await this.adminMessageRepository.save(globalMessage);
    }

    async sendMessageToUser(adminId: number, userId: number, content: string): Promise<AdminMessage | ApiResponse> {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }

        const userMessage = this.adminMessageRepository.create({
            adminId,
            userId,
            content,
            isGlobal: false,
        });
        return await this.adminMessageRepository.save(userMessage);
    }

    async deleteUserFromRequest(requestId: number): Promise<{ message: string }> {
        const deletionRequest = await this.accountDeletionRequestRepository.findOne({
            where: { accountDeleteId: requestId },
            relations: ["user"],
        });
    
        if (!deletionRequest) {
            throw new Error(`Deletion request with ID ${requestId} not found.`);
        }
    
        if (deletionRequest.isReviewed) {
            throw new Error(`Request with ID ${requestId} has already been reviewed.`);
        }
    
        const userToDelete = await this.userRepository.findOne({
            where: { userId: deletionRequest.userId },
        });
    
        if (!userToDelete) {
            throw new Error(`User with ID ${deletionRequest.userId} not found.`);
        }
    
        await this.userRepository.remove(userToDelete);
    
        deletionRequest.isReviewed = true;
        await this.accountDeletionRequestRepository.save(deletionRequest);
    
        return { message: `User with ID ${deletionRequest.userId} has been deleted, and request marked as reviewed.` };
    }
    
}