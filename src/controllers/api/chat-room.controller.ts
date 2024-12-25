import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { AuthGuard } from "src/auth/auth.gaurd";
import { AuthService } from "src/auth/auth.service";
import { Roles } from "src/auth/roles.decorator";
import { CreateChatRoomDto } from "src/dtos/chatRoom/create.chat.room.dto";
import { ChatRoomMember } from "src/entities/chat-room-member.entity";
import { ChatRoom } from "src/entities/chat-room.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { ChatRoomService } from "src/services/chatRoom/chat.room.service";
import { MessageService } from "src/services/message/message.service";

@Controller('api/room')
export class ChatRoomController {
    constructor(
      private readonly chatRoomService: ChatRoomService,
      private readonly messageService: MessageService,
      private authService: AuthService
      ) {}

      @Get('filter-rooms')
      @UseGuards(AuthGuard)
      @Roles('admin')
      async paginateChatRooms(
          @Query('page') page: number = 1,
          @Query('pageSize') pageSize: number = 10,
          @Query('searchTerm') searchTerm: string = ""
      ): Promise<{
          data: { chatRoom: ChatRoom, isGroup: boolean, members: User[] }[],
          total: number,
          page: number,
          pageSize: number
      }> {
          return await this.chatRoomService.paginateRooms(page, pageSize, searchTerm);
      }
      
      @Get('user/groups')
      async getUserGroupRooms(@Req() req: Request): Promise<ChatRoom[]> {
      const user = await this.authService.getCurrentUser(req);
          if (!user || !user.userId) {
              new ApiResponse('error', -1009, 'User not authorized');
          }
          const userId = user.userId;
  
      return this.chatRoomService.getUserGroupRoomS(userId);
    }

    @Get()
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    findAllRooms(): Promise<ChatRoom[]> {
        return this.chatRoomService.allRooms();
    }

    @Get(':id/currentRoom')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    findCurrentUserRoom(@Param('id') userId: number): Promise<ChatRoom | ApiResponse> {
      return this.chatRoomService.getUserCurrentRoom(userId);
    }

    @Get(':id/members')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    getAllMembers(@Param('id') chatRoomId: number): Promise<User[] | ApiResponse> {
      return this.chatRoomService.getRoomMembers(chatRoomId);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    findOneRoom(@Param('id') chatRoomId: number): Promise<ChatRoom | ApiResponse> {
        return this.chatRoomService.chatRoomById(chatRoomId);
    }

    @Get('check-room/:userId/:friendId')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    async checkRoom(@Param('userId') userId: number,@Param('friendId') friendId: number,) {
    const existingRoom = await this.chatRoomService.findRoomByUsers(userId, friendId);
    if (existingRoom) {
      return { roomId: existingRoom};
    }
    return { roomId: null };
  }

    @Post('createRoom')
    @UseGuards(AuthGuard)
    @Roles('user')
    async createRoom(@Body() roomData: CreateChatRoomDto, @Req() req: Request): Promise<ChatRoom | ApiResponse> {
      const user = await this.authService.getCurrentUser(req);
          if (!user || !user.userId) {
              new ApiResponse('error', -1009, 'User not authorized');
          }
          const userId = user.userId;

        return this.chatRoomService.createChatRoom(roomData, userId);
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    updateRoom(@Param('id') chatRoomId: number, @Body() roomData: CreateChatRoomDto): Promise<ChatRoom | ApiResponse> {
        return this.chatRoomService.updateChatRoom(chatRoomId, roomData);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Roles('admin', 'user')
    removeRoom(@Param('id') chatRoomId: number): Promise<ChatRoom | ApiResponse> {
        return this.chatRoomService.removeRoom(chatRoomId);
    }

    @Post('private')
    @UseGuards(AuthGuard)
    @Roles('user')
    findOrCreatePrivateChatRoom(
       @Body('userId1') userId1: number,
       @Body('userId2') userId2: number,
    ): Promise<ChatRoom | ApiResponse> {
        
       return this.chatRoomService.createOrFindRoom(userId1, userId2);
  }


    @Post(':id/members')
    @UseGuards(AuthGuard)
    @Roles('user')
    addMember(
       @Param('id') chatRoomId: number,
       @Body('userId') userId: number,
       @Body('role') role: 'member' | 'admin' = 'member',
    ): Promise<ChatRoomMember | ApiResponse> {
    return this.chatRoomService.addMember(chatRoomId, userId, role);
  }

  @Delete(':id/members/:userId')
  @UseGuards(AuthGuard)
  @Roles('user')
  async removeMember(@Param('id') chatRoomId: number, @Req() req: Request, @Param('userId') userId: number): Promise<ChatRoomMember | ApiResponse> {
    const user = await this.authService.getCurrentUser(req);
          if (!user || !user.userId) {
              new ApiResponse('error', -1009, 'User not authorized');
          }
          const adminId = user.userId;

    return this.chatRoomService.removeMember(chatRoomId, adminId, userId);
  }
}