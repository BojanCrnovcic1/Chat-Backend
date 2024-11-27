import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { AdminMessage } from "src/entities/admin-message.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { AdminService } from "src/services/administrator/admin.service";

@Controller('admin')
export class AdminController {
    constructor(
        private adminService: AdminService,
    ) {}

    @Get("deletion-requests")
    async getAllDeletionRequests() {
        return await this.adminService.getAllDeletionRequests();
    }

    @Post('send-global-message/:id')
    async sendGlobalMessage(@Param('id') adminId: number, @Body('content') content: string): Promise<AdminMessage> {
        return await this.adminService.sendGlobalMessage(adminId, content);
    }

    @Post('send-message-to-user/:adminId/:userId')
    async sendMessageToUser(
          @Param('adminId') adminId: number,
          @Param('userId') userId: number,
          @Body('content') content: string): Promise<AdminMessage | ApiResponse> {
            return await this.adminService.sendMessageToUser(adminId, userId, content);
          }
    
    @Delete("deletion-requests/:requestId/")
    async handleDeletionRequest(
        @Param("requestId") requestId: number,
    ) {
        return await this.adminService.deleteUserFromRequest(requestId) ;
    }
}