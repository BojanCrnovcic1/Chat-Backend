import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository } from "typeorm";
import { AdminMessage } from "src/entities/admin-message.entity";
import { Admin } from "src/entities/admin.entity";
import { User } from "src/entities/user.entity";
import { AccountDeletionRequest } from "src/entities/account-deletion-request.entity";
import { UserService } from "../user/user.service";
import { NotificationService } from "../notification/notification.service";
import { ApiResponse } from "src/misc/api.response.class";

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin) private readonly adminRepository: Repository<Admin>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(AdminMessage) private readonly adminMessageRepository: Repository<AdminMessage>,
        @InjectRepository(AccountDeletionRequest) private readonly accountDeletionRequestRepository: Repository<AccountDeletionRequest>,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService,
    ) {}

    async getFilterUsers(page: number, pageSize: number, searchTerm: string = ""): Promise<{data: User[], total: number, page: number, pageSize: number}> {
        const [users, total ] = await this.userRepository.findAndCount({
            where: [
                {username: Like(`%${searchTerm}%`)},
                {email: Like(`%${searchTerm}%`)}
            ],
            order: {lastActive: "DESC"},
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return { data: users, total: total, page, pageSize};
    }

    async getById(adminId: number): Promise<Admin | ApiResponse> {
        const admin = await this.adminRepository.findOne({
            where: {adminId: adminId},
            relations: ['adminMessages', 'notifications']});
        if (!admin) {
            return new ApiResponse('error', -9009, 'Admin not found!');
        }
        return admin;
    }

    async getAdminEmail(email: string): Promise<Admin | undefined> {
        return await this.adminRepository.findOne({ where: { email } });
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
        const savedMessage = await this.adminMessageRepository.save(globalMessage);
    
        const users = await this.userRepository.find();
    
        if (!users || users.length === 0) {
            console.warn('No users found for sending notifications.');
            return savedMessage;
        }
    
        const notifications = users
            .filter(user => user && user.userId) 
            .map(user =>
                this.notificationService.createAdminGlobalNotification(
                    adminId,
                    `New global message: ${content}`,
                )
            );
    
        await Promise.all(notifications);
        return savedMessage;
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
        const savedMessage = await this.adminMessageRepository.save(userMessage);
    
        await this.notificationService.createAdminPrivateNotification(
            adminId,
            userId,
            `Admin sent you a message: ${content}`,
            savedMessage.adminMessageId
        );
    
        return savedMessage;
    }

    async deleteUserFromRequest(requestId: number) {
        const deletionRequest = await this.accountDeletionRequestRepository.findOne({
            where: { userId : requestId },
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

         return await this.userRepository.remove(userToDelete);

    }
}
