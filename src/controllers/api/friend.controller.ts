import { Body, Controller, Delete, Get, Param, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "src/auth/auth.service";
import { Friend } from "src/entities/friend.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { FriendService } from "src/services/friend/friend.service";

@Controller('api/friend')
export class FriendController {
    constructor( 
        private friendService: FriendService,
        private authService: AuthService,
     ) {}

    @Get(':id/friends')
    async allFriends(@Param('id') friendId: number): Promise<Friend[]> {
        return await this.friendService.getFreands(friendId);
    }

    @Post('send-request')
    async sendRequest(@Req() req: Request, @Body('friendId') friendId: number): Promise<Friend | ApiResponse> {
        const user =  await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.sendFriendRequest(userId, friendId);
    }

    @Post('accept-request')
    async acceptRequest(@Req() req: Request, @Body('friendId') friendId: number): Promise<Friend | ApiResponse> {
        const user =  await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.acceptFriendRequest(userId, friendId);
    }

    @Delete('reject-request')
    async rejectRequest(@Req() req: Request, @Body('friendId') friendId: number): Promise<ApiResponse> {
        const user =  await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.rejectFriendRequest(userId, friendId)
    }
}