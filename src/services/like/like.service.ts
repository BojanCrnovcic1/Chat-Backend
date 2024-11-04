import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like } from "src/entities/like.entity";
import { Message } from "src/entities/message.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like) private readonly likeRepository: Repository<Like>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>
    ) {}

    async getAllLikes(messageId: number): Promise<Like[] | ApiResponse> {
        try {
            const likes = await this.likeRepository.find({where: {messageId: messageId}, 
            relations: ['message', 'user']});
            return likes;
        } catch (error) {
            return new ApiResponse('error', -6003, 'Failed to get likes.');
        }
    }

    async like(userId: number, messageId: number): Promise<Like | ApiResponse> {
        
        const user = await this.userRepository.findOne({where: {userId: userId}});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }

        const message = await this.messageRepository.findOne({ where: { messageId: messageId },
        relations: ['likes'] });
        if (!message) {
            return new ApiResponse('error', -2001, 'Message is not found.');
        }


        const newLike = new Like();
        newLike.user = user;
        newLike.userId = user.userId;
        newLike.message = message;
        newLike.messageId = message.messageId;

        try {
            const savedLike = await this.likeRepository.save(newLike);
            return savedLike;
        } catch (error) {
            return new ApiResponse('error', -6002, 'Like is not saved.');
        }
    }

    async dislike(userId: number, messageId: number): Promise<Like | ApiResponse> {
        const user = await this.userRepository.findOne({where: {userId: userId}});
        if (!user) {
            return new ApiResponse('error', -1001, 'User not found!');
        }

        const message = await this.messageRepository.findOne({ where: { messageId: messageId } });
        if (!message) {
            return new ApiResponse('error', -2001, 'Message is not found.');
        }

        const existingLike = await this.likeRepository.findOne({where: {userId: userId, messageId: messageId}});
        if (!existingLike) {
            return new ApiResponse('error', -6003, 'User did not like this post!');
        }

        try {
            await this.likeRepository.remove(existingLike);
            return existingLike;
        } catch (error) {
            return new ApiResponse('error', -6005, 'Failed to remove like.')
        }
    }
}