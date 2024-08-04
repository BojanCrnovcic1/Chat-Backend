import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateChatRoomDto } from "src/dtos/chatRoom/create.chat.room.dto";
import { ChatRoomMember } from "src/entities/chat-room-member.entity";
import { ChatRoom } from "src/entities/chat-room.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { ChatRoomService } from "src/services/chatRoom/chat.room.service";

@Controller('api/room')
export class ChatRoomController {
    constructor(private readonly chatRoomService: ChatRoomService) {}

    @Get()
    findAllRooms(): Promise<ChatRoom[]> {
        return this.chatRoomService.allRooms();
    }

    @Get(':id')
    findOneRoom(@Param('id') chatRoomId: number): Promise<ChatRoom | ApiResponse> {
        return this.chatRoomService.chatRoomById(chatRoomId);
    }

    @Post()
    createRoom(@Body() roomData: CreateChatRoomDto): Promise<ChatRoom | ApiResponse> {
        return this.chatRoomService.createChatRoom(roomData);
    }

    @Patch(':id')
    updateRoom(@Param('id') chatRoomId: number, @Body() roomData: CreateChatRoomDto): Promise<ChatRoom | ApiResponse> {
        return this.chatRoomService.updateChatRoom(chatRoomId, roomData);
    }

    @Delete(':id')
    removeRoom(@Param('id') chatRoomId: number): Promise<ChatRoom | ApiResponse> {
        return this.chatRoomService.removeRoom(chatRoomId);
    }

    @Post('private')
    findOrCreatePrivateChatRoom(
       @Body('userId1') userId1: number,
       @Body('userId2') userId2: number,
    ): Promise<ChatRoom | ApiResponse> {
       return this.chatRoomService.findOrCreatePrivateChatRoom(userId1, userId2);
  }


    @Post(':id/members')
    addMember(
       @Param('id') chatRoomId: number,
       @Body('userId') userId: number,
       @Body('role') role: 'member' | 'admin' = 'member',
    ): Promise<ChatRoomMember | ApiResponse> {
    return this.chatRoomService.addMember(chatRoomId, userId, role);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') chatRoomId: number, @Param('userId') userId: number): Promise<ChatRoomMember | ApiResponse> {
    return this.chatRoomService.removeMember(chatRoomId, userId);
  }
}