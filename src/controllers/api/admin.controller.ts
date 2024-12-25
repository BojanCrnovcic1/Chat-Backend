import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.gaurd";
import { Roles } from "src/auth/roles.decorator";
import { AdminMessage } from "src/entities/admin-message.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { AdminService } from "src/services/administrator/admin.service";

@Controller('api/admin')
export class AdminController {
    constructor(
        private adminService: AdminService,
    ) {}

    @Get('filter-users')
    @UseGuards(AuthGuard)
    @Roles('admin')
    async filterUsers(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
        @Query('searchTerm') searchTerm: string = "") {
        return await this.adminService.getFilterUsers(page, pageSize, searchTerm)
    }

    @Get("deletion-requests")
    @UseGuards(AuthGuard)
    @Roles('admin')
    async getAllDeletionRequests() {
        return await this.adminService.getAllDeletionRequests();
    }

    @Post('send-global-message/:id')
    @UseGuards(AuthGuard)
    @Roles('admin')
    async sendGlobalMessage(@Param('id') adminId: number, @Body('content') content: string): Promise<AdminMessage | ApiResponse> {
        return await this.adminService.sendGlobalMessage(adminId, content);
    }

    @Post('send-message-to-user/:adminId/:userId')
    @UseGuards(AuthGuard)
    @Roles('admin')
    async sendMessageToUser(
          @Param('adminId') adminId: number,
          @Param('userId') userId: number,
          @Body('content') content: string): Promise<AdminMessage | ApiResponse> {
            return await this.adminService.sendMessageToUser(adminId, userId, content);
          }
    
    @Delete("deletion-requests/:requestId/")
    @UseGuards(AuthGuard)
    @Roles('admin')
    async handleDeletionRequest(
        @Param("requestId") requestId: number,
    ) {
        return await this.adminService.deleteUserFromRequest(requestId) ;
    }
}