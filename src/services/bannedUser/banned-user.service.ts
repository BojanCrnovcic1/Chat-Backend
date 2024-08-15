import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BannedUser } from "src/entities/banned-user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class BannedUserService {
    constructor(
        @InjectRepository(BannedUser) private readonly bannedUserRepository: Repository<BannedUser>,
    ) {}
    
    async banUser(chatRoomId: number, userId: number): Promise<BannedUser | ApiResponse> {
        const bannedUser = this.bannedUserRepository.create({
            chatRoomId,
            userId,
            bannedAt: new Date()
        }) 
        if (!bannedUser) {
            return new ApiResponse('error', -1005, 'User is not banned.')
        }
        const saveBan = await this.bannedUserRepository.save(bannedUser);
        if (!saveBan) {
            return new ApiResponse('error', -1006, 'Is not save user ban.')
        }
        return saveBan;
    }

    async unbanUser(chatRoomId: number, userId: number): Promise<BannedUser | ApiResponse> {
        const bannedUser = this.bannedUserRepository.create({
            chatRoomId,
            userId,
            bannedAt: new Date()
        }) 
        if (!bannedUser) {
            return new ApiResponse('error', -1005, 'User is not banned.')
        }
        await this.bannedUserRepository.remove(bannedUser);
    }
}