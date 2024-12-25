import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.gaurd";
import { AuthService } from "src/auth/auth.service";
import { Roles } from "src/auth/roles.decorator";
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
    @UseGuards(AuthGuard)
    @Roles('user')
    async allFriends(@Req() req: Request): Promise<Friend[] | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.getFriends(userId);
    }

    @Get(':userId/unread-messages-count')
    @UseGuards(AuthGuard)
    @Roles('user')
    async getUnreadMessagesCountForFriends(@Req() req: Request): Promise<any[] | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.getFriendsWithUnreadNotifications(userId);
    }

    @Post('send-request')
    @UseGuards(AuthGuard)
    @Roles('user')
    async sendRequest(@Req() req: Request, @Body('friendId') friendId: number): Promise<Friend | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.sendFriendRequest(userId, friendId);
    }

    @Post('accept-request')
    @UseGuards(AuthGuard)
    @Roles('user')
    async acceptRequest(@Req() req: Request, @Body('friendId') friendId: number): Promise<Friend | ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.acceptFriendRequest(userId, friendId);
    }

    @Delete('reject-request')
    @UseGuards(AuthGuard)
    @Roles('user')
    async rejectRequest(@Req() req: Request, @Body('friendId') friendId: number): Promise<ApiResponse> {
        const user = await this.authService.getCurrentUser(req);
        if (!user || !user.userId) {
            return new ApiResponse('error', -1009, 'User not authorized');
        }
        const userId = user.userId;
        return await this.friendService.rejectFriendRequest(userId, friendId);
    }
}
