import { Body, Controller, Delete, Post } from "@nestjs/common";
import { Friend } from "src/entities/friend.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { FriendService } from "src/services/friend/friend.service";

@Controller('api/friend')
export class FriendController {
    constructor( private friendService: FriendService ) {}

    @Post('send-request')
    async sendRequest(@Body('userId') userId: number, @Body('friendId') friendId: number): Promise<Friend | ApiResponse> {
        return await this.friendService.sendFriendRequest(userId, friendId);
    }

    @Post('accept-request')
    async acceptRequest(@Body('userId') userId: number, @Body('friendId') friendId: number): Promise<Friend | ApiResponse> {
        return await this.friendService.acceptFriendRequest(userId, friendId);
    }

    @Delete('reject-request')
    async rejectRequest(@Body('userId') userId: number, @Body('friendId') friendId: number): Promise<ApiResponse> {
        return await this.friendService.rejectFriendRequest(userId, friendId)
    }
}