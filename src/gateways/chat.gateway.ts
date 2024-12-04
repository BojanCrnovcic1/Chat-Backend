import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('subscribeToNotifications')
    handleUserSubscription(client: Socket, payload: { userId: number }): void {
        client.join(`user_${payload.userId}`);
    }

    notifyUser(userId: number, message: string, chatRoomId?: number, messageId?: number, adminMessageId?: number): void {
        if (userId) {
            this.server.to(`user_${userId}`).emit('notification', { message, chatRoomId, messageId, adminMessageId });
        } else {
            console.error(`Invalid user ID: ${userId}`);
        }
    }

    @SubscribeMessage('subscribeToAdminNotifications')
    handleAdminSubscription(client: Socket, payload: { adminId: number }): void {
        client.join(`admin_${payload.adminId}`);
    }

    notifyAdmin(adminId: number, message: string): void {
        this.server.to(`admin_${adminId}`).emit('adminNotification', { message });
    }

    @SubscribeMessage('sendMessage')
    handleMessage(client: Socket, payload: { sender: string, message: string }): void {
        this.server.emit('receiveMessage', payload);
    }

    broadcastMessage(event: string, payload: any): void {
        if (this.server) {
            this.server.emit(event, payload);
        } else {
            console.error('WebSocket server is not initialized');
        }
    }
}
